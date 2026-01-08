// Talabat Food Delivery App JavaScript

// Firebase Configuration - REPLACE WITH YOUR ACTUAL CONFIG
const firebaseConfig = {
    // Paste your Firebase configuration here
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// Initialize Firebase (uncomment when you have real config)
// firebase.initializeApp(firebaseConfig);
// const auth = firebase.auth();
// const db = firebase.firestore();

// Mock Firebase for demonstration
const mockAuth = {
    currentUser: null,
    signInWithEmailAndPassword: async (email, password) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ user: { uid: 'mock-uid-' + Date.now(), email } });
            }, 1000);
        });
    },
    createUserWithEmailAndPassword: async (email, password) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ user: { uid: 'mock-uid-' + Date.now(), email } });
            }, 1000);
        });
    },
    signOut: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                mockAuth.currentUser = null;
                resolve();
            }, 500);
        });
    }
};

const mockFirestore = {
    collection: (name) => ({
        doc: (id) => ({
            set: async (data) => {
                console.log(`Setting document in ${name}/${id}:`, data);
                return Promise.resolve();
            },
            get: async () => ({
                exists: () => true,
                data: () => ({ role: localStorage.getItem('userRole') || 'customer' })
            })
        }),
        add: async (data) => {
            console.log(`Adding document to ${name}:`, data);
            return Promise.resolve({ id: 'mock-doc-' + Date.now() });
        },
        onSnapshot: (callback) => {
            // Mock real-time listener
            setTimeout(() => {
                callback({
                    docs: mockData[name] || []
                });
            }, 100);
            return () => {}; // Unsubscribe function
        }
    })
};

// Global State
let currentUser = null;
let currentUserRole = null;
let cart = {};
let selectedRestaurant = null;
let isDriverOnline = false;

// Mock Data
const mockData = {
    restaurants: [
        { id: '1', name: 'Pizza Palace', email: 'pizza@example.com', status: 'pending', createdAt: '2024-01-08', cuisine: 'Italian', rating: 4.5, deliveryTime: '30-45 min', deliveryFee: 2.99 },
        { id: '2', name: 'Burger House', email: 'burger@example.com', status: 'approved', createdAt: '2024-01-07', cuisine: 'American', rating: 4.2, deliveryTime: '25-40 min', deliveryFee: 1.99 },
        { id: '3', name: 'Sushi Master', email: 'sushi@example.com', status: 'approved', createdAt: '2024-01-06', cuisine: 'Japanese', rating: 4.8, deliveryTime: '40-55 min', deliveryFee: 3.99 },
    ],
    orders: [
        { id: '1', restaurant: 'Pizza Palace', customer: 'john@example.com', driver: 'driver1@example.com', status: 'delivered', total: 25.99, createdAt: '2024-01-08 14:30', items: ['Margherita Pizza', 'Caesar Salad'] },
        { id: '2', restaurant: 'Burger House', customer: 'jane@example.com', driver: null, status: 'preparing', total: 18.50, createdAt: '2024-01-08 15:15', items: ['Classic Burger', 'French Fries'] },
        { id: '3', restaurant: 'Sushi Master', customer: 'bob@example.com', driver: 'driver2@example.com', status: 'on_way', total: 42.00, createdAt: '2024-01-08 15:45', items: ['Salmon Roll', 'Miso Soup'] },
    ],
    drivers: [
        { id: '1', name: 'Mike Johnson', email: 'mike@example.com', status: 'online', orders: 5, rating: 4.8 },
        { id: '2', name: 'Sarah Wilson', email: 'sarah@example.com', status: 'offline', orders: 12, rating: 4.9 },
        { id: '3', name: 'David Brown', email: 'david@example.com', status: 'busy', orders: 8, rating: 4.7 },
    ],
    menuItems: {
        '1': [
            { id: '1', name: 'Margherita Pizza', description: 'Fresh tomatoes, mozzarella, basil', price: 12.99, category: 'Pizza', available: true },
            { id: '2', name: 'Pepperoni Pizza', description: 'Pepperoni, mozzarella, tomato sauce', price: 15.99, category: 'Pizza', available: true },
            { id: '3', name: 'Caesar Salad', description: 'Romaine lettuce, parmesan, croutons', price: 8.99, category: 'Salads', available: true },
        ],
        '2': [
            { id: '4', name: 'Classic Burger', description: 'Beef patty, lettuce, tomato, onion', price: 11.99, category: 'Burgers', available: true },
            { id: '5', name: 'Chicken Burger', description: 'Grilled chicken, lettuce, mayo', price: 10.99, category: 'Burgers', available: true },
            { id: '6', name: 'French Fries', description: 'Crispy golden fries', price: 4.99, category: 'Sides', available: true },
        ],
        '3': [
            { id: '7', name: 'Salmon Roll', description: 'Fresh salmon, avocado, cucumber', price: 8.99, category: 'Rolls', available: true },
            { id: '8', name: 'Tuna Sashimi', description: 'Fresh tuna slices', price: 12.99, category: 'Sashimi', available: true },
            { id: '9', name: 'Miso Soup', description: 'Traditional soybean soup', price: 3.99, category: 'Soups', available: true },
        ],
    },
    availableOrders: [
        { 
            id: '10', 
            restaurant: 'Pizza Palace', 
            customer: 'John Doe',
            customerAddress: '123 Main St, Downtown',
            restaurantAddress: '456 Oak Ave, City Center',
            items: ['Margherita Pizza', 'Caesar Salad'], 
            total: 21.98, 
            distance: '2.5 km',
            estimatedTime: '15 min',
            createdAt: '2024-01-08 14:30' 
        },
        { 
            id: '11', 
            restaurant: 'Burger House', 
            customer: 'Jane Smith',
            customerAddress: '789 Pine St, Suburbs',
            restaurantAddress: '321 Elm St, Mall Area',
            items: ['Classic Burger', 'French Fries'], 
            total: 16.98, 
            distance: '1.8 km',
            estimatedTime: '12 min',
            createdAt: '2024-01-08 15:15' 
        },
    ],
    myOrders: [
        { 
            id: '12', 
            restaurant: 'Thai Garden', 
            customer: 'Alice Brown',
            customerAddress: '999 Birch Ln, Riverside',
            restaurantAddress: '111 Willow St, Town Square',
            items: ['Pad Thai', 'Spring Rolls'], 
            total: 18.50, 
            status: 'picked_up',
            distance: '2.1 km',
            estimatedTime: '10 min',
            createdAt: '2024-01-08 16:00' 
        },
    ]
};

