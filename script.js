// Talabat Food Delivery App JavaScript - FINAL CORRECTED VERSION

// 1. FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyBNDBNa8Hdaqv7PPKoJjdnDHymnXqUYOXo",
  authDomain: "mytalabatapp-ad5a5.firebaseapp.com",
  projectId: "mytalabatapp-ad5a5",
  storageBucket: "mytalabatapp-ad5a5.firebasestorage.app",
  messagingSenderId: "891231122044",
  appId: "1:891231122044:web:1447d56a4a579606060ff9"
};

// 2. INITIALIZE FIREBASE (Compat Mode)
// Check if apps are already initialized to prevent reloading errors
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// 3. GLOBAL VARIABLES
let currentUser = null;
let currentUserRole = null;
let selectedRestaurant = null;
let cart = {}; 
let isDriverOnline = false;

// --- AUTHENTICATION & STARTUP ---

auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        // Check the database to find out if this user is a Driver, Admin, or Customer
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            currentUserRole = userDoc.data().role;
            localStorage.setItem('userRole', currentUserRole);
            localStorage.setItem('userEmail', user.email);
            
            // Restore restaurant selection if refreshing page
            const savedRest = localStorage.getItem('selectedRestaurant');
            if (savedRest) selectedRestaurant = JSON.parse(savedRest);

            // If we are still on the login screen, move to dashboard
            const authPage = document.getElementById('auth-page');
            if (authPage && authPage.classList.contains('active')) {
                showDashboard(currentUserRole);
            }
        }
    } else {
        // User is logged out
        showPage('auth-page');
    }
});

// Run this when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Icons
    if(typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Hide loading screen after 1 second
    setTimeout(() => {
        const loader = document.getElementById('loading-screen');
        if(loader) loader.style.display = 'none';
    }, 1000);
    
    // Hide the config notice if it exists
    const notice = document.getElementById('firebase-notice');
    if(notice) notice.style.display = 'none';
});

// --- NAVIGATION & UTILITIES ---

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    const target = document.getElementById(pageId);
    if(target) target.classList.add('active');
}

function showToast(title, message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return; // Guard clause
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<div class="toast-title">${title}</div><div class="toast-message">${message}</div>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

function setLoading(buttonId, isLoading) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    if (isLoading) {
        btn.dataset.original = btn.textContent;
        btn.textContent = 'Processing...';
        btn.disabled = true;
    } else {
        btn.textContent = btn.dataset.original || 'Submit';
        btn.disabled = false;
    }
}

function getBadgeClass(status) {
    const map = {
        'pending': 'warning', 'approved': 'success', 'rejected': 'error',
        'online': 'success', 'offline': 'secondary', 'delivered': 'success',
        'preparing': 'warning', 'ready': 'success', 'picked_up': 'warning',
        'accepted': 'success'
    };
    return map[status] || 'secondary';
}

function formatStatus(status) {
    return status ? status.replace('_', ' ').toUpperCase() : '';
}

// --- AUTH ACTIONS (LOGIN / REGISTER) ---

// Expose functions to window so HTML buttons can see them
window.switchTab = function(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    if (tab === 'login') {
        document.querySelector('.tab-btn:first-child').classList.add('active');
        document.getElementById('login-form').classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('register-form').classList.add('active');
    }
}

window.handleLogin = async function(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    setLoading('login-btn', true);
    try {
        await auth.signInWithEmailAndPassword(email, password);
        showToast('Success', 'Login successful');
    } catch (error) {
        showToast('Error', error.message, 'error');
    } finally {
        setLoading('login-btn', false);
    }
}

