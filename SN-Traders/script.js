
// SN Traders - Product Catalog

const API_URL = "https://fakestoreapi.com/products";

const productContainer = document.getElementById("product-container");
const loadingMessage = document.getElementById("loading-message");
const errorMessage = document.getElementById("error-message");
const searchInput = document.getElementById("search-input");
const categoryButtons = document.getElementById("category-buttons");

let products = [];
let selectedCategory = "all";
// Shopping cart - restore saved items
let cart = JSON.parse(localStorage.getItem("snTradersCart")) || [];

// Cart elements
const cartButton = document.getElementById("cart-btn");
const cartDrawer = document.getElementById("cart-drawer");
const cartOverlay = document.getElementById("cart-overlay");
const closeCartButton = document.getElementById("close-cart");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
// Convert USD prices to Indian Rupees
const USD_TO_INR = 93.77;

function formatINR(usdPrice) {
    const rupees = usdPrice * USD_TO_INR;

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(rupees);
}
// Fetch products from FakeStoreAPI
async function fetchProducts() {
    try {
        loadingMessage.textContent = "Loading products...";
        errorMessage.textContent = "";

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to load products.");
        }

        products = await response.json();

        loadingMessage.textContent = "";

        displayCategories();
        displayProducts(products);

    } catch (error) {
        loadingMessage.textContent = "";
        errorMessage.textContent =
            "Something went wrong. Please try again.";
        console.error(error);
    }
}

// Display category filter buttons
function displayCategories() {
    const categories = [
        ...new Set(products.map(product => product.category))
    ];

    categoryButtons.innerHTML = `
        <button class="active" data-category="all">All</button>
        ${categories.map(category => `
            <button data-category="${category}">
                ${category}
            </button>
        `).join("")}
    `;

    categoryButtons.querySelectorAll("button").forEach(button => {
        button.addEventListener("click", () => {
            selectedCategory = button.dataset.category;

            categoryButtons.querySelectorAll("button")
                .forEach(btn => btn.classList.remove("active"));

            button.classList.add("active");
            filterProducts();
        });
    });
}

// Display product cards
function displayProducts(productList) {
    if (productList.length === 0) {
        productContainer.innerHTML =
            "<p>No products found.</p>";
        return;
    }

    productContainer.innerHTML = productList.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.title}">

            <h3>${product.title}</h3>

            <p class="price">
    ${formatINR(product.price)}
</p>

            <p>⭐ ${product.rating.rate} (${product.rating.count} reviews)</p>

            <button class="add-cart-btn" data-id="${product.id}">
                Add to Cart
            </button>
        </div>
    `).join("");
}

// Save cart to browser storage
function saveCart() {
    localStorage.setItem("snTradersCart", JSON.stringify(cart));
}

// Add product to cart
function addToCart(productId) {
    const product = products.find(item => item.id === productId);

    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCart();
    updateCart();
}

// Remove product from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);

    saveCart();
    updateCart();
}

// Change product quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }

    saveCart();
    updateCart();
}

// Calculate cart total in INR
function calculateTotal() {
    return cart.reduce((total, item) => {
        return total + (item.price * USD_TO_INR * item.quantity);
    }, 0);
}

// Update cart display
function updateCart() {
    const totalItems = cart.reduce(
        (total, item) => total + item.quantity, 0
    );

    cartCount.textContent = totalItems;

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty.</p>";
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.title}">

                <div>
                    <h4>${item.title}</h4>
                    <p>${formatINR(item.price)}</p>

                    <button onclick="updateQuantity(${item.id}, -1)">−</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1)">+</button>

                    <button onclick="removeFromCart(${item.id})">
                        Remove
                    </button>
                </div>
            </div>
        `).join("");
    }

    cartTotal.textContent = calculateTotal().toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Open shopping cart
cartButton.addEventListener("click", () => {
    cartDrawer.classList.add("open");
    cartOverlay.classList.add("show");
});

// Close shopping cart
function closeCart() {
    cartDrawer.classList.remove("open");
    cartOverlay.classList.remove("show");
}

closeCartButton.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

// Handle Add to Cart buttons
productContainer.addEventListener("click", event => {
    const button = event.target.closest(".add-cart-btn");

    if (!button) return;

    addToCart(Number(button.dataset.id));
});

// Restore cart when page loads
updateCart();

// Search and category filtering
function filterProducts() {
    const searchText = searchInput.value.toLowerCase();

    const filteredProducts = products.filter(product => {
        const matchesSearch =
            product.title.toLowerCase().includes(searchText);

        const matchesCategory =
            selectedCategory === "all" ||
            product.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    displayProducts(filteredProducts);
}

// Search while typing
searchInput.addEventListener("input", filterProducts);

// Checkout elements
const checkoutButton = document.getElementById("checkout-btn");
const checkoutModal = document.getElementById("checkout-modal");
const closeModalButton = document.getElementById("close-modal");
const confirmOrderButton = document.getElementById("confirm-order");

// Open checkout modal
checkoutButton.addEventListener("click", () => {
    if (cart.length === 0) {
        alert("Your shopping cart is empty!");
        return;
    }

    checkoutModal.classList.add("show");
});

// Close checkout modal
closeModalButton.addEventListener("click", () => {
    checkoutModal.classList.remove("show");
});

// Confirm order
confirmOrderButton.addEventListener("click", () => {
    if (cart.length === 0) return;

    const orderTotal = calculateTotal();

    alert(
        "🎉 Order placed successfully!\n\n" +
        "Thank you for shopping with SN Traders!\n" +
        "Order Total: " + formatINR(orderTotal / USD_TO_INR)
    );

    // Clear shopping cart
    cart = [];

    saveCart();
    updateCart();

    // Close checkout and cart
    checkoutModal.classList.remove("show");
    closeCart();
});

// Start the application
fetchProducts();