// Utility Functions
function showToast(title, message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
    `;
    
    document.getElementById('toast-container').appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

function setLoading(buttonId, loading) {
    const button = document.getElementById(buttonId);
    if (loading) {
        button.disabled = true;
        button.textContent = 'Processing...';
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText || 'Submit';
    }
}

function getBadgeClass(status) {
    const statusMap = {
        'pending': 'warning',
        'approved': 'success',
        'rejected': 'error',
        'online': 'success',
        'offline': 'secondary',
        'busy': 'warning',
        'delivered': 'success',
        'preparing': 'warning',
        'on_way': 'secondary',
        'accepted': 'secondary',
        'picked_up': 'warning',
        'ready': 'success'
    };
    return statusMap[status] || 'secondary';
}

function formatStatus(status) {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Authentication Functions
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    
    if (tab === 'login') {
        document.querySelector('.tab-btn').classList.add('active');
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
        const result = await mockAuth.signInWithEmailAndPassword(email, password);
        if (result.user) {
            // Get user role from localStorage (mock Firestore)
            const userRole = localStorage.getItem('userRole') || 'customer';
            
            currentUser = result.user;
            currentUserRole = userRole;
            
            showToast('Login Successful', `Welcome back! Redirecting to ${userRole} dashboard...`);
            
            setTimeout(() => {
                showDashboard(userRole);
            }, 1500);
        }
    } catch (error) {
        showToast('Error', error.message || 'Login failed', 'error');
    } finally {
        setLoading('login-btn', false);
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const role = document.getElementById('user-role').value;
    
    if (password !== confirmPassword) {
        showToast('Error', 'Passwords do not match', 'error');
        return;
    }
    
    if (!role) {
        showToast('Error', 'Please select a role', 'error');
        return;
    }
    
    setLoading('register-btn', true);
    
    try {
        const result = await mockAuth.createUserWithEmailAndPassword(email, password);
        if (result.user) {
            // Save user role to localStorage (mock Firestore)
            localStorage.setItem('userRole', role);
            localStorage.setItem('userEmail', email);
            
            currentUser = result.user;
            currentUserRole = role;
            
            showToast('Registration Successful', `Account created! Redirecting to ${role} dashboard...`);
            
            setTimeout(() => {
                showDashboard(role);
            }, 1500);
        }
    } catch (error) {
        showToast('Error', error.message || 'Registration failed', 'error');
    } finally {
        setLoading('register-btn', false);
    }
}

async function logout() {
    try {
        await mockAuth.signOut();
        currentUser = null;
        currentUserRole = null;
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        
        showToast('Logged out', 'You have been logged out successfully.');
        showPage('auth-page');
    } catch (error) {
        showToast('Error', 'Failed to log out', 'error');
    }
}

// Dashboard Functions
function showDashboard(role) {
    const dashboardMap = {
        'admin': 'admin-dashboard',
        'restaurant': 'restaurant-dashboard',
        'customer': 'customer-dashboard',
        'driver': 'driver-dashboard'
    };
    
    const dashboardId = dashboardMap[role];
    if (dashboardId) {
        showPage(dashboardId);
        initializeDashboard(role);
    }
}

function initializeDashboard(role) {
    switch (role) {
        case 'admin':
            loadAdminData();
            break;
        case 'restaurant':
            loadRestaurantData();
            break;
        case 'customer':
            loadCustomerData();
            break;
        case 'driver':
            loadDriverData();
            break;
    }
}

function switchDashboardTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.dashboard-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Add active class to clicked tab
    event.target.classList.add('active');
    
    // Show corresponding content
    const contentId = tabName + '-tab';
    const content = document.getElementById(contentId);
    if (content) {
        content.classList.add('active');
    }
    
    // Load specific data based on tab
    switch (tabName) {
        case 'restaurants':
            loadRestaurantsTable();
            break;
        case 'orders':
            loadOrdersTable();
            break;
        case 'drivers':
            loadDriversTable();
            break;
        case 'restaurant-orders':
            loadRestaurantOrders();
            break;
        case 'menu-management':
            loadMenuItems();
            break;
        case 'restaurants-list':
            loadRestaurantsList();
            break;
        case 'customer-orders':
            loadCustomerOrders();
            break;
    }
}

// Admin Dashboard Functions
function loadAdminData() {
    loadRestaurantsTable();
    updateAdminStats();
}

function updateAdminStats() {
    const restaurants = mockData.restaurants;
    const orders = mockData.orders;
    const drivers = mockData.drivers;
    
    document.getElementById('total-restaurants').textContent = restaurants.length;
    document.getElementById('total-orders').textContent = orders.length;
    document.getElementById('active-drivers').textContent = drivers.filter(d => d.status === 'online').length;
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    document.getElementById('total-revenue').textContent = `$${totalRevenue.toFixed(2)}`;
}

function loadRestaurantsTable() {
    const tbody = document.getElementById('restaurants-table');
    tbody.innerHTML = '';
    
    mockData.restaurants.forEach(restaurant => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${restaurant.name}</td>
            <td>${restaurant.email}</td>
            <td><span class="badge ${getBadgeClass(restaurant.status)}">${formatStatus(restaurant.status)}</span></td>
            <td>${restaurant.createdAt}</td>
            <td>
                ${restaurant.status === 'pending' ? `
                    <button class="btn btn-primary" style="margin-right: 0.5rem; padding: 0.25rem 0.75rem; font-size: 0.75rem;" onclick="handleRestaurantAction('${restaurant.id}', 'approve')">
                        Approve
                    </button>
                    <button class="btn btn-outline" style="padding: 0.25rem 0.75rem; font-size: 0.75rem; border-color: var(--error); color: var(--error);" onclick="handleRestaurantAction('${restaurant.id}', 'reject')">
                        Reject
                    </button>
                ` : ''}
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadOrdersTable() {
    const tbody = document.getElementById('orders-table');
    tbody.innerHTML = '';
    
    mockData.orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${order.restaurant}</td>
            <td>${order.customer}</td>
            <td>${order.driver || 'Unassigned'}</td>
            <td><span class="badge ${getBadgeClass(order.status)}">${formatStatus(order.status)}</span></td>
            <td>$${order.total}</td>
            <td>${order.createdAt}</td>
        `;
        tbody.appendChild(row);
    });
}

