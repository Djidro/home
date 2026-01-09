// Talabat Food Delivery App JavaScript - FINAL VERSION

// 1. FIREBASE CONFIGURATION
// This connects your specific project (Samail) to the app.
const firebaseConfig = {
  apiKey: "AIzaSyC_1B_UMLD670HB86qOqTm9e9G50IoTuCI",
  authDomain: "samail-e3e1d.firebaseapp.com",
  projectId: "samail-e3e1d",
  storageBucket: "samail-e3e1d.firebasestorage.app",
  messagingSenderId: "526248644310",
  appId: "1:526248644310:web:e8e8b9d984bda4dc098377",
  measurementId: "G-3ESFX89BLS"
};

// 2. INITIALIZE FIREBASE
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// 3. GLOBAL VARIABLES
let currentUser = null;
let currentUserRole = null;
let selectedRestaurant = null;
let cart = {}; // Stores items like { 'itemId': {name: 'Pizza', price: 10, qty: 1} }
let isDriverOnline = false;

// --- AUTHENTICATION & STARTUP ---

// This runs automatically whenever the user logs in, logs out, or refreshes the page
auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        // Check the database to find out if this user is a Driver, Admin, or Customer
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            currentUserRole = userDoc.data().role;
            localStorage.setItem('userRole', currentUserRole);
            localStorage.setItem('userEmail', user.email);
            
            // If we are still on the login screen, move to dashboard
            if (document.getElementById('auth-page').classList.contains('active')) {
                showDashboard(currentUserRole);
            }
        }
    } else {
        // User is logged out
        showPage('auth-page');
    }
});

// Run this when the page loads to set up icons and hide loaders
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
    
    // Hide loading screen after 1 second
    setTimeout(() => {
        const loader = document.getElementById('loading-screen');
        if(loader) loader.style.display = 'none';
    }, 1000);
    
    // Hide the config notice
    const notice = document.getElementById('firebase-notice');
    if(notice) notice.style.display = 'none';
});

