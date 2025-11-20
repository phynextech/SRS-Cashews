// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Global data
let products = {};
let cart = {};
let currentSlide = 0;
let slideInterval;

// DOM elements
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const productsGrid = document.querySelector('.products-grid');
const cartItems = document.querySelector('.cart-items');
const emptyCartMessage = document.getElementById('empty-cart-message');
const subtotalElement = document.getElementById('subtotal');
const totalElement = document.getElementById('total');
const continueShoppingBtn = document.getElementById('continue-shopping');
const placeOrderBtn = document.getElementById('place-order');
const printSummaryBtn = document.getElementById('print-summary');
const notification = document.getElementById('notification');
const cartCount = document.querySelector('.cart-count');
const productSearch = document.getElementById('product-search');
const filterButtons = document.querySelectorAll('.filter-btn');
const categoryCards = document.querySelectorAll('.category-card');

// Carousel elements
const carouselInner = document.querySelector('.carousel-inner');
const carouselItems = document.querySelectorAll('.carousel-item');
const prevButton = document.querySelector('.carousel-control.prev');
const nextButton = document.querySelector('.carousel-control.next');
const indicators = document.querySelectorAll('.carousel-indicator');

// Print bill elements
const printBill = document.getElementById('print-bill');
const billDate = document.getElementById('bill-date');
const billItems = document.getElementById('bill-items');
const billTotal = document.getElementById('bill-total');

// Order popup elements
const orderPopup = document.getElementById('order-popup');
const orderForm = document.getElementById('order-form');
const closePopup = document.querySelector('.close-popup');
const cancelOrder = document.getElementById('cancel-order');
const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
const upiDetails = document.getElementById('upi-details');
const popupOrderItems = document.getElementById('popup-order-items');
const popupTotal = document.getElementById('popup-total');

// Initialize the website
async function init() {
    await loadProducts();
    setupEventListeners();
    updateCartCount();
    startCarousel();
    showNotification('Welcome to SRS Cashews! Premium cashews from Panruti, Tamil Nadu', false);
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
        
        renderProducts();
    } catch (error) {
        console.error('Failed to load products from API, using fallback:', error);
        loadLocalProducts();
    }
}