function loadDriversTable() {
    const tbody = document.getElementById('drivers-table');
    tbody.innerHTML = '';
    
    mockData.drivers.forEach(driver => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${driver.name}</td>
            <td>${driver.email}</td>
            <td><span class="badge ${getBadgeClass(driver.status)}">${formatStatus(driver.status)}</span></td>
            <td>${driver.orders}</td>
            <td>⭐ ${driver.rating}</td>
        `;
        tbody.appendChild(row);
    });
}

function handleRestaurantAction(restaurantId, action) {
    const restaurant = mockData.restaurants.find(r => r.id === restaurantId);
    if (restaurant) {
        restaurant.status = action === 'approve' ? 'approved' : 'rejected';
        showToast(`Restaurant ${action}d`, `The restaurant has been ${action}d successfully.`);
        loadRestaurantsTable();
        updateAdminStats();
    }
}

// Restaurant Dashboard Functions
function loadRestaurantData() {
    loadRestaurantOrders();
    updateRestaurantStats();
}

function updateRestaurantStats() {
    const menuItems = mockData.menuItems['1'] || []; // Assuming current restaurant is Pizza Palace
    const orders = mockData.orders.filter(o => o.restaurant === 'Pizza Palace');
    
    document.getElementById('menu-items-count').textContent = menuItems.length;
    document.getElementById('pending-orders').textContent = orders.filter(o => o.status === 'pending').length;
    document.getElementById('active-orders').textContent = orders.filter(o => ['accepted', 'preparing'].includes(o.status)).length;
    
    const revenue = orders.reduce((sum, order) => sum + order.total, 0);
    document.getElementById('restaurant-revenue').textContent = `$${revenue.toFixed(2)}`;
}

function loadRestaurantOrders() {
    const container = document.getElementById('restaurant-orders-list');
    container.innerHTML = '';
    
    const restaurantOrders = mockData.orders.filter(o => o.restaurant === 'Pizza Palace');
    
    restaurantOrders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="order-header">
                <div class="order-info">
                    <h4>Order #${order.id}</h4>
                    <p class="order-id">${order.customer}</p>
                </div>
                <div class="order-total">
                    <span class="badge ${getBadgeClass(order.status)}">${formatStatus(order.status)}</span>
                    <p style="margin-top: 0.5rem; font-weight: bold;">$${order.total}</p>
                </div>
            </div>
            <div class="order-items">
                <p class="order-items-label">Items:</p>
                <p class="order-items-list">${order.items.join(', ')}</p>
            </div>
            <div class="order-meta">
                <span>${order.createdAt}</span>
            </div>
            <div class="order-actions">
                ${getRestaurantOrderActions(order)}
            </div>
        `;
        container.appendChild(orderCard);
    });
}