window.handleRegister = async function(event) {
    event.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('confirm-password').value;
    const role = document.getElementById('user-role').value;
    
    if (password !== confirm) return showToast('Error', 'Passwords do not match', 'error');
    if (!role) return showToast('Error', 'Select a role', 'error');
    
    setLoading('register-btn', true);
    try {
        const cred = await auth.createUserWithEmailAndPassword(email, password);
        
        // Save the Role
        await db.collection('users').doc(cred.user.uid).set({
            email: email,
            role: role,
            createdAt: new Date()
        });

        // If Restaurant, create profile
        if (role === 'restaurant') {
            await db.collection('restaurants').doc(cred.user.uid).set({
                name: email.split('@')[0] + "'s Kitchen",
                email: email,
                status: 'pending',
                cuisine: 'General',
                deliveryFee: 5.00,
                rating: 5.0
            });
        }
        
        showToast('Success', 'Account created!');
    } catch (error) {
        showToast('Error', error.message, 'error');
    } finally {
        setLoading('register-btn', false);
    }
}

window.logout = async function() {
    await auth.signOut();
    localStorage.clear();
    location.reload(); 
}

// --- DASHBOARD ROUTING ---

window.showDashboard = function(role) {
    const map = {
        'admin': 'admin-dashboard',
        'restaurant': 'restaurant-dashboard',
        'customer': 'customer-dashboard',
        'driver': 'driver-dashboard'
    };
    if(map[role]) showPage(map[role]);
    
    // Initialize specific data
    if (role === 'admin') loadRestaurantsTable();
    if (role === 'restaurant') loadRestaurantData();
    if (role === 'customer') loadCustomerData();
    if (role === 'driver') loadDriverData();
}

window.switchDashboardTab = function(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.dashboard-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    
    // Show selected tab
    const tabEl = document.getElementById(tabName + '-tab');
    if(tabEl) tabEl.classList.add('active');
    
    // Highlight button (assuming event is passed or we find it)
    if(event && event.target) event.target.classList.add('active');
    
    // Load data
    if (tabName === 'restaurants') loadRestaurantsTable();
    if (tabName === 'orders') loadOrdersTable();
    if (tabName === 'restaurant-orders') loadRestaurantOrders();
    if (tabName === 'menu-management') loadMenuItems();
    if (tabName === 'restaurants-list') loadRestaurantsList();
    if (tabName === 'customer-orders') loadCustomerOrders();
}

// --- ADMIN SECTION ---

