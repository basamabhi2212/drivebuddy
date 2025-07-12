// Application State
let currentUser = null;
let users = [];
let drivers = [];
let trips = [];
let payments = [];
let tripCounter = 1;

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

// Initialize Application
async function initializeApp() {
    try {
        // Check if user is already logged in
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            showDashboard();
        } else {
            showLogin();
        }
        
        // Load data from JSON files
        await loadData();
    } catch (error) {
        console.error('Error initializing app:', error);
        showLogin();
    }
}

// Load Data from JSON Files
async function loadData() {
    try {
        // Load users
        const usersResponse = await fetch('users.json');
        if (usersResponse.ok) {
            users = await usersResponse.json();
        }
        
        // Load drivers
        const driversResponse = await fetch('drivers.json');
        if (driversResponse.ok) {
            drivers = await driversResponse.json();
        }
        
        // Load trips
        const tripsResponse = await fetch('trips.json');
        if (tripsResponse.ok) {
            trips = await tripsResponse.json();
        }
        
        // Load payments
        const paymentsResponse = await fetch('payments.json');
        if (paymentsResponse.ok) {
            payments = await paymentsResponse.json();
        }
        
        // Set trip counter based on existing trips
        if (trips.length > 0) {
            const lastTrip = trips[trips.length - 1];
            const lastId = parseInt(lastTrip.id.replace('DVBDY', ''));
            tripCounter = lastId + 1;
        }
        
        // Update dashboard if user is logged in
        if (currentUser) {
            updateDashboard();
        }
    } catch (error) {
        console.error('Error loading data:', error);
        // Initialize with empty arrays if files don't exist
        users = users || [];
        drivers = drivers || [];
        trips = trips || [];
        payments = payments || [];
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Book trip button
    document.getElementById('bookTripBtn').addEventListener('click', () => {
        openModal('tripModal');
    });
    
    // Add driver button
    document.getElementById('addDriverBtn').addEventListener('click', () => {
        openModal('driverModal');
    });
    
    // Add user button
    document.getElementById('addUserBtn').addEventListener('click', () => {
        resetUserForm();
        openModal('userModal');
    });
    
    // Add trip button
    document.getElementById('addTripBtn').addEventListener('click', () => {
        openModal('tripModal');
    });
    
    // Trip form
    document.getElementById('tripForm').addEventListener('submit', handleTripBooking);
    document.getElementById('routeType').addEventListener('change', handleRouteTypeChange);
    
    // Driver form
    document.getElementById('driverForm').addEventListener('submit', handleDriverAdd);
    
    // User form
    document.getElementById('userForm').addEventListener('submit', handleUserAdd);
    
    // Cancel trip form
    document.getElementById('cancelTripForm').addEventListener('submit', handleTripCancel);
    
    // Report generation
    document.getElementById('generateReportBtn').addEventListener('click', generateReport);
    
    // Trip estimation button (check if exists)
    const openEstimationBtn = document.getElementById('openEstimationBtn');
    if (openEstimationBtn) {
        openEstimationBtn.addEventListener('click', () => {
            window.open('./trip-estimate.html', '_blank');
        });
    }
    
    // Fare calculator
    const calculateFareBtn = document.getElementById('calculateFareBtn');
    if (calculateFareBtn) {
        calculateFareBtn.addEventListener('click', calculateFare);
    }
    
    // Payment form
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentUpdate);
    }
    
    // Modal controls
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeModal);
    });
    
    document.querySelectorAll('[id$="CancelBtn"]').forEach(cancelBtn => {
        cancelBtn.addEventListener('click', closeModal);
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            closeModal();
        }
    });
}

// Handle Login
async function handleLogin(event) {
    event.preventDefault();
    
    const mobile = document.getElementById('mobileNumber').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');
    
    // Clear previous errors
    errorElement.classList.remove('show');
    
    // Find user
    const user = users.find(u => u.mobile === mobile && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showDashboard();
    } else {
        errorElement.textContent = 'Invalid mobile number or password';
        errorElement.classList.add('show');
    }
}

// Handle Logout
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLogin();
}

// Show Login Page
function showLogin() {
    document.getElementById('loginPage').classList.add('active');
    document.getElementById('dashboardPage').classList.remove('active');
    
    // Clear login form
    document.getElementById('loginForm').reset();
    document.getElementById('loginError').classList.remove('show');
}