function getRestaurantOrderActions(order) {
    switch (order.status) {
        case 'pending':
            return `
                <button class="btn btn-primary" style="margin-right: 0.5rem;" onclick="handleRestaurantOrderAction('${order.id}', 'accepted')">Accept</button>
                <button class="btn btn-outline" style="border-color: var(--error); color: var(--error);" onclick="handleRestaurantOrderAction('${order.id}', 'rejected')">Reject</button>
            `;
        case 'accepted':
            return `<button class="btn btn-primary" onclick="handleRestaurantOrderAction('${order.id}', 'preparing')">Start Preparing</button>`;
        case 'preparing':
            return `<button class="btn btn-primary" onclick="handleRestaurantOrderAction('${order.id}', 'ready')">Mark Ready</button>`;
        default:
            return '';
    }
}

function handleRestaurantOrderAction(orderId, newStatus) {
    const order = mockData.orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        showToast(`Order ${newStatus}`, `Order #${orderId} has been marked as ${newStatus}.`);
        loadRestaurantOrders();
        updateRestaurantStats();
    }
}

function loadMenuItems() {
    const container = document.getElementById('menu-items-list');
    container.innerHTML = '';
    
    const menuItems = mockData.menuItems['1'] || [];
    
    menuItems.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'menu-item-card';
        itemCard.innerHTML = `
            <div class="menu-item-content">
                <div class="menu-item-info">
                    <div class="menu-item-name">${item.name}</div>
                    <div class="menu-item-description">${item.description}</div>
                    <div class="menu-item-price">$${item.price}</div>
                    <span class="badge ${item.available ? 'success' : 'secondary'}" style="margin-top: 0.5rem;">
                        ${item.available ? 'Available' : 'Unavailable'}
                    </span>
                </div>
                <div class="menu-item-actions">
                    <button class="btn btn-outline" onclick="editMenuItem('${item.id}')" style="margin-right: 0.5rem;">
                        Edit
                    </button>
                    <button class="btn btn-outline" style="border-color: var(--error); color: var(--error);" onclick="deleteMenuItem('${item.id}')">
                        Delete
                    </button>
                </div>
            </div>
        `;
        container.appendChild(itemCard);
    });
}