// Save order to MongoDB
async function saveOrderToDB(orderData) {
    try {
        return await apiCall('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    } catch (error) {
        console.error('Error saving order:', error);
        throw error;
    }
}

// Fallback to local products with expanded selection and Tamil names
function loadLocalProducts() {
    products = {
        // Premium Panruti Cashews
        batham: { 
            id: "batham",
            name: "Batham Cashew Nuts", 
            nameTamil: "பாதாம் முந்திரி",
            price: 140,
            description: "Premium Batham cashews with creamy texture and buttery flavor from Panruti.",
            image: "https://images.unsplash.com/photo-1626074353765-517f5517d9d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "cashews",
            badge: "Panruti Special"
        },
        kaju: { 
            id: "kaju",
            name: "Jumbo Whole Cashews", 
            nameTamil: "காஜு முந்திரி",
            price: 130,
            description: "Extra large whole cashews with creamy texture and buttery flavor from Panruti farms.",
            image: "https://images.unsplash.com/photo-1626074353765-517f5517d9d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "cashews",
            badge: "Premium"
        },
        w180: { 
            id: "w180",
            name: "W-180 Premium Cashews", 
            nameTamil: "W-180 முந்திரி",
            price: 160,
            description: "Large W-180 grade cashews, the finest quality from Panruti.",
            image: "https://images.unsplash.com/photo-1626074353765-517f5517d9d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "cashews",
            badge: "Premium"
        },
        w210: { 
            id: "w210",
            name: "W-210 Cashews", 
            nameTamil: "W-210 முந்திரி",
            price: 150,
            description: "Premium W-210 grade cashews from Panruti farms.",
            image: "https://images.unsplash.com/photo-1626074353765-517f5517d9d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "cashews",
            badge: "Popular"
        },
        w240: { 
            id: "w240",
            name: "W-240 Cashews", 
            nameTamil: "W-240 முந்திரி",
            price: 140,
            description: "Quality W-240 grade cashews, perfect for daily consumption.",
            image: "https://images.unsplash.com/photo-1626074353765-517f5517d9d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "cashews"
        },
        w320: { 
            id: "w320",
            name: "W-320 Cashews", 
            nameTamil: "W-320 முந்திரி",
            price: 130,
            description: "Economical W-320 grade cashews from Panruti.",
            image: "https://images.unsplash.com/photo-1626074353765-517f5517d9d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "cashews"
        },
        
        // Other Nuts
        badam: { 
            id: "badam",
            name: "Premium California Almonds", 
            nameTamil: "பாதாம்",
            price: 120,
            description: "Large, crunchy California almonds with rich flavor and perfect texture.",
            image: "https://images.unsplash.com/photo-1615485500606-f3d3f2f7fb7f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "nuts",
            badge: "Premium"
        },
        akhrot: { 
            id: "akhrot",
            name: "Premium Walnut Halves", 
            nameTamil: "அக்ரோட்",
            price: 110,
            description: "Fresh walnut halves with rich, earthy flavor and crisp texture.",
            image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "nuts"
        },
        pista: { 
            id: "pista",
            name: "Iranian Pistachios", 
            nameTamil: "பிஸ்தா",
            price: 160,
            description: "Premium Iranian pistachios, naturally opened and lightly salted.",
            image: "https://images.unsplash.com/photo-1615485500606-f3d3f2f7fb7f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "nuts",
            badge: "Premium"
        },
        makhana: { 
            id: "makhana",
            name: "Roasted Fox Nuts", 
            nameTamil: "மகானா",
            price: 90,
            description: "Lightly roasted fox nuts, perfect for healthy snacking.",
            image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "nuts"
        },
        kishmish: { 
            id: "kishmish",
            name: "Black Raisins", 
            nameTamil: "கிஸ்மிஸ்",
            price: 60,
            description: "Sweet black raisins, perfect for cooking and snacking.",
            image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd112?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "dryfruits"
        },
        
        // Dry Fruits
        dates: { 
            id: "dates",
            name: "Medjool Dates", 
            nameTamil: "பேரீச்சம் பழம்",
            price: 80,
            description: "Premium Medjool dates, naturally sweet and rich in fiber.",
            image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd112?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "dryfruits",
            badge: "Healthy"
        },
        blackdates: { 
            id: "blackdates",
            name: "Black Dates", 
            nameTamil: "கரு பேரீச்சம் பழம்",
            price: 95,
            description: "Rich black dates with deep flavor and nutritional benefits.",
            image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd112?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "dryfruits"
        },
        anjeer: { 
            id: "anjeer",
            name: "Dried Figs", 
            nameTamil: "அத்தி பழம்",
            price: 110,
            description: "Natural dried figs, rich in fiber and essential nutrients.",
            image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd112?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "dryfruits"
        },
        apricot: { 
            id: "apricot",
            name: "Dried Apricots", 
            nameTamil: "சர்க்கரை பாதாமி",
            price: 85,
            description: "Sun-dried apricots with natural sweetness and chewy texture.",
            image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd112?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "dryfruits"
        },
        prune: { 
            id: "prune",
            name: "Dried Prunes", 
            nameTamil: "உலர்ந்த ப்ளம்",
            price: 75,
            description: "Natural dried prunes, great for digestive health.",
            image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd112?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "dryfruits"
        },
        
        // Seeds
        pumpkineseeds: { 
            id: "pumpkineseeds",
            name: "Pumpkin Seeds", 
            nameTamil: "பூசணி விதைகள்",
            price: 70,
            description: "Roasted pumpkin seeds, rich in zinc and magnesium.",
            image: "https://images.unsplash.com/photo-1623650077315-9df4c0a7d3b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "seeds",
            badge: "Popular"
        },
        sunflowerseeds: { 
            id: "sunflowerseeds",
            name: "Sunflower Seeds", 
            nameTamil: "சூரியகாந்தி விதைகள்",
            price: 55,
            description: "Raw sunflower seeds, packed with vitamin E and healthy fats.",
            image: "https://images.unsplash.com/photo-1623650077315-9df4c0a7d3b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "seeds"
        },
        flaxseeds: { 
            id: "flaxseeds",
            name: "Flax Seeds", 
            nameTamil: "அளசி விதைகள்",
            price: 65,
            description: "Organic flax seeds, excellent source of omega-3 fatty acids.",
            image: "https://images.unsplash.com/photo-1623650077315-9df4c0a7d3b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "seeds"
        },
        chia: { 
            id: "chia",
            name: "Chia Seeds", 
            nameTamil: "சியா விதைகள்",
            price: 90,
            description: "Premium chia seeds, high in fiber and antioxidants.",
            image: "https://images.unsplash.com/photo-1623650077315-9df4c0a7d3b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "seeds"
        },
        sesame: { 
            id: "sesame",
            name: "Sesame Seeds", 
            nameTamil: "எள்ளு",
            price: 50,
            description: "Natural sesame seeds, rich in calcium and antioxidants.",
            image: "https://images.unsplash.com/photo-1623650077315-9df4c0a7d3b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "seeds"
        },
        
        // Premium Category
        macadamia: { 
            id: "macadamia",
            name: "Hawaiian Macadamia Nuts", 
            nameTamil: "மக்கடாமியா",
            price: 200,
            description: "Rich, buttery Hawaiian macadamia nuts, lightly roasted.",
            image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "premium",
            badge: "Premium"
        },
        brazil: { 
            id: "brazil",
            name: "Brazil Nuts", 
            nameTamil: "பிரேசில் கொட்டை",
            price: 180,
            description: "Large Brazil nuts, excellent source of selenium.",
            image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "premium"
        },
        pecans: { 
            id: "pecans",
            name: "Pecan Nuts", 
            nameTamil: "பிகான் கொட்டை",
            price: 170,
            description: "Sweet and buttery pecan nuts, perfect for baking.",
            image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "premium"
        }
    };
    renderProducts();
}

// CAROUSEL FUNCTIONS
function startCarousel() {
    slideInterval = setInterval(() => {
        nextSlide();
    }, 5000);
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % carouselItems.length;
    updateCarousel();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + carouselItems.length) % carouselItems.length;
    updateCarousel();
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
}

