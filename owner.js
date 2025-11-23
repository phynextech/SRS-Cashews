// API Functions
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Load products from MongoDB
async function loadProducts() {
  try {
    const productsArray = await apiCall('/products');
    
    // Convert array to object with id as key
    products = {};
    productsArray.forEach(product => {
      products[product.id] = product;
    });
    
    renderOwnerForms();
    updateStats();
  } catch (error) {
    console.error('Failed to load products from API:', error);
    showNotification('Failed to load products. Using local data.', true);
    loadLocalProducts();
  }
}

// Load orders from MongoDB
async function loadOrders() {
  try {
    orders = await apiCall('/orders');
    filteredOrders = [...orders];
    renderOrderHistory();
    renderOrderNotifications();
    renderRecentOrders();
    updateStats();
  } catch (error) {
    console.error('Failed to load orders from API:', error);
    showNotification('Failed to load orders.', true);
  }
}

// Save product to MongoDB
async function saveProductToDB(productId, productData) {
  try {
    return await apiCall(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  } catch (error) {
    console.error('Error saving product:', error);
    throw error;
  }
}

// Add new product to MongoDB
async function addProductToDB(productData) {
  try {
    return await apiCall('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
}

// Delete product from MongoDB
async function deleteProduct(productId) {
  try {
    await apiCall(`/products/${productId}`, {
      method: 'DELETE'
    });
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

// Update order status
async function updateOrderStatus(orderId, status) {
  try {
    await apiCall(`/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    return true;
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
}


// Global data
let products = {};
let orders = [];
let filteredOrders = [];

// DOM elements
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const passwordSection = document.getElementById('login');
const ownerPassword = document.getElementById('owner-password');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const saveChangesBtn = document.getElementById('save-changes');
const productForms = document.getElementById('product-forms');
const orderList = document.getElementById('order-list');
const addProductBtn = document.getElementById('add-product-btn');
const refreshOrdersBtn = document.getElementById('refresh-orders');
const totalOrdersElement = document.getElementById('total-orders');
const totalRevenueElement = document.getElementById('total-revenue');
const totalProductsElement = document.getElementById('total-products');
const totalCustomersElement = document.getElementById('total-customers');
const recentOrdersList = document.getElementById('recent-orders-list');

// SMS page elements
const orderNotifications = document.getElementById('order-notifications');
const sendAllSmsBtn = document.getElementById('send-all-sms');
const sendAllSmsPortalBtn = document.getElementById('send-all-sms-portal');
const refreshOrdersSmsBtn = document.getElementById('refresh-orders-sms');
const pendingOrdersElement = document.getElementById('pending-orders');
const totalCustomersSmsElement = document.getElementById('total-customers-sms');

// Form elements
const newProductName = document.getElementById('new-product-name');
const newProductTamil = document.getElementById('new-product-tamil');
const newProductPrice = document.getElementById('new-product-price');
const newProductCategory = document.getElementById('new-product-category');
const newProductDescription = document.getElementById('new-product-description');
const newProductImage = document.getElementById('new-product-image');
const newProductBadge = document.getElementById('new-product-badge');
const productSearch = document.getElementById('product-search');

// Filter elements
const orderFilters = document.querySelectorAll('.filter-btn');

// Owner password
const OWNER_PASSWORD = "srs123";

// Initialize the owner portal
async function init() {
    setupEventListeners();
    // Don't load data until user is authenticated
}

// API Functions
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// Load products from MongoDB
async function loadProducts() {
    try {
        const productsArray = await apiCall('/products');
        
        // Convert array to object with id as key
        products = {};
        productsArray.forEach(product => {
            products[product.id] = product;
        });
        
        renderOwnerForms();
        updateStats();
    } catch (error) {
        console.error('Failed to load products from API:', error);
        showNotification('Failed to load products. Using local data.', true);
        loadLocalProducts();
    }
}

// Add dummy orders for demonstration
function addDummyOrders() {
    const dummyOrders = [
        {
            _id: "dummy_order_1",
            customerName: "Rajesh Kumar",
            customerPhone: "+91 9876543210",
            customerAddress: "123 MG Road, Anna Nagar",
            customerPincode: "600040",
            customerPlace: "Chennai",
            paymentMethod: "cod",
            date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            items: [
                {
                    name: "Batham Cashew Nuts",
                    nameTamil: "பாதாம் முந்திரி",
                    price: 140,
                    quantity: 2,
                    total: 280,
                    productId: "batham"
                },
                {
                    name: "Premium California Almonds",
                    nameTamil: "பாதாம்",
                    price: 120,
                    quantity: 1,
                    total: 120,
                    productId: "badam"
                }
            ],
            total: 450, // 400 + 50 shipping
            status: "pending",
            source: "SRS Cashews Website"
        },
        {
            _id: "dummy_order_2",
            customerName: "Priya Sharma",
            customerPhone: "+91 8765432109",
            customerAddress: "45 Gandhi Street, T Nagar",
            customerPincode: "600017",
            customerPlace: "Chennai",
            paymentMethod: "online",
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            items: [
                {
                    name: "W-180 Premium Cashews",
                    nameTamil: "W-180 முந்திரி",
                    price: 160,
                    quantity: 3,
                    total: 480,
                    productId: "w180"
                },
                {
                    name: "Iranian Pistachios",
                    nameTamil: "பிஸ்தா",
                    price: 160,
                    quantity: 1,
                    total: 160,
                    productId: "pista"
                },
                {
                    name: "Medjool Dates",
                    nameTamil: "பேரீச்சம் பழம்",
                    price: 80,
                    quantity: 2,
                    total: 160,
                    productId: "dates"
                }
            ],
            total: 850, // 800 + 50 shipping
            status: "completed",
            source: "SRS Cashews Website"
        },
        {
            _id: "dummy_order_3",
            customerName: "Arun Patel",
            customerPhone: "+91 7654321098",
            customerAddress: "78 Nehru Street, Adyar",
            customerPincode: "600020",
            customerPlace: "Chennai",
            paymentMethod: "cod",
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            items: [
                {
                    name: "Jumbo Whole Cashews",
                    nameTamil: "காஜு முந்திரி",
                    price: 130,
                    quantity: 4,
                    total: 520,
                    productId: "kaju"
                }
            ],
            total: 570, // 520 + 50 shipping
            status: "pending",
            source: "SRS Cashews Website"
        },
        {
            _id: "dummy_order_4",
            customerName: "Deepa Iyer",
            customerPhone: "+91 6543210987",
            customerAddress: "22 Velachery Main Road",
            customerPincode: "600042",
            customerPlace: "Chennai",
            paymentMethod: "online",
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            items: [
                {
                    name: "W-210 Cashews",
                    nameTamil: "W-210 முந்திரி",
                    price: 150,
                    quantity: 2,
                    total: 300,
                    productId: "w210"
                },
                {
                    name: "Roasted Fox Nuts",
                    nameTamil: "மகானா",
                    price: 90,
                    quantity: 3,
                    total: 270,
                    productId: "makhana"
                }
            ],
            total: 620, // 570 + 50 shipping
            status: "cancelled",
            source: "SRS Cashews Website"
        }
    ];

    // Add dummy orders to the orders array
    orders = [...dummyOrders, ...orders];
    filteredOrders = [...orders];
}

// Load orders from MongoDB
async function loadOrders() {
    try {
        // Try to load from API first
        const apiOrders = await apiCall('/orders');
        orders = apiOrders;
    } catch (error) {
        console.error('Failed to load orders from API, using dummy data:', error);
        // Use dummy data if API fails
        orders = [];
    }
    
    // Always add dummy orders for demonstration
    addDummyOrders();
    
    filteredOrders = [...orders];
    renderOrderHistory();
    renderOrderNotifications();
    renderRecentOrders();
    updateStats();
}

// Fallback to local products with all products from customer page
function loadLocalProducts() {
    products = {
        // Premium Panruti Cashews
        batham: { 
            id: "batham",
            name: "Batham Cashew Nuts", 
            nameTamil: "பாதாம் முந்திரி",
            price: 140,
            description: "Premium Batham cashews with creamy texture and buttery flavor from Panruti.",
            image: "https://m.media-amazon.com/images/I/71o-btxbBiL._AC_UF894,1000_QL80_.jpg",
            category: "cashews",
            badge: "Panruti Special"
        },
        kaju: { 
            id: "kaju",
            name: "Jumbo Whole Cashews", 
            nameTamil: "காஜு முந்திரி",
            price: 130,
            description: "Extra large whole cashews with creamy texture and buttery flavor from Panruti farms.",
            image: "https://rukminim2.flixcart.com/image/480/480/ks3jjbk0/nut-dry-fruit/4/s/c/1-premium-whole-cashew-nuts-w210-1-kg-1000-gm-big-size-jumbo-original-imag5qq8dfvfvgcj.jpeg?q=90",
            category: "cashews",
            badge: "Premium"
        },
        
        
        // Other Nuts
        badam: { 
            id: "badam",
            name: "Premium California Almonds", 
            nameTamil: "பாதாம்",
            price: 120,
            description: "Large, crunchy California almonds with rich flavor and perfect texture.",
            image: "https://cdn.britannica.com/04/194904-050-1B92812A/Raw-Food-Almond-food-Nut-Snack.jpg",
            category: "nuts",
            badge: "Premium"
        },
        akhrot: { 
            id: "akhrot",
            name: "Premium Walnut Halves", 
            nameTamil: "அக்ரோட்",
            price: 110,
            description: "Fresh walnut halves with rich, earthy flavor and crisp texture.",
            image: "https://images.squarespace-cdn.com/content/v1/56968a5740667a086de661b9/1452716746154-37ZAQOIRP2SGG74534IX/WalnutHalves2.jpg?format=1500w",
            category: "nuts"
        },
        pista: { 
            id: "pista",
            name: "Iranian Pistachios", 
            nameTamil: "பிஸ்தா",
            price: 160,
            description: "Premium Iranian pistachios, naturally opened and lightly salted.",
            image: "https://iran-pistachio.com/wp-content/uploads/2018/11/iran-pistachio-slider-2-small.jpg",
            category: "nuts",
            badge: "Premium"
        },
        makhana: { 
            id: "makhana",
            name: "Roasted Fox Nuts", 
            nameTamil: "மகானா",
            price: 90,
            description: "Lightly roasted fox nuts, perfect for healthy snacking.",
            image: "https://www.mydiversekitchen.com/wp-content/uploads/2015/01/image.1024x1024.jpg",
            category: "nuts"
        },
        kishmish: { 
            id: "kishmish",
            name: "Black Raisins", 
            nameTamil: "கிஸ்மிஸ்",
            price: 60,
            description: "Sweet black raisins, perfect for cooking and snacking.",
            image: "https://nuttyyogi.com/cdn/shop/products/blackraisins.png?v=1680767584",
            category: "dryfruits"
        },
        
        // Dry Fruits
        dates: { 
            id: "dates",
            name: "Medjool Dates", 
            nameTamil: "பேரீச்சம் பழம்",
            price: 80,
            description: "Premium Medjool dates, naturally sweet and rich in fiber.",
            image: "https://cdn.shopify.com/s/files/1/0437/8953/files/Medjool_Dates_15_2048x2048.jpg?v=1745516427",
            category: "dryfruits",
            badge: "Healthy"
        },
        blackdates: { 
            id: "blackdates",
            name: "Black Dates", 
            nameTamil: "கரு பேரீச்சம் பழம்",
            price: 95,
            description: "Rich black dates with deep flavor and nutritional benefits.",
            image: "https://5.imimg.com/data5/SELLER/Default/2022/4/QL/VY/ON/15059881/black-dates.jpg",
            category: "dryfruits"
        },
        anjeer: { 
            id: "anjeer",
            name: "Dried Figs", 
            nameTamil: "அத்தி பழம்",
            price: 110,
            description: "Natural dried figs, rich in fiber and essential nutrients.",
            image: "https://images-cdn.ubuy.ae/647de208711e2c6fa754c6f0-premium-afghani-anjeer-dried-figs.jpg",
            category: "dryfruits"
        },
        apricot: { 
            id: "apricot",
            name: "Dried Apricots", 
            nameTamil: "சர்க்கரை பாதாமி",
            price: 85,
            description: "Sun-dried apricots with natural sweetness and chewy texture.",
            image: "https://rukminim2.flixcart.com/image/480/640/xif0q/nut-dry-fruit/v/o/r/200-premium-quality-dried-apricot-i-dry-fruits-apricots-i-pack-original-imahff8gtyth4fe3.jpeg?q=90",
            category: "dryfruits"
        },
        prune: { 
            id: "prune",
            name: "Dried Prunes", 
            nameTamil: "உலர்ந்த கொடிமுந்திரி",
            price: 75,
            description: "Natural dried prunes, great for digestive health.",
            image: "https://www.forksoverknives.com/uploads/2024/09/dried-plums-prunes.jpg?auto=webp",
            category: "dryfruits"
        },
        
        // Seeds
        pumpkineseeds: { 
            id: "pumpkineseeds",
            name: "Pumpkin Seeds", 
            nameTamil: "பூசணி விதைகள்",
            price: 70,
            description: "Roasted pumpkin seeds, rich in zinc and magnesium.",
            image: "https://rukminim2.flixcart.com/image/480/640/xif0q/nut-dry-fruit/v/s/w/1-pumpkeen-250g-flax-seed-250g-sunflower-250g-chai-seed-250g-4-original-imaguuvh3dsu3tqw.jpeg?q=90",
            category: "seeds",
            badge: "Popular"
        },
        sunflowerseeds: { 
            id: "sunflowerseeds",
            name: "Sunflower Seeds", 
            nameTamil: "சூரியகாந்தி விதைகள்",
            price: 55,
            description: "Raw sunflower seeds, packed with vitamin E and healthy fats.",
            image: "https://m.media-amazon.com/images/I/61EuHk70+oL._AC_UF894,1000_QL80_.jpg",
            category: "seeds"
        },
        flaxseeds: { 
            id: "flaxseeds",
            name: "Flax Seeds", 
            nameTamil: "அளசி விதைகள்",
            price: 65,
            description: "Organic flax seeds, excellent source of omega-3 fatty acids.",
            image: "https://rukminim2.flixcart.com/image/480/640/xif0q/plant-seed/b/j/k/150-ga-alsi-flax-seeds-dd-150g-garg-agri-original-imah889zfhhvjksa.jpeg?q=90",
            category: "seeds"
        },
        chia: { 
            id: "chia",
            name: "Chia Seeds", 
            nameTamil: "சியா விதைகள்",
            price: 90,
            description: "Premium chia seeds, high in fiber and antioxidants.",
            image: "https://media.post.rvohealth.io/wp-content/uploads/sites/3/2021/11/chia_seeds_GettyImages1282395572_Thumb-732x549.jpg",
            category: "seeds"
        },
        blacksesame: { 
            id: "blacksesame",
            name: "Black Sesame Seeds", 
            nameTamil: "கருப்பு எள்ளு",
            price: 50,
            description: "Natural sesame seeds, rich in calcium and antioxidants.",
            image: "https://m.media-amazon.com/images/I/61l2fI4cEzL._AC_UF1000,1000_QL80_.jpg",
            category: "seeds"
        },
        whitesesame: { 
            id: "whitesesame",
            name: "White Sesame Seeds", 
            nameTamil: "வெள்ளை எள்ளு",
            price: 50,
            description: "Natural sesame seeds, rich in calcium and antioxidants.",
            image: "https://rukminim2.flixcart.com/image/480/640/kgqvlow0/edible-seed/t/c/x/500-pouch-raw-shree-whole-original-imafww6ytwqgbcxq.jpeg?q=90",
            category: "seeds"
        },
        // Premium Category
        macadamia: { 
            id: "macadamia",
            name: "Hawaiian Macadamia Nuts", 
            nameTamil: "மக்கடாமியா",
            price: 200,
            description: "Rich, buttery Hawaiian macadamia nuts, lightly roasted.",
            image: "https://www.asiafarming.com/wp-content/uploads/2023/12/Macadamia-Nuts-Cultivation4-1024x682.jpg",
            category: "premium",
            badge: "Premium"
        },
        brazil: { 
            id: "brazil",
            name: "Brazil Nuts", 
            nameTamil: "பிரேசில் கொட்டை",
            price: 180,
            description: "Large Brazil nuts, excellent source of selenium.",
            image: "https://hodmedods.co.uk/cdn/shop/files/Brazil_Nuts_bowl_board_3x2_903c992b-0ab4-4196-9e20-c3453d3c7096_2000x.jpg?v=1731778883",
            category: "premium"
        },
        pecans: { 
            id: "pecans",
            name: "Pecan Nuts", 
            nameTamil: "பிகான் கொட்டை",
            price: 170,
            description: "Sweet and buttery pecan nuts, perfect for baking.",
            image: "https://media.post.rvohealth.io/wp-content/uploads/2020/08/pecans-732x549-thumbnail.jpg",
            category: "premium"
        }
    };
    renderOwnerForms();
    updateStats();
}

// Save product to MongoDB
async function saveProductToDB(productId, productData) {
    try {
        return await apiCall(`/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    } catch (error) {
        console.error('Error saving product:', error);
        throw error;
    }
}

// Add new product to MongoDB
async function addProductToDB(productData) {
    try {
        return await apiCall('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    } catch (error) {
        console.error('Error adding product:', error);
        throw error;
    }
}

// Delete product from MongoDB
async function deleteProduct(productId) {
    try {
        await apiCall(`/products/${productId}`, {
            method: 'DELETE'
        });
        return true;
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
}

// Update order status
async function updateOrderStatus(orderId, status) {
    try {
        await apiCall(`/orders/${orderId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        return true;
    } catch (error) {
        console.error('Error updating order:', error);
        throw error;
    }
}

// Tab navigation functionality
function setupTabNavigation() {
    const tabs = document.querySelectorAll('.owner-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// OWNER PORTAL FUNCTIONS - UPDATED COMPACT LAYOUT
function renderOwnerForms() {
    productForms.innerHTML = '';
    
    if (Object.keys(products).length === 0) {
        productForms.innerHTML = '<p class="no-data">No products found. Add your first product!</p>';
        return;
    }
    
    const searchTerm = productSearch.value.toLowerCase();
    const filteredProducts = Object.entries(products).filter(([id, product]) => 
        product.name.toLowerCase().includes(searchTerm) ||
        (product.nameTamil && product.nameTamil.toLowerCase().includes(searchTerm)) ||
        product.description.toLowerCase().includes(searchTerm)
    );
    
    if (filteredProducts.length === 0) {
        productForms.innerHTML = '<p class="no-data">No products match your search.</p>';
        return;
    }
    
    filteredProducts.forEach(([productId, product]) => {
        const form = document.createElement('div');
        form.className = 'product-edit-form';
        form.innerHTML = `
            <div class="product-image-section">
                <div class="current-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/80x60?text=SRS+Cashews'">
                </div>
                <div class="image-url-input">
                    <label for="${productId}-image">Image URL</label>
                    <input type="text" class="form-control compact-form-control" id="${productId}-image" value="${product.image}" 
                           placeholder="Image URL" oninput="updateImagePreview('${productId}')">
                    <div class="image-preview-container">
                        <div class="image-preview" id="${productId}-preview">
                            <span>Preview</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="product-details-section">
                <div class="product-header-info">
                    <div class="product-title">${product.name}</div>
                    <div class="product-meta">
                        <span class="product-category-badge">${product.category}</span>
                        <span class="product-price-badge">₹${product.price}</span>
                    </div>
                </div>
                
                <!-- First Row: Name, Tamil Name, Price -->
                <div class="product-main-row">
                    <div class="compact-form-group product-name-input">
                        <label for="${productId}-name">Name</label>
                        <input type="text" class="compact-form-control" id="${productId}-name" value="${product.name}">
                    </div>
                    <div class="compact-form-group product-tamil-input">
                        <label for="${productId}-tamil">Tamil</label>
                        <input type="text" class="compact-form-control" id="${productId}-tamil" value="${product.nameTamil || ''}" placeholder="Tamil name">
                    </div>
                    <div class="compact-form-group product-price-input">
                        <label for="${productId}-price">Price</label>
                        <input type="number" class="compact-form-control" id="${productId}-price" value="${product.price}">
                    </div>
                </div>
                
                <!-- Second Row: Description -->
                <div class="compact-form-group product-description-row">
                    <label for="${productId}-description">Description</label>
                    <textarea class="compact-form-control compact-textarea" id="${productId}-description">${product.description}</textarea>
                </div>
                
                <!-- Third Row: Category, Badge, Delete Button -->
                <div class="product-actions-row">
                    <div class="compact-form-group product-category-select">
                        <label for="${productId}-category">Category</label>
                        <select class="compact-form-control" id="${productId}-category">
                            <option value="cashews" ${product.category === 'cashews' ? 'selected' : ''}>Cashews</option>
                            <option value="nuts" ${product.category === 'nuts' ? 'selected' : ''}>Nuts</option>
                            <option value="dryfruits" ${product.category === 'dryfruits' ? 'selected' : ''}>Dry Fruits</option>
                            <option value="seeds" ${product.category === 'seeds' ? 'selected' : ''}>Seeds</option>
                            <option value="premium" ${product.category === 'premium' ? 'selected' : ''}>Premium</option>
                        </select>
                    </div>
                    <div class="compact-form-group product-badge-select">
                        <label for="${productId}-badge">Badge</label>
                        <select class="compact-form-control" id="${productId}-badge">
                            <option value="">No Badge</option>
                            <option value="Panruti Special" ${product.badge === 'Panruti Special' ? 'selected' : ''}>Panruti Special</option>
                            <option value="Premium" ${product.badge === 'Premium' ? 'selected' : ''}>Premium</option>
                            <option value="Popular" ${product.badge === 'Popular' ? 'selected' : ''}>Popular</option>
                            <option value="Healthy" ${product.badge === 'Healthy' ? 'selected' : ''}>Healthy</option>
                        </select>
                    </div>
                    <button class="btn btn-danger compact-btn" onclick="deleteProductHandler('${productId}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        
        productForms.appendChild(form);
    });
}

async function saveProductChanges() {
    const updates = [];
    
    for (const productId in products) {
        const name = document.getElementById(`${productId}-name`).value.trim();
        const nameTamil = document.getElementById(`${productId}-tamil`).value.trim();
        const price = parseInt(document.getElementById(`${productId}-price`).value);
        const category = document.getElementById(`${productId}-category`).value;
        const description = document.getElementById(`${productId}-description`).value.trim();
        const image = document.getElementById(`${productId}-image`).value.trim();
        const badge = document.getElementById(`${productId}-badge`).value;
        
        const productData = {
            id: productId,
            name,
            nameTamil,
            price,
            category,
            description,
            image,
            badge: badge || undefined
        };
        
        updates.push(saveProductToDB(productId, productData));
    }
    
    try {
        await Promise.all(updates);
        await loadProducts(); // Reload products to ensure consistency
        showNotification('All product changes saved successfully!', false, 'success');
    } catch (error) {
        showNotification('Failed to save some changes.', true);
    }
}

async function addNewProduct() {
    const name = newProductName.value.trim();
    const nameTamil = newProductTamil.value.trim();
    const price = parseInt(newProductPrice.value);
    const category = newProductCategory.value;
    const description = newProductDescription.value.trim();
    const image = newProductImage.value.trim();
    const badge = newProductBadge.value;
    
    if (!name || !price || !description || !image) {
        showNotification('Please fill in all required product details.', true);
        return;
    }
    
    if (price <= 0) {
        showNotification('Price must be a positive number.', true);
        return;
    }
    
    const productId = name.toLowerCase().replace(/\s+/g, '-');
    
    const productData = {
        id: productId,
        name,
        nameTamil,
        price,
        category,
        description,
        image,
        badge: badge || undefined
    };
    
    try {
        await addProductToDB(productData);
        
        // Clear form
        newProductName.value = '';
        newProductTamil.value = '';
        newProductPrice.value = '';
        newProductDescription.value = '';
        newProductImage.value = '';
        newProductBadge.value = '';
        document.getElementById('new-product-preview').innerHTML = '<span>Image preview will appear here</span>';
        document.getElementById('new-product-preview').classList.remove('has-image');
        
        // Reload products
        await loadProducts();
        
        showNotification('New product added successfully!', false, 'success');
    } catch (error) {
        showNotification('Failed to add product.', true);
    }
}

async function deleteProductHandler(productId) {
    if (confirm(`Are you sure you want to delete "${products[productId].name}"? This action cannot be undone.`)) {
        try {
            await deleteProduct(productId);
            
            // Remove from local products
            delete products[productId];
            
            // Update the display
            renderOwnerForms();
            updateStats();
            
            showNotification('Product deleted successfully!', false, 'success');
        } catch (error) {
            console.error('Error deleting product:', error);
            showNotification('Failed to delete product.', true);
        }
    }
}

function renderOrderHistory() {
    orderList.innerHTML = '';
    
    if (filteredOrders.length === 0) {
        orderList.innerHTML = '<p class="no-data">No orders found.</p>';
        return;
    }
    
    // Sort orders by date (newest first)
    const sortedOrders = [...filteredOrders].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedOrders.forEach(order => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        
        let itemsHtml = '';
        order.items.forEach(item => {
            itemsHtml += `
                <div class="order-item-row">
                    <span>${item.name}</span>
                    <span>${item.quantity} × 50g = ₹${item.total.toFixed(2)}</span>
                </div>
            `;
        });
        
        const statusClass = getStatusClass(order.status);
        
        orderItem.innerHTML = `
            <div class="order-header">
                <div>
                    <div class="order-customer">${order.customerName}</div>
                    <div class="order-contact">📞 ${order.customerPhone} | 📍 ${order.customerPlace}</div>
                    <div class="order-payment">${order.paymentMethod === 'cod' ? 'COD' : 'Online Payment'}</div>
                </div>
                <div>
                    <div class="order-date">${new Date(order.date).toLocaleString()}</div>
                    <div class="order-status ${statusClass}">${order.status}</div>
                </div>
            </div>
            <div class="order-items">
                ${itemsHtml}
            </div>
            <div class="order-address">
                🏠 ${order.customerAddress}, ${order.customerPincode}
            </div>
            <div class="order-total">Total: ₹${order.total.toFixed(2)}</div>
            <div class="sms-actions">
                <button class="btn btn-sms" onclick="sendSMSNotification('${order.customerName}', '${order.customerPhone}', ${order.total})">
                    <i class="fas fa-sms"></i> Send SMS
                </button>
                <button class="btn btn-primary" onclick="updateOrderStatusHandler('${order._id || order.id}', 'completed')">
                    <i class="fas fa-check"></i> Mark Completed
                </button>
                <button class="btn btn-secondary" onclick="updateOrderStatusHandler('${order._id || order.id}', 'pending')">
                    <i class="fas fa-clock"></i> Mark Pending
                </button>
                <button class="btn btn-danger" onclick="updateOrderStatusHandler('${order._id || order.id}', 'cancelled')">
                    <i class="fas fa-times"></i> Cancel Order
                </button>
            </div>
        `;
        
        orderList.appendChild(orderItem);
    });
}

function renderRecentOrders() {
    recentOrdersList.innerHTML = '';
    
    const recentOrders = orders.slice(0, 5); // Show last 5 orders
    
    if (recentOrders.length === 0) {
        recentOrdersList.innerHTML = '<p class="no-data">No recent orders</p>';
        return;
    }
    
    recentOrders.forEach(order => {
        const orderItem = document.createElement('div');
        orderItem.className = 'recent-order-item';
        orderItem.innerHTML = `
            <div class="recent-order-customer">${order.customerName}</div>
            <div class="recent-order-details">
                ${order.items.length} items • ₹${order.total.toFixed(2)} • ${order.paymentMethod}
            </div>
        `;
        recentOrdersList.appendChild(orderItem);
    });
}

function renderOrderNotifications() {
    orderNotifications.innerHTML = '';
    
    const pendingOrders = orders.filter(order => order.status === 'pending');
    
    if (pendingOrders.length === 0) {
        orderNotifications.innerHTML = '<p class="no-data">No pending orders to notify.</p>';
        return;
    }
    
    pendingOrders.forEach(order => {
        const notification = document.createElement('div');
        notification.className = 'order-notification';
        
        let itemsHtml = '';
        order.items.forEach(item => {
            itemsHtml += `
                <div>${item.quantity} × 50g ${item.name}</div>
            `;
        });
        
        notification.innerHTML = `
            <div class="notification-header">
                <div>
                    <div class="customer-name">${order.customerName}</div>
                    <div class="customer-phone">📞 ${order.customerPhone}</div>
                </div>
                <div class="order-time">${new Date(order.date).toLocaleString()}</div>
            </div>
            <div class="order-details">
                <div class="order-items-list">
                    ${itemsHtml}
                </div>
                <div class="order-total-sms">Total: ₹${order.total.toFixed(2)}</div>
                <div class="order-address">
                    📍 ${order.customerAddress}, ${order.customerPlace} - ${order.customerPincode}
                </div>
            </div>
            <div class="sms-actions">
                <button class="btn btn-sms" onclick="sendSMSNotification('${order.customerName}', '${order.customerPhone}', ${order.total})">
                    <i class="fas fa-paper-plane"></i> Send Order SMS
                </button>
                <button class="btn btn-primary" onclick="sendPaymentReminder('${order.customerName}', '${order.customerPhone}', ${order.total})">
                    <i class="fas fa-money-bill-wave"></i> Payment Reminder
                </button>
            </div>
        `;
        
        orderNotifications.appendChild(notification);
    });
}

function updateStats() {
    // Update main stats
    totalOrdersElement.textContent = orders.length;
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    totalRevenueElement.textContent = `₹${totalRevenue.toFixed(2)}`;
    
    totalProductsElement.textContent = Object.keys(products).length;
    
    const uniqueCustomers = [...new Set(orders.map(order => order.customerPhone))];
    totalCustomersElement.textContent = uniqueCustomers.length;
    
    // Update SMS page stats
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    pendingOrdersElement.textContent = pendingOrders;
    totalCustomersSmsElement.textContent = uniqueCustomers.length;
}

function getStatusClass(status) {
    switch (status) {
        case 'completed': return 'status-completed';
        case 'pending': return 'status-pending';
        case 'cancelled': return 'status-cancelled';
        default: return 'status-pending';
    }
}

async function updateOrderStatusHandler(orderId, status) {
    try {
        await updateOrderStatus(orderId, status);
        
        // Update local orders
        const orderIndex = orders.findIndex(order => order._id === orderId || order.id === orderId);
        if (orderIndex !== -1) {
            orders[orderIndex].status = status;
        }
        
        // Re-render orders
        renderOrderHistory();
        renderOrderNotifications();
        renderRecentOrders();
        updateStats();
        
        showNotification(`Order status updated to ${status}`, false, 'success');
    } catch (error) {
        showNotification('Failed to update order status.', true);
    }
}

// SMS Functions
function sendSMSNotification(customerName, phoneNumber, total) {
    const message = `Hi ${customerName}, your SRS Cashews order of ₹${total} has been confirmed! We'll deliver to you soon from Panruti. Thank you for choosing us!`;
    
    // Simulate SMS sending
    console.log(`SMS to ${phoneNumber}:`, message);
    showNotification(`SMS sent to ${customerName}`, false, 'success');
}

function sendPaymentReminder(customerName, phoneNumber, total) {
    const message = `Hi ${customerName}, friendly reminder for your SRS Cashews order payment of ₹${total}. Please complete the payment to process your order from Panruti.`;
    
    // Simulate SMS sending
    console.log(`Payment reminder to ${phoneNumber}:`, message);
    showNotification(`Payment reminder sent to ${customerName}`, false, 'success');
}

function sendSMSToAll() {
    if (orders.length === 0) {
        showNotification('No orders to send SMS to.', true);
        return;
    }
    
    // Get unique customers
    const uniqueCustomers = [...new Set(orders.map(order => order.customerPhone))];
    
    uniqueCustomers.forEach(phone => {
        const customerOrders = orders.filter(order => order.customerPhone === phone);
        const customerName = customerOrders[0].customerName;
        const totalSpent = customerOrders.reduce((sum, order) => sum + order.total, 0);
        
        const message = `Hi ${customerName}, thank you for your orders totaling ₹${totalSpent.toFixed(2)} from SRS Cashews, Panruti! We appreciate your business.`;
        
        // Simulate SMS sending
        console.log(`SMS to ${phone}:`, message);
    });
    
    showNotification(`SMS notifications sent to ${uniqueCustomers.length} customers`, false, 'success');
}

// Filter orders by status
function filterOrders(status) {
    if (status === 'all') {
        filteredOrders = [...orders];
    } else {
        filteredOrders = orders.filter(order => order.status === status);
    }
    renderOrderHistory();
}

// Refresh orders
async function refreshOrders() {
    await loadOrders();
    showNotification('Orders refreshed!', false, 'success');
}

// Show notification
function showNotification(message, isError = false, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification';
    
    if (isError) {
        notification.classList.add('error');
    } else if (type === 'success') {
        notification.classList.add('success');
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Show page
function showPage(pageId) {
    // Hide all pages
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const activePage = document.getElementById(pageId);
    activePage.classList.add('active');
    
    // Special handling for SMS page
    if (pageId === 'sms') {
        renderOrderNotifications();
    }
}

// Owner portal login
async function loginToOwnerPortal() {
    const password = ownerPassword.value;
    
    if (password === OWNER_PASSWORD) {
        showPage('dashboard');
        
        // Load data
        await loadProducts();
        await loadOrders();
        
        showNotification('Welcome to SRS Cashews Owner Portal!', false, 'success');
    } else {
        showNotification('Incorrect password. Please try again.', true);
    }
}

// Owner portal logout
function logoutFromOwnerPortal() {
    showPage('login');
    ownerPassword.value = '';
    
    // Clear sensitive data
    products = {};
    orders = [];
    filteredOrders = [];
    
    showNotification('Logged out successfully.', false, 'success');
}

// Update image preview for product forms
function updateImagePreview(productId) {
    const imageUrl = document.getElementById(`${productId}-image`).value;
    const preview = document.getElementById(`${productId}-preview`);
    
    if (imageUrl) {
        preview.innerHTML = `<img src="${imageUrl}" alt="Preview" onerror="this.parentElement.innerHTML='<span>Invalid image URL</span>'">`;
        preview.classList.add('has-image');
    } else {
        preview.innerHTML = '<span>Image preview will appear here</span>';
        preview.classList.remove('has-image');
    }
}

// Update new product image preview
function updateNewProductPreview() {
    const imageUrl = document.getElementById('new-product-image').value;
    const preview = document.getElementById('new-product-preview');
    
    if (imageUrl) {
        preview.innerHTML = `<img src="${imageUrl}" alt="Preview" onerror="this.parentElement.innerHTML='<span>Invalid image URL</span>'">`;
        preview.classList.add('has-image');
    } else {
        preview.innerHTML = '<span>Image preview will appear here</span>';
        preview.classList.remove('has-image');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('data-page')) {
                e.preventDefault();
                const pageId = link.getAttribute('data-page');
                showPage(pageId);
            }
        });
    });
    
    // Owner portal
    loginBtn.addEventListener('click', loginToOwnerPortal);
    logoutBtn.addEventListener('click', logoutFromOwnerPortal);
    saveChangesBtn.addEventListener('click', saveProductChanges);
    
    // SMS page
    sendAllSmsBtn.addEventListener('click', sendSMSToAll);
    sendAllSmsPortalBtn.addEventListener('click', sendSMSToAll);
    refreshOrdersSmsBtn.addEventListener('click', refreshOrders);
    refreshOrdersBtn.addEventListener('click', refreshOrders);
    
    // Product management
    addProductBtn.addEventListener('click', addNewProduct);
    
    // New product image preview
    document.getElementById('new-product-image').addEventListener('input', updateNewProductPreview);
    
    // Product search
    productSearch.addEventListener('input', renderOwnerForms);
    
    // Order filters
    orderFilters.forEach(button => {
        button.addEventListener('click', () => {
            orderFilters.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const status = button.getAttribute('data-status');
            filterOrders(status);
        });
    });
    
    // Tab navigation
    setupTabNavigation();
    
    // Allow login with Enter key
    ownerPassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginToOwnerPortal();
        }
    });
}

// Initialize the owner portal when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Export functions for global access
window.updateImagePreview = updateImagePreview;
window.updateNewProductPreview = updateNewProductPreview;
window.deleteProductHandler = deleteProductHandler;
window.updateOrderStatusHandler = updateOrderStatusHandler;
window.sendSMSNotification = sendSMSNotification;
window.sendPaymentReminder = sendPaymentReminder;