function showAddItemModal() {
    document.getElementById('add-item-modal').classList.add('active');
}

function hideAddItemModal() {
    document.getElementById('add-item-modal').classList.remove('active');
    document.getElementById('add-item-modal').querySelector('form').reset();
}

function addMenuItem(event) {
    event.preventDefault();
    
    const name = document.getElementById('item-name').value;
    const description = document.getElementById('item-description').value;
    const price = parseFloat(document.getElementById('item-price').value);
    const category = document.getElementById('item-category').value;
    
    const newItem = {
        id: Date.now().toString(),
        name,
        description,
        price,
        category,
        available: true
    };
    
    if (!mockData.menuItems['1']) {
        mockData.menuItems['1'] = [];
    }
    mockData.menuItems['1'].push(newItem);
    
    showToast('Menu item added', 'The new menu item has been added successfully.');
    hideAddItemModal();
    loadMenuItems();
    updateRestaurantStats();
}

function editMenuItem(itemId) {
    showToast('Edit Item', 'Edit functionality would open a modal with item details', 'warning');
}

function deleteMenuItem(itemId) {
    if (confirm('Are you sure you want to delete this menu item?')) {
        mockData.menuItems['1'] = mockData.menuItems['1'].filter(item => item.id !== itemId);
        showToast('Menu item deleted', 'The menu item has been deleted successfully.');
        loadMenuItems();
        updateRestaurantStats();
    }
}

// Customer Dashboard Functions
function loadCustomerData() {
    loadRestaurantsList();
    updateCartDisplay();
}

function loadRestaurantsList() {
    const container = document.getElementById('restaurants-grid');
    container.innerHTML = '';
    
    const approvedRestaurants = mockData.restaurants.filter(r => r.status === 'approved');
    
    approvedRestaurants.forEach(restaurant => {
        const restaurantCard = document.createElement('div');
        restaurantCard.className = 'restaurant-card';
        restaurantCard.onclick = () => selectRestaurant(restaurant.id);
        restaurantCard.innerHTML = `
            <div class="restaurant-image">
                🍽️
            </div>
            <div class="restaurant-info">
                <div class="restaurant-header">
                    <div class="restaurant-name">${restaurant.name}</div>
                    <div class="restaurant-rating">
                        ⭐ ${restaurant.rating}
                    </div>
                </div>
                <div class="restaurant-cuisine">${restaurant.cuisine}</div>
                <div class="restaurant-details">
                    <div>🕒 ${restaurant.deliveryTime}</div>
                    <div>Delivery: $${restaurant.deliveryFee}</div>
                </div>
            </div>
        `;
        container.appendChild(restaurantCard);
    });
}