window.loadRestaurantsTable = async function() {
    const tbody = document.getElementById('restaurants-table');
    if(!tbody) return;
    tbody.innerHTML = 'Loading...';
    
    const snap = await db.collection('restaurants').get();
    tbody.innerHTML = '';
    
    snap.forEach(doc => {
        const r = doc.data();
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.name}</td>
            <td>${r.email}</td>
            <td><span class="badge ${getBadgeClass(r.status)}">${formatStatus(r.status)}</span></td>
            <td>-</td>
            <td>
                ${r.status === 'pending' ? `
                <button class="btn btn-primary" onclick="adminApprove('${doc.id}', 'approved')">Approve</button>
                <button class="btn btn-outline" onclick="adminApprove('${doc.id}', 'rejected')">Reject</button>
                ` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.adminApprove = async function(id, status) {
    await db.collection('restaurants').doc(id).update({ status: status });
    loadRestaurantsTable();
}

window.loadOrdersTable = async function() {
    const tbody = document.getElementById('orders-table');
    if(!tbody) return;
    tbody.innerHTML = 'Loading...';
    
    // NOTE: If this fails, check console for Firestore Index link
    const snap = await db.collection('orders').orderBy('createdAt', 'desc').limit(20).get();
    tbody.innerHTML = '';
    
    snap.forEach(doc => {
        const o = doc.data();
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${doc.id.slice(0,5)}</td>
            <td>${o.restaurantName}</td>
            <td>${o.customerEmail}</td>
            <td>${o.driverEmail || 'None'}</td>
            <td>${formatStatus(o.status)}</td>
            <td>$${o.total}</td>
            <td>-</td>
        `;
        tbody.appendChild(tr);
    });
}

// --- RESTAURANT SECTION ---

window.loadRestaurantData = function() {
    loadRestaurantOrders();
    // Real-time listener for new orders
    if (auth.currentUser) {
        db.collection('orders')
          .where('restaurantId', '==', auth.currentUser.uid)
          .onSnapshot(() => loadRestaurantOrders());
    }
}

window.loadRestaurantOrders = async function() {
    const div = document.getElementById('restaurant-orders-list');
    if(!div) return;
    
    // NOTE: Firestore might require an index for this query (restaurantId + createdAt)
    const snap = await db.collection('orders')
        .where('restaurantId', '==', auth.currentUser.uid)
        .orderBy('createdAt', 'desc')
        .get();
        
    div.innerHTML = '';
    if (snap.empty) div.innerHTML = '<p>No orders found.</p>';
    
    snap.forEach(doc => {
        const o = doc.data();
        const card = document.createElement('div');
        card.className = 'order-card';
        card.innerHTML = `
            <div class="order-header">
                <h4>Order #${doc.id.slice(0,5)}</h4>
                <span class="badge ${getBadgeClass(o.status)}">${formatStatus(o.status)}</span>
            </div>
            <p>Customer: ${o.customerEmail}</p>
            <p>Items: ${o.items.map(i => i.name).join(', ')}</p>
            <p>Total: $${o.total}</p>
            <div class="order-actions">
                ${o.status === 'pending' ? `
                    <button class="btn btn-primary" onclick="updateOrderStatus('${doc.id}', 'accepted')">Accept</button>
                    <button class="btn btn-outline" onclick="updateOrderStatus('${doc.id}', 'rejected')">Reject</button>` : ''}
                ${o.status === 'accepted' ? `<button class="btn btn-primary" onclick="updateOrderStatus('${doc.id}', 'preparing')">Start Preparing</button>` : ''}
                ${o.status === 'preparing' ? `<button class="btn btn-primary" onclick="updateOrderStatus('${doc.id}', 'ready')">Mark Ready for Driver</button>` : ''}
            </div>
        `;
        div.appendChild(card);
    });
}

window.updateOrderStatus = async function(id, status) {
    await db.collection('orders').doc(id).update({ status: status });
    showToast('Updated', `Order marked as ${status}`);
    loadRestaurantOrders();
}

// --- RESTAURANT MENU ---

window.loadMenuItems = async function() {
    const list = document.getElementById('menu-items-list');
    if(!list) return;
    
    const snap = await db.collection('menuItems').where('restaurantId', '==', auth.currentUser.uid).get();
    
    list.innerHTML = '';
    snap.forEach(doc => {
        const item = doc.data();
        const card = document.createElement('div');
        card.className = 'menu-item-card';
        card.innerHTML = `
            <div>
                <b>${item.name}</b><br>${item.description}<br>$${item.price}
            </div>
            <button class="btn btn-outline" onclick="deleteMenuItem('${doc.id}')">Delete</button>
        `;
        list.appendChild(card);
    });
}

window.showAddItemModal = function() { document.getElementById('add-item-modal').classList.add('active'); }
window.hideAddItemModal = function() { document.getElementById('add-item-modal').classList.remove('active'); }

window.addMenuItem = async function(e) {
    e.preventDefault();
    const name = document.getElementById('item-name').value;
    const desc = document.getElementById('item-description').value;
    const price = document.getElementById('item-price').value;
    
    await db.collection('menuItems').add({
        restaurantId: auth.currentUser.uid,
        name: name,
        description: desc,
        price: parseFloat(price),
        available: true
    });
    
    hideAddItemModal();
    loadMenuItems();
    showToast('Success', 'Item Added');
}

window.deleteMenuItem = async function(id) {
    if(confirm('Delete?')) {
        await db.collection('menuItems').doc(id).delete();
        loadMenuItems();
    }
}

// --- CUSTOMER SECTION ---

window.loadCustomerData = function() {
    loadRestaurantsList();
    loadCustomerOrders();
}

window.loadRestaurantsList = async function() {
    const grid = document.getElementById('restaurants-grid');
    if(!grid) return;
    grid.innerHTML = 'Loading...';
    
    const snap = await db.collection('restaurants').where('status', '==', 'approved').get();
    grid.innerHTML = '';
    
    snap.forEach(doc => {
        const r = doc.data();
        const card = document.createElement('div');
        card.className = 'restaurant-card';
        card.onclick = () => openRestaurantMenu(doc.id, r);
        card.innerHTML = `
            <div class="restaurant-image">🍽️</div>
            <div class="restaurant-info">
                <h3>${r.name}</h3>
                <p>${r.cuisine}</p>
                <small>Fee: $${r.deliveryFee}</small>
            </div>
        `;
        grid.appendChild(card);
    });
}

window.openRestaurantMenu = async function(id, restaurant) {
    selectedRestaurant = { id: id, ...restaurant };
    
    // Save to local storage in case of refresh
    localStorage.setItem('selectedRestaurant', JSON.stringify(selectedRestaurant));

    document.getElementById('restaurants-view').style.display = 'none';
    document.getElementById('restaurant-menu-view').style.display = 'block';
    
    const nameEl = document.getElementById('selected-restaurant-name');
    if(nameEl) nameEl.textContent = restaurant.name;
    
    const cartNameEl = document.getElementById('cart-restaurant-name');
    if(cartNameEl) cartNameEl.textContent = restaurant.name;
    
    // Load Menu
    const grid = document.getElementById('menu-items-grid');
    grid.innerHTML = 'Loading...';
    const snap = await db.collection('menuItems').where('restaurantId', '==', id).get();
    
    grid.innerHTML = '';
    snap.forEach(doc => {
        const item = doc.data();
        const card = document.createElement('div');
        card.className = 'menu-item-card';
        card.innerHTML = `
            <div>
                <b>${item.name}</b><br>${item.description}<br>$${item.price}
            </div>
            <button class="btn btn-primary" onclick="addToCart('${doc.id}', '${item.name}', ${item.price})">Add</button>
        `;
        grid.appendChild(card);
    });
}

window.backToRestaurants = function() {
    document.getElementById('restaurants-view').style.display = 'block';
    document.getElementById('restaurant-menu-view').style.display = 'none';
    cart = {};
    updateCartDisplay();
}

// --- CART LOGIC ---

window.addToCart = function(id, name, price) {
    if (!cart[id]) cart[id] = { name, price, qty: 0 };
    cart[id].qty++;
    updateCartDisplay();
}

window.updateCartDisplay = function() {
    const container = document.getElementById('cart-items');
    let total = 0;
    let html = '';
    let count = 0;
    
    Object.keys(cart).forEach(key => {
        const item = cart[key];
        total += item.price * item.qty;
        count += item.qty;
        html += `<div class="cart-item">
            <span>${item.name} x${item.qty}</span>
            <span>$${(item.price * item.qty).toFixed(2)}</span>
        </div>`;
    });
    
    // Safety check: ensure selectedRestaurant exists
    const fee = selectedRestaurant ? selectedRestaurant.deliveryFee : 0;
    
    if(container) container.innerHTML = html || '<p>Empty Cart</p>';
    
    const sub = document.getElementById('subtotal');
    if(sub) sub.textContent = `$${total.toFixed(2)}`;
    
    const del = document.getElementById('delivery-fee');
    if(del) del.textContent = `$${fee.toFixed(2)}`;
    
    const final = document.getElementById('final-total');
    if(final) final.textContent = `$${(total + fee).toFixed(2)}`;
    
    const countEl = document.getElementById('cart-count');
    if(countEl) countEl.textContent = count;
    
    if(count > 0) {
        document.getElementById('cart-button').style.display = 'flex';
        document.getElementById('cart-total').style.display = 'block';
    }
}

window.placeOrder = async function() {
    if (Object.keys(cart).length === 0) return;
    
    const finalTotalEl = document.getElementById('final-total');
    const total = parseFloat(finalTotalEl.textContent.replace('$', ''));
    
    const itemsList = [];
    Object.values(cart).forEach(i => itemsList.push({ name: i.name, qty: i.qty }));
    
    await db.collection('orders').add({
        restaurantId: selectedRestaurant.id,
        restaurantName: selectedRestaurant.name,
        customerId: auth.currentUser.uid,
        customerEmail: auth.currentUser.email,
        driverId: null, // No driver yet
        items: itemsList,
        total: total,
        status: 'pending',
        createdAt: new Date()
    });
    
    cart = {};
    updateCartDisplay();
    backToRestaurants();
    showToast('Success', 'Order Placed');
}

window.loadCustomerOrders = async function() {
    const div = document.getElementById('customer-orders-list');
    if(!div) return;
    
    // NOTE: If console error, create Index for customerId + createdAt
    const snap = await db.collection('orders')
        .where('customerId', '==', auth.currentUser.uid)
        .orderBy('createdAt', 'desc')
        .get();
    
    div.innerHTML = '';
    snap.forEach(doc => {
        const o = doc.data();
        const card = document.createElement('div');
        card.className = 'order-card';
        card.innerHTML = `
            <b>${o.restaurantName}</b>
            <span class="badge ${getBadgeClass(o.status)}">${formatStatus(o.status)}</span>
            <p>Total: $${o.total}</p>
        `;
        div.appendChild(card);
    });
}

// --- DRIVER SECTION ---

window.loadDriverData = function() {
    const toggle = document.getElementById('driver-online-status');
    if (toggle) toggle.checked = isDriverOnline;
    
    const statusText = document.getElementById('driver-status-text');
    if(statusText) statusText.textContent = isDriverOnline ? "Online" : "Offline";
    
    const notice = document.getElementById('offline-notice');
    if(notice) notice.style.display = isDriverOnline ? 'none' : 'block';
    
    if (isDriverOnline) loadAvailableDriverOrders();
    loadMyDeliveries();
}

window.toggleDriverStatus = function() {
    isDriverOnline = !isDriverOnline;
    loadDriverData();
}

window.loadAvailableDriverOrders = async function() {
    const div = document.getElementById('available-orders-list');
    if(!div) return;
    
    if (!isDriverOnline) {
        div.innerHTML = '<p>You are offline.</p>';
        return;
    }
    
    div.innerHTML = 'Searching...';
    // Find orders that are ready but have no driver
    const snap = await db.collection('orders')
        .where('status', '==', 'ready')
        .get();
        
    div.innerHTML = '';
    let found = false;
    
    snap.forEach(doc => {
        const o = doc.data();
        // Manual filter for no driver (safer for Firestore indexes)
        if (!o.driverId) {
            found = true;
            const card = document.createElement('div');
            card.className = 'order-card available';
            card.innerHTML = `
                <h4>${o.restaurantName}</h4>
                <p>Deliver to: ${o.customerEmail}</p>
                <p>Pay: $${(o.total * 0.2).toFixed(2)}</p>
                <button class="btn btn-primary btn-full" onclick="driverAccept('${doc.id}')">Accept</button>
            `;
            div.appendChild(card);
        }
    });
    
    if (!found) div.innerHTML = '<p>No orders ready for pickup.</p>';
}

window.driverAccept = async function(id) {
    await db.collection('orders').doc(id).update({
        driverId: auth.currentUser.uid,
        driverEmail: auth.currentUser.email,
        status: 'picked_up'
    });
    loadDriverData();
    showToast('Success', 'Order Accepted');
}

window.loadMyDeliveries = async function() {
    const div = document.getElementById('my-orders-list');
    if(!div) return;
    
    const snap = await db.collection('orders')
        .where('driverId', '==', auth.currentUser.uid)
        .where('status', 'in', ['picked_up', 'on_way'])
        .get();
        
    div.innerHTML = '';
    snap.forEach(doc => {
        const o = doc.data();
        const card = document.createElement('div');
        card.className = 'order-card active';
        card.innerHTML = `
            <h4>From: ${o.restaurantName}</h4>
            <p>To: ${o.customerEmail}</p>
            <span class="badge ${getBadgeClass(o.status)}">${formatStatus(o.status)}</span>
            <div style="margin-top:10px">
                ${o.status === 'picked_up' ? 
                `<button class="btn btn-primary btn-full" onclick="driverUpdate('${doc.id}', 'on_way')">On Way</button>` :
                `<button class="btn btn-primary btn-full" onclick="driverUpdate('${doc.id}', 'delivered')">Delivered</button>`}
            </div>
        `;
        div.appendChild(card);
    });
}

window.driverUpdate = async function(id, status) {
    await db.collection('orders').doc(id).update({ status: status });
    loadDriverData();
}