// Show Dashboard
function showDashboard() {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('dashboardPage').classList.add('active');
    
    // Set user role
    document.getElementById('userRole').textContent = currentUser.role.toUpperCase();
    
    // Configure role-based access
    configureRoleAccess();
    
    // Update dashboard content
    updateDashboard();
}

// Configure Role-Based Access
function configureRoleAccess() {
    const body = document.body;
    
    // Remove existing role classes
    body.classList.remove('hide-admin');
    
    // Add role-specific classes
    if (currentUser.role !== 'admin') {
        body.classList.add('hide-admin');
    }
    
    // Configure menu visibility based on role
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const page = link.getAttribute('data-page');
        
        // All roles can access these pages
        if (['home', 'trips', 'drivers', 'reports', 'estimation'].includes(page)) {
            link.style.display = 'block';
        }
        
        // Finance page - Admin, Manager, Finance
        if (page === 'finance') {
            if (['admin', 'manager', 'finance'].includes(currentUser.role)) {
                link.style.display = 'block';
            } else {
                link.style.display = 'none';
            }
        }
        
        // Admin page - Admin only
        if (page === 'admin') {
            if (currentUser.role === 'admin') {
                link.style.display = 'block';
            } else {
                link.style.display = 'none';
            }
        }
    });
}

// Handle Navigation
function handleNavigation(event) {
    event.preventDefault();
    
    const targetPage = event.target.getAttribute('data-page');
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to clicked link
    event.target.classList.add('active');
    
    // Hide all content pages
    document.querySelectorAll('.content-page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show target page
    document.getElementById(targetPage + 'Page').classList.add('active');
    
    // Load page-specific content
    switch(targetPage) {
        case 'home':
            updateDashboard();
            break;
        case 'trips':
            loadTrips();
            break;
        case 'drivers':
            loadDrivers();
            break;
        case 'reports':
            // Reports page is static, no need to load
            break;
        case 'finance':
            loadFinance();
            break;
        case 'admin':
            loadUsers();
            break;
    }
}

// Update Dashboard
function updateDashboard() {
    // Update statistics
    const activeTrips = trips.filter(trip => trip.status === 'active').length;
    const inProgressTrips = trips.filter(trip => trip.status === 'in-progress').length;
    const totalDrivers = drivers.length;
    
    document.getElementById('activeTrips').textContent = activeTrips;
    document.getElementById('inProgressTrips').textContent = inProgressTrips;
    document.getElementById('totalDrivers').textContent = totalDrivers;
    
    // Load recent trips
    loadRecentTrips();
}

// Load Recent Trips
function loadRecentTrips() {
    const recentTripsContainer = document.getElementById('recentTrips');
    
    if (trips.length === 0) {
        recentTripsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-car"></i>
                <h3>No trips found</h3>
                <p>Start by booking your first trip</p>
            </div>
        `;
        return;
    }
    
    // Sort trips by date (most recent first)
    const sortedTrips = [...trips].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    const recentTrips = sortedTrips.slice(0, 6);
    
    recentTripsContainer.innerHTML = recentTrips.map(trip => `
        <div class="trip-card">
            <div class="trip-card-header">
                Trip ID: ${trip.id}
            </div>
            <div class="trip-card-body">
                ${trip.customerName ? `
                    <div class="trip-detail">
                        <span>Customer:</span>
                        <span>${trip.customerName}</span>
                    </div>
                ` : ''}
                ${trip.customerMobile ? `
                    <div class="trip-detail">
                        <span>Mobile:</span>
                        <span>${trip.customerMobile}</span>
                    </div>
                ` : ''}
                <div class="trip-detail">
                    <span>Type:</span>
                    <span>${trip.type}</span>
                </div>
                <div class="trip-detail">
                    <span>Route:</span>
                    <span>${trip.routeType}</span>
                </div>
                <div class="trip-detail">
                    <span>From:</span>
                    <span>${trip.pickupLocation}</span>
                </div>
                ${trip.dropLocation ? `
                    <div class="trip-detail">
                        <span>To:</span>
                        <span>${trip.dropLocation}</span>
                    </div>
                ` : ''}
                <div class="trip-detail">
                    <span>Start Date:</span>
                    <span>${new Date(trip.startDate).toLocaleDateString()}</span>
                </div>
                <div class="trip-detail">
                    <span>Status:</span>
                    <span class="trip-status status-${trip.status}">${trip.status}</span>
                </div>
                <div class="trip-actions">
                    <button class="btn btn-secondary" onclick="viewTrip('${trip.id}')">View</button>
                    ${['admin', 'manager', 'executive', 'driver'].includes(currentUser.role) && trip.status === 'active' ? `
                        <button class="btn btn-success" onclick="startTrip('${trip.id}')">Start Trip</button>
                    ` : ''}
                    ${['admin', 'manager', 'executive', 'driver'].includes(currentUser.role) && trip.status === 'in-progress' ? `
                        <button class="btn btn-warning" onclick="endTrip('${trip.id}')">End Trip</button>
                    ` : ''}
                    ${currentUser.role === 'admin' && trip.status !== 'cancelled' && trip.status !== 'completed' ? `
                        <button class="btn btn-danger" onclick="cancelTrip('${trip.id}')">Cancel</button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Handle Trip Booking
function handleTripBooking(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const tripData = {
        id: `DVBDY${tripCounter.toString().padStart(3, '0')}`,
        customerName: document.getElementById('customerName').value,
        customerMobile: document.getElementById('customerMobile').value,
        startDate: document.getElementById('tripStartDate').value,
        endDate: document.getElementById('tripEndDate').value,
        type: document.getElementById('tripType').value,
        routeType: document.getElementById('routeType').value,
        pickupLocation: document.getElementById('pickupLocation').value,
        dropLocation: document.getElementById('dropLocation').value,
        vehicleType: document.getElementById('vehicleType').value,
        transmissionType: document.getElementById('transmissionType').value,
        status: 'active',
        bookedBy: currentUser.name,
        bookedAt: new Date().toISOString()
    };
    
    // Add trip to array
    trips.push(tripData);
    tripCounter++;
    
    // Save to localStorage (since we can't write to JSON files)
    localStorage.setItem('trips', JSON.stringify(trips));
    
    // Close modal and reset form
    closeModal();
    document.getElementById('tripForm').reset();
    
    // Update dashboard
    updateDashboard();
    
    alert(`Trip booked successfully! Trip ID: ${tripData.id}`);
}

// Handle Route Type Change
function handleRouteTypeChange(event) {
    const dropLocationGroup = document.getElementById('dropLocationGroup');
    const dropLocationInput = document.getElementById('dropLocation');
    
    if (event.target.value === 'one-way') {
        dropLocationGroup.style.display = 'block';
        dropLocationInput.required = true;
    } else {
        dropLocationGroup.style.display = 'none';
        dropLocationInput.required = false;
        dropLocationInput.value = '';
    }
}

// Load Drivers
function loadDrivers() {
    const driversContainer = document.getElementById('driversList');
    
    if (drivers.length === 0) {
        driversContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>No drivers found</h3>
                <p>Add your first driver to get started</p>
            </div>
        `;
        return;
    }
    
    driversContainer.innerHTML = drivers.map(driver => `
        <div class="driver-card">
            <div class="driver-card-header">
                Driver ID: ${driver.id}
            </div>
            <div class="driver-card-body">
                <div class="driver-info">
                    <strong>Name:</strong> ${driver.name}
                </div>
                <div class="driver-info">
                    <strong>Mobile:</strong> ${driver.mobile}
                </div>
                <div class="driver-info">
                    <strong>License:</strong> ${driver.license}
                </div>
                <div class="driver-info">
                    <strong>Address:</strong> ${driver.address}
                </div>
                <div class="driver-actions">
                    <button class="btn btn-secondary" onclick="editDriver('${driver.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteDriver('${driver.id}')">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Handle Driver Add
function handleDriverAdd(event) {
    event.preventDefault();
    
    const driverData = {
        id: `DR${(drivers.length + 1).toString().padStart(3, '0')}`,
        name: document.getElementById('driverName').value,
        mobile: document.getElementById('driverMobile').value,
        address: document.getElementById('driverAddress').value,
        license: document.getElementById('driverLicense').value,
        addedBy: currentUser.name,
        addedAt: new Date().toISOString()
    };
    
    // Add driver to array
    drivers.push(driverData);
    
    // Save to localStorage
    localStorage.setItem('drivers', JSON.stringify(drivers));
    
    // Close modal and reset form
    closeModal();
    document.getElementById('driverForm').reset();
    
    // Reload drivers
    loadDrivers();
    
    // Update dashboard
    updateDashboard();
    
    alert(`Driver added successfully! Driver ID: ${driverData.id}`);
}

// Delete Driver
function deleteDriver(driverId) {
    if (confirm('Are you sure you want to delete this driver?')) {
        drivers = drivers.filter(driver => driver.id !== driverId);
        localStorage.setItem('drivers', JSON.stringify(drivers));
        loadDrivers();
        updateDashboard();
    }
}

// Edit Driver (placeholder for future implementation)
function editDriver(driverId) {
    alert('Edit functionality coming soon!');
}

// Generate Report
function generateReport() {
    const month = document.getElementById('reportMonth').value;
    const year = document.getElementById('reportYear').value;
    const reportsContainer = document.getElementById('reportsContent');
    
    if (!month || !year) {
        alert('Please select both month and year');
        return;
    }
    
    // Filter trips by month and year
    const filteredTrips = trips.filter(trip => {
        const tripDate = new Date(trip.startDate);
        return tripDate.getMonth() + 1 === parseInt(month) && tripDate.getFullYear() === parseInt(year);
    });
    
    if (filteredTrips.length === 0) {
        reportsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-chart-bar"></i>
                <h3>No trips found</h3>
                <p>No trips found for the selected month and year</p>
            </div>
        `;
        return;
    }
    
    const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    reportsContainer.innerHTML = `
        <div class="reports-table">
            <h3>Trip Report - ${monthNames[month]} ${year}</h3>
            <table>
                <thead>
                    <tr>
                        <th>Trip ID</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Type</th>
                        <th>Route</th>
                        <th>Pickup</th>
                        <th>Drop</th>
                        <th>Status</th>
                        <th>Booked By</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredTrips.map(trip => `
                        <tr>
                            <td>${trip.id}</td>
                            <td>${new Date(trip.startDate).toLocaleDateString()}</td>
                            <td>${new Date(trip.endDate).toLocaleDateString()}</td>
                            <td>${trip.type}</td>
                            <td>${trip.routeType}</td>
                            <td>${trip.pickupLocation}</td>
                            <td>${trip.dropLocation || 'N/A'}</td>
                            <td><span class="trip-status status-${trip.status}">${trip.status}</span></td>
                            <td>${trip.bookedBy}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Load Finance
function loadFinance() {
    const financeContainer = document.getElementById('financeContent');
    
    if (payments.length === 0) {
        financeContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-money-bill"></i>
                <h3>No payments found</h3>
                <p>No driver payments recorded yet</p>
            </div>
        `;
        return;
    }
    
    financeContainer.innerHTML = payments.map(payment => `
        <div class="payment-card">
            <div class="payment-card-header">
                Payment ID: ${payment.id}
            </div>
            <div class="payment-card-body">
                <div class="payment-info">
                    <strong>Driver:</strong> ${payment.driverName}
                </div>
                <div class="payment-info">
                    <strong>Trip ID:</strong> ${payment.tripId}
                </div>
                <div class="payment-info">
                    <strong>Date:</strong> ${new Date(payment.date).toLocaleDateString()}
                </div>
                <div class="payment-info">
                    <strong>Method:</strong> ${payment.paymentMethod || 'Cash'}
                </div>
                <div class="payment-info">
                    <strong>Description:</strong> ${payment.description}
                </div>
                <div class="payment-info">
                    <strong>Status:</strong> ${payment.status}
                </div>
                <div class="payment-info">
                    <strong>Paid By:</strong> ${payment.paidBy}
                </div>
                <div class="payment-amount">
                    ₹${payment.amount}
                </div>
                <div class="payment-actions">
                    ${['admin', 'manager', 'finance'].includes(currentUser.role) ? `
                        <button class="btn btn-secondary" onclick="editPayment('${payment.id}')">Edit</button>
                    ` : ''}
                    ${payment.status === 'paid' ? `
                        <button class="btn btn-primary" onclick="generateInvoice('${payment.id}')">
                            <i class="fas fa-download"></i> Invoice
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Load Users
function loadUsers() {
    const usersContainer = document.getElementById('usersList');
    
    if (users.length === 0) {
        usersContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>No users found</h3>
                <p>Add your first user to get started</p>
            </div>
        `;
        return;
    }
    
    usersContainer.innerHTML = users.map(user => `
        <div class="user-card">
            <div class="user-card-header">
                User ID: ${user.id}
            </div>
            <div class="user-card-body">
                <div class="user-info">
                    <strong>Name:</strong> ${user.name}
                </div>
                <div class="user-info">
                    <strong>Mobile:</strong> ${user.mobile}
                </div>
                <div class="user-info">
                    <strong>Role:</strong> ${user.role}
                </div>
                <div class="user-actions">
                    <button class="btn btn-secondary" onclick="editUser('${user.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteUser('${user.id}')">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Handle User Add/Edit
function handleUserAdd(event) {
    event.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const isEdit = userId !== '';
    
    const userData = {
        name: document.getElementById('userName').value,
        mobile: document.getElementById('userMobile').value,
        password: document.getElementById('userPassword').value,
        role: document.getElementById('userRole').value
    };
    
    if (isEdit) {
        // Edit existing user
        const userIndex = users.findIndex(user => user.id === userId);
        if (userIndex === -1) {
            alert('User not found');
            return;
        }
        
        // Check if mobile already exists (excluding current user)
        if (users.some(user => user.mobile === userData.mobile && user.id !== userId)) {
            alert('User with this mobile number already exists');
            return;
        }
        
        // Update user data
        users[userIndex] = {
            ...users[userIndex],
            name: userData.name,
            mobile: userData.mobile,
            password: userData.password,
            role: userData.role,
            updatedBy: currentUser.name,
            updatedAt: new Date().toISOString()
        };
        
        alert(`User ${userId} updated successfully!`);
    } else {
        // Add new user
        const newUserData = {
            id: `USR${(users.length + 1).toString().padStart(3, '0')}`,
            ...userData,
            addedBy: currentUser.name,
            addedAt: new Date().toISOString()
        };
        
        // Check if mobile already exists
        if (users.some(user => user.mobile === userData.mobile)) {
            alert('User with this mobile number already exists');
            return;
        }
        
        // Add user to array
        users.push(newUserData);
        
        alert(`User added successfully! User ID: ${newUserData.id}`);
    }
    
    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    // Close modal and reset form
    closeModal();
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    
    // Reload users
    loadUsers();
}

// Delete User
function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        users = users.filter(user => user.id !== userId);
        localStorage.setItem('users', JSON.stringify(users));
        loadUsers();
    }
}

// Edit User
function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) {
        alert('User not found');
        return;
    }
    
    // Fill the form with user data
    document.getElementById('userId').value = user.id;
    document.getElementById('userName').value = user.name;
    document.getElementById('userMobile').value = user.mobile;
    document.getElementById('userPassword').value = user.password;
    document.getElementById('userRole').value = user.role;
    
    // Update modal title and button text
    document.getElementById('userModalTitle').textContent = 'Edit User';
    document.getElementById('userSubmitBtn').textContent = 'Update User';
    
    // Open modal
    openModal('userModal');
}

// Load Trips
function loadTrips() {
    const tripsContainer = document.getElementById('tripsList');
    
    if (trips.length === 0) {
        tripsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-route"></i>
                <h3>No trips found</h3>
                <p>Start by booking your first trip</p>
            </div>
        `;
        return;
    }
    
    // Sort trips by date (most recent first)
    const sortedTrips = [...trips].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    
    tripsContainer.innerHTML = sortedTrips.map(trip => `
        <div class="trip-card">
            <div class="trip-card-header">
                Trip ID: ${trip.id}
                <span class="trip-status status-${trip.status}">${trip.status}</span>
            </div>
            <div class="trip-card-body">
                ${trip.customerName ? `
                    <div class="trip-detail">
                        <span><strong>Customer:</strong></span>
                        <span>${trip.customerName}</span>
                    </div>
                ` : ''}
                ${trip.customerMobile ? `
                    <div class="trip-detail">
                        <span><strong>Mobile:</strong></span>
                        <span>${trip.customerMobile}</span>
                    </div>
                ` : ''}
                <div class="trip-detail">
                    <span><strong>Type:</strong></span>
                    <span>${trip.type}</span>
                </div>
                <div class="trip-detail">
                    <span><strong>Route:</strong></span>
                    <span>${trip.routeType}</span>
                </div>
                <div class="trip-detail">
                    <span><strong>Pickup:</strong></span>
                    <span>${trip.pickupLocation}</span>
                </div>
                ${trip.dropLocation ? `
                    <div class="trip-detail">
                        <span><strong>Drop:</strong></span>
                        <span>${trip.dropLocation}</span>
                    </div>
                ` : ''}
                <div class="trip-detail">
                    <span><strong>Vehicle:</strong></span>
                    <span>${trip.vehicleType} - ${trip.transmissionType}</span>
                </div>
                <div class="trip-detail">
                    <span><strong>Start Date:</strong></span>
                    <span>${new Date(trip.startDate).toLocaleDateString()}</span>
                </div>
                <div class="trip-detail">
                    <span><strong>Booked By:</strong></span>
                    <span>${trip.bookedBy}</span>
                </div>
                ${trip.cancellationReason ? `
                    <div class="trip-detail">
                        <span><strong>Cancellation Reason:</strong></span>
                        <span>${trip.cancellationReason}</span>
                    </div>
                ` : ''}
                <div class="trip-actions">
                    <button class="btn btn-secondary" onclick="viewTrip('${trip.id}')">View Details</button>
                    ${currentUser.role === 'admin' && trip.status !== 'cancelled' ? `
                        <button class="btn btn-danger" onclick="cancelTrip('${trip.id}')">Cancel Trip</button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// View Trip Details
function viewTrip(tripId) {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) {
        alert('Trip not found');
        return;
    }
    
    let details = `Trip ID: ${trip.id}\n`;
    details += `Customer: ${trip.customerName || 'N/A'}\n`;
    details += `Mobile: ${trip.customerMobile || 'N/A'}\n`;
    details += `Type: ${trip.type}\n`;
    details += `Route: ${trip.routeType}\n`;
    details += `Pickup: ${trip.pickupLocation}\n`;
    if (trip.dropLocation) details += `Drop: ${trip.dropLocation}\n`;
    details += `Vehicle: ${trip.vehicleType} - ${trip.transmissionType}\n`;
    details += `Start Date: ${new Date(trip.startDate).toLocaleString()}\n`;
    details += `End Date: ${new Date(trip.endDate).toLocaleString()}\n`;
    details += `Status: ${trip.status}\n`;
    details += `Booked By: ${trip.bookedBy}\n`;
    details += `Booked At: ${new Date(trip.bookedAt).toLocaleString()}`;
    if (trip.cancellationReason) details += `\nCancellation Reason: ${trip.cancellationReason}`;
    
    alert(details);
}

// Cancel Trip
function cancelTrip(tripId) {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) {
        alert('Trip not found');
        return;
    }
    
    if (trip.status === 'cancelled') {
        alert('Trip is already cancelled');
        return;
    }
    
    document.getElementById('tripIdCancel').value = tripId;
    openModal('cancelTripModal');
}

// Handle Trip Cancellation
function handleTripCancel(event) {
    event.preventDefault();
    
    const tripId = document.getElementById('tripIdCancel').value;
    const reason = document.getElementById('cancellationReason').value;
    
    if (!reason.trim()) {
        alert('Cancellation reason is required');
        return;
    }
    
    // Find and update trip
    const tripIndex = trips.findIndex(t => t.id === tripId);
    if (tripIndex === -1) {
        alert('Trip not found');
        return;
    }
    
    trips[tripIndex].status = 'cancelled';
    trips[tripIndex].cancellationReason = reason;
    trips[tripIndex].cancelledBy = currentUser.name;
    trips[tripIndex].cancelledAt = new Date().toISOString();
    
    // Save to localStorage
    localStorage.setItem('trips', JSON.stringify(trips));
    
    // Close modal and reset form
    closeModal();
    document.getElementById('cancelTripForm').reset();
    
    // Reload trips and dashboard
    loadTrips();
    updateDashboard();
    
    alert(`Trip ${tripId} cancelled successfully!`);
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal() {
    // Reset user form before closing if it was open
    if (document.getElementById('userModal').classList.contains('active')) {
        resetUserForm();
    }
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Reset User Form
function resetUserForm() {
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('userModalTitle').textContent = 'Add User';
    document.getElementById('userSubmitBtn').textContent = 'Add User';
}

// Initialize data from localStorage if available
function initializeFromStorage() {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
        users = JSON.parse(storedUsers);
    }
    
    const storedDrivers = localStorage.getItem('drivers');
    if (storedDrivers) {
        drivers = JSON.parse(storedDrivers);
    }
    
    const storedTrips = localStorage.getItem('trips');
    if (storedTrips) {
        trips = JSON.parse(storedTrips);
    }
    
    const storedPayments = localStorage.getItem('payments');
    if (storedPayments) {
        payments = JSON.parse(storedPayments);
    }
}

// Initialize from storage on load
initializeFromStorage();

// Start Trip
function startTrip(tripId) {
    const tripIndex = trips.findIndex(t => t.id === tripId);
    if (tripIndex === -1) {
        alert('Trip not found');
        return;
    }
    
    if (trips[tripIndex].status !== 'active') {
        alert('Trip cannot be started. Current status: ' + trips[tripIndex].status);
        return;
    }
    
    trips[tripIndex].status = 'in-progress';
    trips[tripIndex].startedBy = currentUser.name;
    trips[tripIndex].actualStartTime = new Date().toISOString();
    
    // Save to localStorage
    localStorage.setItem('trips', JSON.stringify(trips));
    
    // Reload current view
    updateDashboard();
    if (document.getElementById('tripsPage').classList.contains('active')) {
        loadTrips();
    }
    
    alert(`Trip ${tripId} started successfully!`);
}

// End Trip
function endTrip(tripId) {
    const tripIndex = trips.findIndex(t => t.id === tripId);
    if (tripIndex === -1) {
        alert('Trip not found');
        return;
    }
    
    if (trips[tripIndex].status !== 'in-progress') {
        alert('Trip cannot be ended. Current status: ' + trips[tripIndex].status);
        return;
    }
    
    trips[tripIndex].status = 'completed';
    trips[tripIndex].endedBy = currentUser.name;
    trips[tripIndex].actualEndTime = new Date().toISOString();
    
    // Create payment record
    const paymentId = `PAY${(payments.length + 1).toString().padStart(3, '0')}`;
    const newPayment = {
        id: paymentId,
        tripId: tripId,
        driverName: 'To be assigned',
        amount: 0,
        paymentMethod: 'cash',
        status: 'pending',
        description: `Payment for trip ${tripId}`,
        date: new Date().toISOString(),
        paidBy: currentUser.name
    };
    
    payments.push(newPayment);
    
    // Save to localStorage
    localStorage.setItem('trips', JSON.stringify(trips));
    localStorage.setItem('payments', JSON.stringify(payments));
    
    // Reload current view
    updateDashboard();
    if (document.getElementById('tripsPage').classList.contains('active')) {
        loadTrips();
    }
    
    alert(`Trip ${tripId} completed successfully! Payment record ${paymentId} created.`);
}

// Edit Payment
function editPayment(paymentId) {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) {
        alert('Payment not found');
        return;
    }
    
    // Fill the form with payment data
    document.getElementById('paymentId').value = payment.id;
    document.getElementById('paymentTripId').value = payment.tripId;
    document.getElementById('paymentDriverName').value = payment.driverName;
    document.getElementById('paymentAmount').value = payment.amount;
    document.getElementById('paymentMethod').value = payment.paymentMethod || 'cash';
    document.getElementById('paymentStatus').value = payment.status;
    document.getElementById('paymentDescription').value = payment.description;
    
    // Open modal
    openModal('paymentModal');
}

// Handle Payment Update
function handlePaymentUpdate(event) {
    event.preventDefault();
    
    const paymentId = document.getElementById('paymentId').value;
    const paymentIndex = payments.findIndex(p => p.id === paymentId);
    
    if (paymentIndex === -1) {
        alert('Payment not found');
        return;
    }
    
    // Update payment data
    payments[paymentIndex] = {
        ...payments[paymentIndex],
        driverName: document.getElementById('paymentDriverName').value,
        amount: parseFloat(document.getElementById('paymentAmount').value),
        paymentMethod: document.getElementById('paymentMethod').value,
        status: document.getElementById('paymentStatus').value,
        description: document.getElementById('paymentDescription').value,
        updatedBy: currentUser.name,
        updatedAt: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('payments', JSON.stringify(payments));
    
    // Close modal and reload
    closeModal();
    loadFinance();
    
    alert(`Payment ${paymentId} updated successfully!`);
}

// Generate Invoice
function generateInvoice(paymentId) {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) {
        alert('Payment not found');
        return;
    }
    
    const trip = trips.find(t => t.id === payment.tripId);
    if (!trip) {
        alert('Trip not found');
        return;
    }
    
    // Create invoice content
    const invoiceContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2c3e50; margin-bottom: 5px;">DriveBuddy</h1>
                <p style="color: #7f8c8d; margin: 0;">Fleet Management System</p>
                <p style="color: #7f8c8d; margin: 0;">drivebuddyafd@gmail.com</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #2c3e50; margin-bottom: 15px;">Invoice</h2>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span><strong>Invoice ID:</strong></span>
                    <span>INV-${payment.id}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span><strong>Payment ID:</strong></span>
                    <span>${payment.id}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span><strong>Trip ID:</strong></span>
                    <span>${payment.tripId}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span><strong>Date:</strong></span>
                    <span>${new Date(payment.date).toLocaleDateString()}</span>
                </div>
            </div>
            
            <div style="background: #ffffff; border: 1px solid #dee2e6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #2c3e50; margin-bottom: 15px;">Trip Details</h3>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span><strong>Customer:</strong></span>
                    <span>${trip.customerName || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span><strong>Driver:</strong></span>
                    <span>${payment.driverName}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span><strong>Pickup:</strong></span>
                    <span>${trip.pickupLocation}</span>
                </div>
                ${trip.dropLocation ? `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span><strong>Drop:</strong></span>
                        <span>${trip.dropLocation}</span>
                    </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span><strong>Trip Type:</strong></span>
                    <span>${trip.type} - ${trip.routeType}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span><strong>Vehicle:</strong></span>
                    <span>${trip.vehicleType} - ${trip.transmissionType}</span>
                </div>
            </div>
            
            <div style="background: #ffffff; border: 1px solid #dee2e6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #2c3e50; margin-bottom: 15px;">Payment Details</h3>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span><strong>Payment Method:</strong></span>
                    <span>${payment.paymentMethod || 'Cash'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span><strong>Status:</strong></span>
                    <span style="color: ${payment.status === 'paid' ? '#27ae60' : '#f39c12'};">${payment.status.toUpperCase()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span><strong>Description:</strong></span>
                    <span>${payment.description}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 1.2em; font-weight: bold; margin-top: 20px; padding-top: 15px; border-top: 2px solid #3498db;">
                    <span>Total Amount:</span>
                    <span style="color: #27ae60;">₹${payment.amount}</span>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                <p style="color: #7f8c8d; margin: 0;">Thank you for using DriveBuddy!</p>
                <p style="color: #7f8c8d; margin: 5px 0 0 0;">Generated on ${new Date().toLocaleDateString()}</p>
            </div>
        </div>
    `;
    
    // Create and download invoice
    const blob = new Blob([invoiceContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${payment.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Invoice downloaded successfully!');
}

// Calculate Fare
function calculateFare() {
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const tripDate = document.getElementById('tripDate').value;
    
    if (!startTime || !endTime || !tripDate) {
        alert('Please fill in all fields');
        return;
    }
    
    // Parse times
    const startDateTime = new Date(`${tripDate}T${startTime}`);
    const endDateTime = new Date(`${tripDate}T${endTime}`);
    
    // Handle overnight trips
    if (endDateTime < startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
    }
    
    const totalMilliseconds = endDateTime - startDateTime;
    const totalHours = totalMilliseconds / (1000 * 60 * 60);
    
    // Calculate daytime and nighttime hours
    let daytimeHours = 0;
    let nighttimeHours = 0;
    
    const currentTime = new Date(startDateTime);
    const interval = 15; // 15-minute intervals for precise calculation
    
    while (currentTime < endDateTime) {
        const hour = currentTime.getHours();
        const minutesToAdd = Math.min(interval, (endDateTime - currentTime) / (1000 * 60));
        
        if (hour >= 7 && hour < 22) {
            daytimeHours += minutesToAdd / 60;
        } else {
            nighttimeHours += minutesToAdd / 60;
        }
        
        currentTime.setMinutes(currentTime.getMinutes() + minutesToAdd);
    }
    
    // Pricing structure
    const daytimeDriverRate = 86;
    const nighttimeDriverRate = 96;
    const companyRate = 14;
    const gstRate = 0.18;
    
    // Calculate amounts
    const driverAmount = (daytimeHours * daytimeDriverRate) + (nighttimeHours * nighttimeDriverRate);
    const companyAmount = totalHours * companyRate;
    const subtotal = driverAmount + companyAmount;
    const gstAmount = subtotal * gstRate;
    const totalAmount = subtotal + gstAmount;
    
    // Display results
    document.getElementById('totalHours').textContent = totalHours.toFixed(2);
    document.getElementById('daytimeHours').textContent = daytimeHours.toFixed(2);
    document.getElementById('nighttimeHours').textContent = nighttimeHours.toFixed(2);
    document.getElementById('driverAmount').textContent = `₹${driverAmount.toFixed(2)}`;
    document.getElementById('companyAmount').textContent = `₹${companyAmount.toFixed(2)}`;
    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('gstAmount').textContent = `₹${gstAmount.toFixed(2)}`;
    document.getElementById('totalAmount').textContent = `₹${totalAmount.toFixed(2)}`;
    
    document.getElementById('fareResult').style.display = 'block';
}