function filterRestaurants() {
    const searchTerm = document.getElementById('restaurant-search').value.toLowerCase();
    const restaurantCards = document.querySelectorAll('.restaurant-card');
    
    restaurantCards.forEach(card => {
        const name = card.querySelector('.restaurant-name').textContent.toLowerCase();
        const cuisine = card.querySelector('.restaurant-cuisine').textContent.toLowerCase();
        
        if (name.includes(searchTerm) || cuisine.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function selectRestaurant(restaurantId) {
    selectedRestaurant = restaurantId;
    const restaurant = mockData.restaurants.find(r => r.id === restaurantId);
    
    document.getElementById('restaurants-view').style.display = 'none';
    document.getElementById('restaurant-menu-view').style.display = 'block';
    
    document.getElementById('selected-restaurant-name').textContent = restaurant.name;
    document.getElementById('selected-restaurant-details').textContent = `${restaurant.cuisine} • ${restaurant.deliveryTime}`;
    document.getElementById('cart-restaurant-name').textContent = restaurant.name;
    
    loadRestaurantMenu(restaurantId);
    updateCartDisplay();
}

function backToRestaurants() {
    selectedRestaurant = null;
    cart = {};
    
    document.getElementById('restaurants-view').style.display = 'block';
    document.getElementById('restaurant-menu-view').style.display = 'none';
    
    updateCartDisplay();
}

function loadRestaurantMenu(restaurantId) {
    const container = document.getElementById('menu-items-grid');
    container.innerHTML = '';
    
    const menuItems = mockData.menuItems[restaurantId] || [];
    
    menuItems.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'menu-item-card';
        itemCard.innerHTML = `
            <div class="menu-item-content">
                <div class="menu-item-info">
                    <div class="menu-item-name">${item.name}</div>
                    <div class="menu-item-description">${item.description}</div>
                    <div class="menu-item-price">$${item.price}</div>
                </div>
                <div class="menu-item-actions">
                    ${cart[item.id] > 0 ? `
                        <button class="btn btn-outline" onclick="removeFromCart('${item.id}')">-</button>
                        <span class="quantity-display">${cart[item.id]}</span>
                    ` : ''}
                    <button class="btn btn-primary" onclick="addToCart('${item.id}')">+</button>
                </div>
            </div>
        `;
        container.appendChild(itemCard);
    });
}

function addToCart(itemId) {
    if (!cart[itemId]) {
        cart[itemId] = 0;
    }
    cart[itemId]++;
    
    showToast('Item added to cart', 'The item has been added to your cart.');
    loadRestaurantMenu(selectedRestaurant);
    updateCartDisplay();
}

function removeFromCart(itemId) {
    if (cart[itemId] > 1) {
        cart[itemId]--;
    } else {
        delete cart[itemId];
    }
    
    loadRestaurantMenu(selectedRestaurant);
    updateCartDisplay();
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartButton = document.getElementById('cart-button');
    const cartCount = document.getElementById('cart-count');
    
    const itemCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    
    if (itemCount === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartTotal.style.display = 'none';
        cartButton.style.display = 'none';
    } else {
        cartButton.style.display = 'flex';
        cartCount.textContent = itemCount;
        
        let cartHTML = '';
        let subtotal = 0;
        
        Object.entries(cart).forEach(([itemId, quantity]) => {
            const item = findMenuItem(itemId);
            if (item) {
                const itemTotal = item.price * quantity;
                subtotal += itemTotal;
                
                cartHTML += `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-quantity">x${quantity}</div>
                        </div>
                        <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
                    </div>
                `;
            }
        });
        
        cartItems.innerHTML = cartHTML;
        
        const restaurant = mockData.restaurants.find(r => r.id === selectedRestaurant);
        const deliveryFee = restaurant ? restaurant.deliveryFee : 0;
        const total = subtotal + deliveryFee;
        
        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('delivery-fee').textContent = `$${deliveryFee.toFixed(2)}`;
        document.getElementById('final-total').textContent = `$${total.toFixed(2)}`;
        
        cartTotal.style.display = 'block';
    }
}

function findMenuItem(itemId) {
    for (const restaurantId in mockData.menuItems) {
        const item = mockData.menuItems[restaurantId].find(item => item.id === itemId);
        if (item) return item;
    }
    return null;
}

function placeOrder() {
    if (Object.keys(cart).length === 0) {
        showToast('Empty cart', 'Please add items to your cart before placing an order.', 'error');
        return;
    }
    
    const restaurant = mockData.restaurants.find(r => r.id === selectedRestaurant);
    const orderItems = Object.entries(cart).map(([itemId, quantity]) => {
        const item = findMenuItem(itemId);
        return `${item.name} (x${quantity})`;
    });
    
    // Add order to mock data
    const newOrder = {
        id: Date.now().toString(),
        restaurant: restaurant.name,
        customer: localStorage.getItem('userEmail') || 'customer@example.com',
        items: orderItems,
        status: 'pending',
        total: parseFloat(document.getElementById('final-total').textContent.replace('$', '')),
        createdAt: new Date().toLocaleString()
    };
    
    mockData.orders.push(newOrder);
    
    showToast('Order placed successfully!', `Your order from ${restaurant.name} has been placed.`);
    
    cart = {};
    updateCartDisplay();
}

function loadCustomerOrders() {
    const container = document.getElementById('customer-orders-list');
    container.innerHTML = '';
    
    const customerEmail = localStorage.getItem('userEmail') || 'customer@example.com';
    const customerOrders = mockData.orders.filter(o => o.customer === customerEmail);
    
    if (customerOrders.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem 0;">No orders yet</p>';
        return;
    }
    
    customerOrders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="order-header">
                <div class="order-info">
                    <h4>Order #${order.id}</h4>
                    <p class="order-id">${order.restaurant}</p>
                </div>
                <span class="badge ${getBadgeClass(order.status)}">${formatStatus(order.status)}</span>
            </div>
            <div class="order-items">
                <p class="order-items-list">${order.items.join(', ')}</p>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                <p style="font-size: 0.75rem; color: var(--text-muted);">${order.createdAt}</p>
                <p style="font-weight: bold;">$${order.total}</p>
            </div>
        `;
        container.appendChild(orderCard);
    });
}

// Driver Dashboard Functions
function loadDriverData() {
    loadAvailableOrders();
    loadMyOrders();
    updateDriverStats();
}

function updateDriverStats() {
    const availableCount = isDriverOnline ? mockData.availableOrders.length : 0;
    document.getElementById('available-orders-count').textContent = availableCount;
    document.getElementById('available-orders-desc').textContent = isDriverOnline ? 'Ready to accept' : 'Go online to see orders';
    document.getElementById('active-deliveries').textContent = mockData.myOrders.length;
    
    const statusText = isDriverOnline ? 'Online' : 'Offline';
    document.getElementById('driver-status-display').textContent = statusText;
    document.getElementById('driver-status-desc').textContent = isDriverOnline ? 'Receiving orders' : 'Not receiving orders';
    document.getElementById('driver-status-text').textContent = statusText;
    
    // Update offline notice
    const offlineNotice = document.getElementById('offline-notice');
    offlineNotice.style.display = isDriverOnline ? 'none' : 'block';
    
    // Update available orders description
    document.getElementById('available-orders-description').textContent = 
        isDriverOnline ? 'Orders waiting for pickup' : 'Go online to see available orders';
}

function toggleDriverStatus() {
    isDriverOnline = document.getElementById('driver-online-status').checked;
    
    showToast(
        isDriverOnline ? "You're now online" : "You're now offline",
        isDriverOnline ? "You can now receive order notifications" : "You won't receive new orders"
    );
    
    updateDriverStats();
    loadAvailableOrders();
}

function loadAvailableOrders() {
    const container = document.getElementById('available-orders-list');
    container.innerHTML = '';
    
    if (!isDriverOnline) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem 0;">You\'re offline</p>';
        return;
    }
    
    if (mockData.availableOrders.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem 0;">No orders available</p>';
        return;
    }
    
    mockData.availableOrders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card available';
        orderCard.innerHTML = `
            <div class="order-header">
                <div class="order-info">
                    <h4>${order.restaurant}</h4>
                    <p class="order-id">Order #${order.id}</p>
                </div>
                <div class="order-total">
                    <div class="order-amount">$${order.total}</div>
                    <div class="order-earning">Est. $${(order.total * 0.15).toFixed(2)} earning</div>
                </div>
            </div>
            <div class="order-addresses">
                <div class="address-line">
                    📍 Pickup: ${order.restaurantAddress}
                </div>
                <div class="address-line">
                    📍 Delivery: ${order.customerAddress}
                </div>
            </div>
            <div class="order-meta">
                <span>🚗 ${order.distance}</span>
                <span>🕒 ${order.estimatedTime}</span>
            </div>
            <div class="order-items">
                <p class="order-items-label">Items:</p>
                <p class="order-items-list">${order.items.join(', ')}</p>
            </div>
            <button class="btn btn-primary btn-full" onclick="acceptOrder('${order.id}')">
                Accept Order
            </button>
        `;
        container.appendChild(orderCard);
    });
}

function loadMyOrders() {
    const container = document.getElementById('my-orders-list');
    container.innerHTML = '';
    
    if (mockData.myOrders.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem 0;">No active deliveries</p>';
        return;
    }
    
    mockData.myOrders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card active';
        orderCard.innerHTML = `
            <div class="order-header">
                <div class="order-info">
                    <h4>${order.restaurant}</h4>
                    <p class="order-id">Order #${order.id}</p>
                </div>
                <div class="order-total">
                    <span class="badge ${getBadgeClass(order.status)}">${formatStatus(order.status)}</span>
                    <div class="order-amount" style="margin-top: 0.5rem;">$${order.total}</div>
                </div>
            </div>
            <div class="order-addresses">
                <div class="address-line">
                    📍 Pickup: ${order.restaurantAddress}
                </div>
                <div class="address-line">
                    📍 Delivery: ${order.customerAddress}
                </div>
            </div>
            <div class="order-meta">
                <span>🚗 ${order.distance}</span>
                <span>🕒 ${order.estimatedTime}</span>
            </div>
            <div class="order-items">
                <p class="order-items-label">Items:</p>
                <p class="order-items-list">${order.items.join(', ')}</p>
            </div>
            ${getDriverOrderActions(order)}
        `;
        container.appendChild(orderCard);
    });
}

function getDriverOrderActions(order) {
    const actions = {
        'accepted': { action: 'picked_up', label: 'Mark as Picked Up' },
        'picked_up': { action: 'on_way', label: 'On the Way' },
        'on_way': { action: 'delivered', label: 'Mark as Delivered' }
    };
    
    const nextAction = actions[order.status];
    if (nextAction) {
        return `
            <button class="btn btn-primary btn-full" onclick="updateOrderStatus('${order.id}', '${nextAction.action}')">
                ${nextAction.label}
            </button>
        `;
    }
    return '';
}

function acceptOrder(orderId) {
    const order = mockData.availableOrders.find(o => o.id === orderId);
    if (order) {
        // Move from available to my orders
        mockData.availableOrders = mockData.availableOrders.filter(o => o.id !== orderId);
        mockData.myOrders.push({ ...order, status: 'accepted' });
        
        showToast('Order accepted!', `You've accepted the order from ${order.restaurant}`);
        
        loadAvailableOrders();
        loadMyOrders();
        updateDriverStats();
    }
}

function updateOrderStatus(orderId, newStatus) {
    const order = mockData.myOrders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        
        if (newStatus === 'delivered') {
            // Add to earnings and remove from active orders
            const currentEarnings = parseFloat(document.getElementById('driver-earnings').textContent.replace('$', ''));
            const newEarnings = currentEarnings + (order.total * 0.15);
            document.getElementById('driver-earnings').textContent = `$${newEarnings.toFixed(2)}`;
            
            // Remove from my orders after a delay
            setTimeout(() => {
                mockData.myOrders = mockData.myOrders.filter(o => o.id !== orderId);
                loadMyOrders();
                updateDriverStats();
            }, 2000);
        }
        
        showToast('Status updated', `Order marked as ${newStatus.replace('_', ' ')}`);
        loadMyOrders();
    }
}

// Firebase Notice Functions
function hideFirebaseNotice() {
    document.getElementById('firebase-notice').style.display = 'none';
}

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
    }, 1000);
    
    // Check if user is already logged in (mock)
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) {
        currentUserRole = savedRole;
        currentUser = { email: localStorage.getItem('userEmail') };
        showDashboard(savedRole);
        hideFirebaseNotice();
    } else {
        showPage('auth-page');
    }
    
    // Set original button text for loading states
    document.querySelectorAll('.btn').forEach(btn => {
        btn.dataset.originalText = btn.textContent;
    });
});