function updateCarousel() {
    carouselInner.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    indicators.forEach((indicator, index) => {
        if (index === currentSlide) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

// PRODUCT FUNCTIONS
function renderProducts(filter = 'all', searchTerm = '') {
    productsGrid.innerHTML = '';
    
    let filteredProducts = {};
    
    for (const productId in products) {
        const product = products[productId];
        
        if (filter !== 'all' && product.category !== filter) {
            continue;
        }
        
        if (searchTerm && 
            !product.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !product.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !(product.nameTamil && product.nameTamil.toLowerCase().includes(searchTerm.toLowerCase()))) {
            continue;
        }
        
        filteredProducts[productId] = product;
    }
    
    for (const productId in filteredProducts) {
        const product = filteredProducts[productId];
        
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/320x250?text=SRS+Cashews'">
                ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                ${product.nameTamil ? `<div class="product-name-tamil">${product.nameTamil}</div>` : ''}
                <p class="product-description">${product.description}</p>
                <div class="product-price">₹${product.price} / 50g</div>
                <div class="quantity-selector">
                    <button class="quantity-btn minus" data-product="${productId}">-</button>
                    <input type="text" class="quantity-input" data-product="${productId}" value="0" readonly>
                    <button class="quantity-btn plus" data-product="${productId}">+</button>
                </div>
                <div class="quantity-label">Quantity (50g increments)</div>
                <button class="add-to-cart" data-product="${productId}">
                    <i class="fas fa-shopping-cart"></i>
                    Add to Cart
                </button>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    }
    
    if (Object.keys(filteredProducts).length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-products" style="grid-column: 1/-1; text-align: center; padding: 4rem;">
                <i class="fas fa-search" style="font-size: 4rem; color: #475569; margin-bottom: 1rem;"></i>
                <h3 style="color: #94a3b8; margin-bottom: 1rem;">No products found</h3>
                <p style="color: #64748b;">Try adjusting your search or filter criteria</p>
            </div>
        `;
    }
    
    setupProductEventListeners();
}

function setupProductEventListeners() {
    // Quantity buttons
    const quantityBtns = document.querySelectorAll('.quantity-btn');
    quantityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = btn.getAttribute('data-product');
            const isPlus = btn.classList.contains('plus');
            updateQuantity(productId, isPlus);
        });
    });
    
    // Add to cart buttons
    const addToCartBtns = document.querySelectorAll('.add-to-cart');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = btn.getAttribute('data-product');
            addToCart(productId);
        });
    });
}

// CART FUNCTIONS
function updateQuantity(productId, isPlus) {
    const quantityInput = document.querySelector(`.quantity-input[data-product="${productId}"]`);
    let quantity = parseInt(quantityInput.value);
    
    if (isPlus) {
        quantity++;
    } else if (quantity > 0) {
        quantity--;
    }
    
    quantityInput.value = quantity;
}

function addToCart(productId) {
    const quantityInput = document.querySelector(`.quantity-input[data-product="${productId}"]`);
    const quantity = parseInt(quantityInput.value);
    
    if (quantity <= 0) {
        showNotification('Please select a quantity greater than 0.', true);
        return;
    }
    
    const product = products[productId];
    const totalPrice = product.price * quantity;
    
    if (cart[productId]) {
        cart[productId].quantity += quantity;
        cart[productId].total += totalPrice;
    } else {
        cart[productId] = {
            name: product.name,
            nameTamil: product.nameTamil,
            price: product.price,
            quantity: quantity,
            total: totalPrice,
            productId: productId
        };
    }
    
    updateCart();
    showNotification(`${quantity} × 50g of ${product.name} added to cart!`);
    
    quantityInput.value = 0;
}

function updateCart() {
    cartItems.innerHTML = '';
    
    if (Object.keys(cart).length === 0) {
        emptyCartMessage.style.display = 'block';
        cartItems.appendChild(emptyCartMessage);
    } else {
        emptyCartMessage.style.display = 'none';
        
        for (const productId in cart) {
            const item = cart[productId];
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item cart-item-add';
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    ${item.nameTamil ? `<p class="product-name-tamil">${item.nameTamil}</p>` : ''}
                    <p>₹${item.price} per 50g</p>
                </div>
                <div class="cart-item-controls">
                    <div class="cart-quantity">
                        <button class="cart-quantity-btn minus" data-product="${productId}">-</button>
                        <span class="cart-quantity-value">${item.quantity} × 50g</span>
                        <button class="cart-quantity-btn plus" data-product="${productId}">+</button>
                    </div>
                    <div class="cart-item-total">₹${item.total.toFixed(2)}</div>
                    <button class="remove-item" data-product="${productId}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            cartItems.appendChild(cartItem);
        }
        
        const cartQuantityBtns = document.querySelectorAll('.cart-quantity-btn');
        cartQuantityBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = btn.getAttribute('data-product');
                const isPlus = btn.classList.contains('plus');
                updateCartQuantity(productId, isPlus);
            });
        });
        
        const removeBtns = document.querySelectorAll('.remove-item');
        removeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = btn.getAttribute('data-product');
                removeFromCart(productId);
            });
        });
    }
    
    updateCartTotal();
    updateCartCount();
}

function updateCartQuantity(productId, isPlus) {
    if (isPlus) {
        cart[productId].quantity += 1;
        cart[productId].total += cart[productId].price;
    } else if (cart[productId].quantity > 1) {
        cart[productId].quantity -= 1;
        cart[productId].total -= cart[productId].price;
    } else {
        removeFromCart(productId);
        return;
    }
    
    updateCart();
}

function removeFromCart(productId) {
    delete cart[productId];
    updateCart();
    showNotification('Item removed from cart.', true);
}

function updateCartTotal() {
    let subtotal = 0;
    
    for (const productId in cart) {
        subtotal += cart[productId].total;
    }
    
    const shipping = 50;
    const total = subtotal + shipping;
    
    subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    totalElement.textContent = `₹${total.toFixed(2)}`;
}

function updateCartCount() {
    let totalItems = 0;
    
    for (const productId in cart) {
        totalItems += cart[productId].quantity;
    }
    
    cartCount.textContent = totalItems;
}

// ORDER POPUP FUNCTIONS
function placeOrder() {
    if (Object.keys(cart).length === 0) {
        showNotification('Your cart is empty. Add some premium Panruti products first!', true);
        return;
    }
    
    // Update popup order summary
    updatePopupOrderSummary();
    
    // Show the popup
    orderPopup.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function updatePopupOrderSummary() {
    popupOrderItems.innerHTML = '';
    let total = 0;
    
    for (const productId in cart) {
        const item = cart[productId];
        const orderItem = document.createElement('div');
        orderItem.className = 'popup-order-item';
        orderItem.innerHTML = `
            <span>${item.name} (${item.quantity} × 50g)</span>
            <span>₹${item.total.toFixed(2)}</span>
        `;
        popupOrderItems.appendChild(orderItem);
        total += item.total;
    }
    
    // Add shipping cost
    const shipping = 50;
    total += shipping;
    
    const shippingItem = document.createElement('div');
    shippingItem.className = 'popup-order-item';
    shippingItem.innerHTML = `
        <span>Shipping</span>
        <span>₹${shipping.toFixed(2)}</span>
    `;
    popupOrderItems.appendChild(shippingItem);
    
    popupTotal.textContent = total.toFixed(2);
}

async function confirmOrder(formData) {
    const orderData = {
        customerName: formData.get('customer-name'),
        customerPhone: formData.get('customer-phone'),
        customerAddress: formData.get('customer-address'),
        customerPincode: formData.get('customer-pincode'),
        customerPlace: formData.get('customer-place'),
        paymentMethod: formData.get('payment-method'),
        date: new Date().toISOString(),
        items: [],
        total: parseFloat(popupTotal.textContent),
        status: 'pending',
        source: 'SRS Cashews Website'
    };
    
    // Add cart items to order data
    for (const productId in cart) {
        const item = cart[productId];
        orderData.items.push({
            name: item.name,
            nameTamil: item.nameTamil,
            price: item.price,
            quantity: item.quantity,
            total: item.total,
            productId: productId
        });
    }
    
    try {
        await saveOrderToDB(orderData);
        
        // Clear cart
        cart = {};
        updateCart();
        
        // Show appropriate success message
        if (orderData.paymentMethod === 'cod') {
            showNotification(`Order placed successfully, ${orderData.customerName}! Your order will be delivered to ${orderData.customerPlace}. We will contact you on ${orderData.customerPhone}. Payment: Cash on Delivery`);
        } else {
            showNotification(`Order placed successfully, ${orderData.customerName}! Please complete the UPI payment and send screenshot to 9488588456. We will process your order once payment is confirmed.`);
        }
        
        // Close popup
        closeOrderPopup();
        
    } catch (error) {
        showNotification('Failed to place order. Please call us directly at +91 98765 43210', true);
    }
}

function closeOrderPopup() {
    orderPopup.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
    orderForm.reset();
    upiDetails.style.display = 'none';
}

function copyUPI() {
    const upiId = 'vdcjhsvdcd@upi';
    navigator.clipboard.writeText(upiId).then(() => {
        showNotification('UPI ID copied to clipboard!');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = upiId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('UPI ID copied to clipboard!');
    });
}

// PRINT FUNCTION
function printOrderSummary() {
    if (Object.keys(cart).length === 0) {
        showNotification('Your cart is empty. Add some premium Panruti products first!', true);
        return;
    }
    
    // Create print window
    const printWindow = window.open('', '_blank');
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>SRS Cashews - Order Bill</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    color: black;
                    background: white;
                    margin: 0;
                    padding: 20px;
                }
                .print-bill {
                    max-width: 400px;
                    margin: 0 auto;
                    padding: 20px;
                    border: 2px solid black;
                }
                .bill-header {
                    text-align: center;
                    margin-bottom: 20px;
                    border-bottom: 2px solid black;
                    padding-bottom: 15px;
                }
                .bill-header h2 {
                    margin: 0 0 5px 0;
                    color: black;
                    font-size: 24px;
                }
                .bill-header p {
                    margin: 5px 0;
                    color: black;
                }
                .bill-date {
                    color: #666;
                    font-size: 14px;
                }
                .bill-item {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    padding-bottom: 8px;
                    border-bottom: 1px dashed #ccc;
                    color: black;
                }
                .bill-item-name {
                    flex: 2;
                }
                .bill-item-quantity {
                    flex: 1;
                    text-align: center;
                }
                .bill-item-price {
                    flex: 1;
                    text-align: right;
                }
                .bill-divider {
                    height: 2px;
                    background: black;
                    margin: 15px 0;
                }
                .bill-total {
                    display: flex;
                    justify-content: space-between;
                    font-weight: bold;
                    font-size: 18px;
                    color: black;
                    margin-bottom: 20px;
                }
                .bill-footer {
                    text-align: center;
                    color: #666;
                    font-size: 14px;
                }
                .bill-footer p {
                    margin: 5px 0;
                }
                @media print {
                    body { margin: 0; }
                    .print-bill { border: none; box-shadow: none; }
                }
            </style>
        </head>
        <body>
            <div class="print-bill">
                <div class="bill-header">
                    <h2>SRS CASHEWS</h2>
                    <p>Premium Cashews from Panruti, Tamil Nadu</p>
                    <div class="bill-date">${new Date().toLocaleString()}</div>
                </div>
                
                <div class="bill-items">
                    ${generateBillItems()}
                </div>
                
                <div class="bill-divider"></div>
                
                <div class="bill-total">
                    <span>TOTAL:</span>
                    <span>₹${calculateTotal().toFixed(2)}</span>
                </div>
                
                <div class="bill-footer">
                    <p>Thank you for choosing SRS Cashews!</p>
                    <p>From Panruti with Love ❤️</p>
                </div>
            </div>
        </body>
        </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = function() {
        printWindow.print();
        printWindow.onafterprint = function() {
            printWindow.close();
        };
    };
}

function generateBillItems() {
    let itemsHtml = '';
    for (const productId in cart) {
        const item = cart[productId];
        itemsHtml += `
            <div class="bill-item">
                <div class="bill-item-name">${item.name}</div>
                <div class="bill-item-quantity">${item.quantity} × 50g</div>
                <div class="bill-item-price">₹${item.total.toFixed(2)}</div>
            </div>
        `;
    }
    
    // Add shipping
    const shipping = 50;
    itemsHtml += `
        <div class="bill-item">
            <div class="bill-item-name">Shipping</div>
            <div class="bill-item-quantity"></div>
            <div class="bill-item-price">₹${shipping.toFixed(2)}</div>
        </div>
    `;
    
    return itemsHtml;
}

function calculateTotal() {
    let total = 0;
    for (const productId in cart) {
        total += cart[productId].total;
    }
    return total + 50; // Add shipping
}

// NOTIFICATION FUNCTION
function showNotification(message, isError = false) {
    notification.textContent = message;
    notification.className = 'notification';
    
    if (isError) {
        notification.classList.add('error');
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// PAGE NAVIGATION
function showPage(pageId) {
    // Hide all pages
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const activePage = document.getElementById(pageId);
    activePage.classList.add('active');
    
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// EVENT LISTENERS SETUP
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
    
    // Contact button
    document.getElementById('contact-btn').addEventListener('click', (e) => {
        e.preventDefault();
        alert('SRS Cashews - Premium Cashews from Panruti\n\n📧 Email: srscashews@gmail.com\n📞 Phone: +91 98765 43210\n📍 Location: Panruti, Cuddalore District, Tamil Nadu - 607106\n\nWe deliver across India! 🚚');
    });
    
    // Category cards
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const filter = card.getAttribute('data-filter');
            showPage('products');
            
            // Set active filter
            setTimeout(() => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                document.querySelector(`.filter-btn[data-filter="${filter}"]`).classList.add('active');
                renderProducts(filter, productSearch.value);
            }, 100);
        });
    });
    
    // Carousel controls
    prevButton.addEventListener('click', prevSlide);
    nextButton.addEventListener('click', nextSlide);
    
    // Carousel indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            goToSlide(index);
        });
    });
    
    // Product search and filter
    productSearch.addEventListener('input', () => {
        const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
        renderProducts(activeFilter, productSearch.value);
    });
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filter = button.getAttribute('data-filter');
            renderProducts(filter, productSearch.value);
        });
    });
    
    // Cart actions
    continueShoppingBtn.addEventListener('click', () => {
        showPage('products');
    });
    
    placeOrderBtn.addEventListener('click', placeOrder);
    printSummaryBtn.addEventListener('click', printOrderSummary);
    
    // Order popup events
    closePopup.addEventListener('click', closeOrderPopup);
    cancelOrder.addEventListener('click', closeOrderPopup);
    
    // Close popup when clicking outside
    orderPopup.addEventListener('click', (e) => {
        if (e.target === orderPopup) {
            closeOrderPopup();
        }
    });
    
    // Payment method change
    paymentMethods.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'online') {
                upiDetails.style.display = 'block';
            } else {
                upiDetails.style.display = 'none';
            }
        });
    });
    
    // Order form submission
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(orderForm);
        confirmOrder(formData);
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // ESC key to close notification and popup
        if (e.key === 'Escape') {
            notification.classList.remove('show');
            if (orderPopup.classList.contains('active')) {
                closeOrderPopup();
            }
        }
        
        // Ctrl+P for print summary
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            printOrderSummary();
        }
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize the website when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Export functions for global access
window.updateImagePreview = function(productId) {
    const imageUrl = document.getElementById(`${productId}-image`).value;
    const preview = document.getElementById(`${productId}-preview`);
    
    if (imageUrl) {
        preview.innerHTML = `<img src="${imageUrl}" alt="Preview" onerror="this.parentElement.innerHTML='<span>Invalid image URL</span>'">`;
        preview.classList.add('has-image');
    } else {
        preview.innerHTML = '<span>Image preview will appear here</span>';
        preview.classList.remove('has-image');
    }
};

window.updateNewProductPreview = function() {
    const imageUrl = document.getElementById('new-product-image').value;
    const preview = document.getElementById('new-product-preview');
    
    if (imageUrl) {
        preview.innerHTML = `<img src="${imageUrl}" alt="Preview" onerror="this.parentElement.innerHTML='<span>Invalid image URL</span>'">`;
        preview.classList.add('has-image');
    } else {
        preview.innerHTML = '<span>Image preview will appear here</span>';
        preview.classList.remove('has-image');
    }
};

window.copyUPI = copyUPI;