// --- NAVIGATION & UTILITIES ---

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function showToast(title, message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<div class="toast-title">${title}</div><div class="toast-message">${message}</div>`;
    document.getElementById('toast-container').appendChild(toast);
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
        'preparing': 'warning', 'ready': 'success', 'picked_up': 'warning'
    };
    return map[status] || 'secondary';
}

function formatStatus(status) {
    return status ? status.replace('_', ' ').toUpperCase() : '';
}

// --- AUTH ACTIONS (LOGIN / REGISTER) ---

function switchTab(tab) {
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

async function handleLogin(event) {
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

async function handleRegister(event) {
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

async function logout() {
    await auth.signOut();
    location.reload(); // Refresh page to clear memory
}

// --- DASHBOARD ROUTING ---

function showDashboard(role) {
    const map = {
        'admin': 'admin-dashboard',
        'restaurant': 'restaurant-dashboard',
        'customer': 'customer-dashboard',
        'driver': 'driver-dashboard'
    };
    showPage(map[role]);
    
    // Initialize specific data
    if (role === 'admin') loadAdminData();
    if (role === 'restaurant') loadRestaurantData();
    if (role === 'customer') loadCustomerData();
    if (role === 'driver') loadDriverData();
}

function switchDashboardTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.dashboard-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
    
    // Load data
    if (tabName === 'restaurants') loadRestaurantsTable();
    if (tabName === 'orders') loadOrdersTable();
    if (tabName === 'restaurant-orders') loadRestaurantOrders();
    if (tabName === 'menu-management') loadMenuItems();
    if (tabName === 'restaurants-list') loadRestaurantsList();
    if (tabName === 'customer-orders') loadCustomerOrders();
}

// --- ADMIN SECTION ---

async function loadRestaurantsTable() {
    const tbody = document.getElementById('restaurants-table');
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

async function adminApprove(id, status) {
    await db.collection('restaurants').doc(id).update({ status: status });
    loadRestaurantsTable();
}

async function loadOrdersTable() {
    const tbody = document.getElementById('orders-table');
    tbody.innerHTML = 'Loading...';
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

function loadRestaurantData() {
    loadRestaurantOrders();
    // Real-time listener for new orders
    db.collection('orders')
      .where('restaurantId', '==', auth.currentUser.uid)
      .onSnapshot(() => loadRestaurantOrders());
}

async function loadRestaurantOrders() {
    const div = document.getElementById('restaurant-orders-list');
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

async function updateOrderStatus(id, status) {
    await db.collection('orders').doc(id).update({ status: status });
    showToast('Updated', `Order marked as ${status}`);
}

// --- RESTAURANT MENU ---

async function loadMenuItems() {
    const list = document.getElementById('menu-items-list');
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

function showAddItemModal() { document.getElementById('add-item-modal').classList.add('active'); }
function hideAddItemModal() { document.getElementById('add-item-modal').classList.remove('active'); }

async function addMenuItem(e) {
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

async function deleteMenuItem(id) {
    if(confirm('Delete?')) {
        await db.collection('menuItems').doc(id).delete();
        loadMenuItems();
    }
}

// --- CUSTOMER SECTION ---

function loadCustomerData() {
    loadRestaurantsList();
    loadCustomerOrders();
}

async function loadRestaurantsList() {
    const grid = document.getElementById('restaurants-grid');
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

async function openRestaurantMenu(id, restaurant) {
    selectedRestaurant = { id: id, ...restaurant };
    document.getElementById('restaurants-view').style.display = 'none';
    document.getElementById('restaurant-menu-view').style.display = 'block';
    document.getElementById('selected-restaurant-name').textContent = restaurant.name;
    document.getElementById('cart-restaurant-name').textContent = restaurant.name;
    
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

function backToRestaurants() {
    document.getElementById('restaurants-view').style.display = 'block';
    document.getElementById('restaurant-menu-view').style.display = 'none';
    cart = {};
    updateCartDisplay();
}

// --- CART LOGIC ---

function addToCart(id, name, price) {
    if (!cart[id]) cart[id] = { name, price, qty: 0 };
    cart[id].qty++;
    updateCartDisplay();
}

function updateCartDisplay() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('final-total');
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
    
    const fee = selectedRestaurant ? selectedRestaurant.deliveryFee : 0;
    
    container.innerHTML = html || '<p>Empty Cart</p>';
    document.getElementById('subtotal').textContent = `$${total.toFixed(2)}`;
    document.getElementById('delivery-fee').textContent = `$${fee.toFixed(2)}`;
    document.getElementById('final-total').textContent = `$${(total + fee).toFixed(2)}`;
    document.getElementById('cart-count').textContent = count;
    
    if(count > 0) {
        document.getElementById('cart-button').style.display = 'flex';
        document.getElementById('cart-total').style.display = 'block';
    }
}

async function placeOrder() {
    if (Object.keys(cart).length === 0) return;
    
    const total = parseFloat(document.getElementById('final-total').textContent.replace('$', ''));
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

async function loadCustomerOrders() {
    const div = document.getElementById('customer-orders-list');
    const snap = await db.collection('orders').where('customerId', '==', auth.currentUser.uid).orderBy('createdAt', 'desc').get();
    
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

function loadDriverData() {
    const toggle = document.getElementById('driver-online-status');
    if (toggle) toggle.checked = isDriverOnline;
    document.getElementById('driver-status-text').textContent = isDriverOnline ? "Online" : "Offline";
    document.getElementById('offline-notice').style.display = isDriverOnline ? 'none' : 'block';
    
    if (isDriverOnline) loadAvailableDriverOrders();
    loadMyDeliveries();
}

function toggleDriverStatus() {
    isDriverOnline = !isDriverOnline;
    loadDriverData();
}

async function loadAvailableDriverOrders() {
    const div = document.getElementById('available-orders-list');
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

async function driverAccept(id) {
    await db.collection('orders').doc(id).update({
        driverId: auth.currentUser.uid,
        driverEmail: auth.currentUser.email,
        status: 'picked_up'
    });
    loadDriverData();
    showToast('Success', 'Order Accepted');
}

async function loadMyDeliveries() {
    const div = document.getElementById('my-orders-list');
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

async function driverUpdate(id, status) {
    await db.collection('orders').doc(id).update({ status: status });
    loadDriverData();
}
