import {
  addItem,
  removeItem,
  updateQuantity,
  calculateTotal,
  toggleItem,
  validateProducts,
  fetchProducts,
  findProduct,
  clearCart,
  filterProduct
} from "./ecommerce.js";

// Application State
let currentProducts = [];
let cart = [];
let wishlist = [];

const viewProductDialog = document.querySelector("dialog");
const closeProductDialog = document.querySelector("dialog button");

const form = document.getElementById("registerForm");
const users = JSON.parse(localStorage.getItem("users")) || [];

// DOM Elements
const domElements = {
  productsContainer: document.getElementById("products-container"),
  filterSelect: document.querySelector("#filter"),

  cartIcon: document.getElementById("cart-icon"),
  wishlistIcon: document.getElementById("wishlist-icon"),

  modals: {
    product: document.getElementById("product-modal"),
    cart: document.getElementById("cart-modal"),
    wishlist: document.getElementById("wishlist-modal"),
    login: document.getElementById("login-modal"),
    register: document.getElementById("register-modal"),
  },
};

// Initialize App
document.addEventListener("DOMContentLoaded", async () => {
  await renderProducts();
  setupEventListeners();
});

// Cart Management
const updateCartUI = () => {
  // Update cart count
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  domElements.cartIcon.querySelector("span").textContent = cartCount;

  // Update cart modal
  const cartContent = domElements.modals.cart.querySelector(".modal-content");
  cartContent.innerHTML = cart.length
    ? cart
        .map(
          (item) => `
        <div class="cart-item flex items-center gap-4 mb-4" data-id="${
          item.id
        }">
            <img class="cart-item-image w-[100%] h-[100%] object-cover" src="${
              item.thumbnail
            }" class="cart-item-image">
            <div class="cart-item-info mr-4 flex flex-col">
                <h4>${item.title}</h4>
                <h1>R${item.price.toFixed(2)} 
                <br> 
                    <button class="quantity-btn" data-action="decrease"><i class="bi bi-dash-circle-fill"></i></button>
                    ${item.quantity}
                    <button class="quantity-btn" data-action="increase"><i class="bi bi-plus-circle-fill"></i></button>
                </h1>
                <p class="bold">Subtotal: R${(
                  item.price * item.quantity
                ).toFixed(2)}</p>
                <button class="remove-btn bg-red-500 text-white ">Remove</button>
            </div>
        </div>
    `
        )
        .join("")
    : "<p>Your cart is empty</p>";

  // Update cart summary
  const total = calculateTotal(cart);
  domElements.modals.cart.querySelector(".cart-summary").innerHTML = `
        <h3 class"text-emerald-500">Total: R${total.toFixed(2)}</h3>
        <button class="btn-primary checkout-btn">Checkout</button>
        <button class="clear-btn bg-red-500 text-white h-3xl ml-6 p-5" onclick="clearCart()">Clear Cart</button>
    `;
};

// Wishlist Management
const updateWishlistUI = () => {
  const wishlistContent =
    domElements.modals.wishlist.querySelector(".modal-content");
  wishlistContent.innerHTML = wishlist.length
    ? wishlist
        .map(
          (item) => `
        <div class="wishlist-item" data-id="${item.id}">
            <img src="${item.thumbnail}" class="wishlist-item-image">
            <div class="wishlist-item-info">
                <h4>${item.title}</h4>
                <p>R${item.price.toFixed(2)}</p>
                <button class="remove-btn bg-reg-500">Remove</button>
            </div>
        </div>
    `
        )
        .join("")
    : "<p>Your wishlist is empty</p>";
};

// Event Handlers
const setupEventListeners = () => {
  // Product interactions
  domElements.productsContainer.addEventListener("click", async (e) => {
    const productElement = e.target.closest(".product");
    if (!productElement) return;

    const productId = productElement.dataset.id;
    const product = findProduct(currentProducts, productId);

    if (e.target.closest(".view-btn")) {
      const modal = domElements.modals.product;
      modal.querySelector(".product-image").src = product.thumbnail;
      modal.querySelector("h3").textContent = product.title;
      modal.querySelector(
        ".price-display"
      ).textContent = `R${product.price.toFixed(2)}`;
      modal.querySelector(".description").textContent = product.description;
      modal.querySelector(".category").textContent = product.category;
      modal.querySelector(".returnPolicy").textContent = product.returnPolicy;
      // modal.querySelector(".warrantyInformation").textContent =
        // product.warrantyInformation;
        // modal.querySelector(".returnPolicy").textContent = product.returnPolicy;  
      modal.showModal();
    }

    if (e.target.closest(".cart-btn")) {
      cart = addItem(cart, product);
      updateCartUI();
      showNotification("🛒 Added to cart ");
    }

    if (e.target.closest(".wishlist-btn")) {
      const result = toggleItem(wishlist, product);
      wishlist = result.updatedList;
      updateWishlistUI();
      showNotification(
        result.action === "added"
          ? "💖 Added to wishlist "
          : "❌ Removed from wishlist "
      );
    }
  });
}

  // Cart interactions
  domElements.modals.cart.addEventListener("click", (e) => {
    const itemElement = e.target.closest(".cart-item");
    if (!itemElement) return;

    const productId = itemElement.dataset.id;

    if (e.target.closest(".quantity-btn")) {
      const action = e.target.dataset.action;
      cart = updateQuantity(
        cart,
        parseInt(productId),
        action === "increase" ? 1 : -1
      );
      updateCartUI();
    }

    if (e.target.closest(".remove-btn")) {
      cart = removeItem(cart, parseInt(productId));
      updateCartUI();
      showNotification("Removed from cart 🗑️");
    }
  });

  // Wishlist interactions
  // domElements.modals.wishlist.addEventListener("click", (e) => {
  //   const itemElement = e.target.closest(".wishlist-item");
  //   if (!itemElement) return;

  //   const productId = parseInt(itemElement.dataset.id);
  //   const product = findProduct(currentProducts, productId);

  //   if (e.target.closest(".remove-btn")) {
  //     const result = toggleItem(wishlist, product);
  //     wishlist = result.updatedList;
  //     updateWishlistUI();
  //     showNotification("Removed from wishlist ❌");
  //   }
  // });

  // Modal close buttons
  document.querySelectorAll(".modal-close").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest("dialog").close();
    });
  });

  //clear all
  // document.querySelector(".clear-btn").addEventListener("click", () => {
  //   cart = clearCart(cart);
  //   updateCartUI();
  //   showNotification("Cart cleared!");
  // });

  // Navigation buttons
  // domElements.cartIcon.addEventListener("click", () => {
  //   updateCartUI();
  //   domElements.modals.cart.showModal();
  // });

  // domElements.wishlistIcon.addEventListener("click", () => {
  //   updateWishlistUI();
  //   domElements.modals.wishlist.showModal();
  // });

// products
function renderProductList(products) {
  domElements.productsContainer.innerHTML = products
    .map(
      (
        product
      ) => `<div class="product transition-all duration-300 hover:shadow-lg hover:shadow-green-400 hover:scale-105 h-[35rem] rounded-[.5rem] position-relative overflow-hidden bg-white" data-id="${product.id
        }">
        ${product.discountPercentage
          ? `<div class="discount position-absolute top-[1rem] left-[1rem] w-[4rem] bg-emerald-500 text-white p-[0.5rem]">${product.discountPercentage}%</div>`
          : ""
        }
        <img src="${product.thumbnail}" alt="${product.title}">
        <div class="details text-center p-[1rem] position-relative p-[2rem]">
          <div class="reviews flex"><i class="bi text-amber-400 bi-star-fill"></i> ${product.rating
        }</div>
          <div class="title font-bold text-gray-500">${product.title}</div>
          <div class="price font-bold text-2xl">R${product.price.toFixed(
          2
        )}</div>
          <div class="title font-bold text-gray-500">${product.category}</div>

          <div class="btn-group flex gap-4 m-4">
            <button class="btn-secondary  view-btn">View</button>
            <button class="btn-primary cart-btn"><i class="bi bi-cart-check"></i></button>
            <button class="btn-secondary wishlist-btn"><i class="bi bi-heart-fill"></i></button>
          </div>
        </div>
      </div>`
    )
    .join("");
}

//filter products
domElements.filterSelect.addEventListener("change", () => {
  const category = domElements.filterSelect.value;
  const filtered =
    !category || category === "All Categories"
      ? currentProducts
      : currentProducts.filter((p) => p.category === category);
  renderProductList(filtered);
});

// Product Rendering
const renderProducts = async () => {
  try {
    currentProducts = await fetchProducts();
    domElements.productsContainer.innerHTML = currentProducts
    .map(
      (
        product
      ) => `<div class="product transition-all duration-300 hover:shadow-lg hover:shadow-green-400 hover:scale-105 h-[35rem] rounded-[.5rem] position-relative overflow-hidden bg-white" data-id="${product.id
        }">
        ${product.discountPercentage
          ? `<div class="discount position-absolute top-[1rem] left-[1rem] w-[4rem] bg-emerald-500 text-white p-[0.5rem]">${product.discountPercentage}%</div>`
          : ""
        }
        <img src="${product.thumbnail}" alt="${product.title}">
        <div class="details text-center p-[1rem] position-relative p-[2rem]">
          <div class="reviews flex"><i class="bi text-amber-400 bi-star-fill"></i> ${product.rating
        }</div>
          <div class="title font-bold text-gray-500">${product.title}</div>
          <div class="price font-bold text-2xl">R${product.price.toFixed(
          2
        )}</div>
          <div class="title font-bold text-gray-500">${product.category}</div>

          <div class="btn-group flex gap-4 m-4">
            <button class="btn-secondary  view-btn">View</button>
            <button class="btn-primary cart-btn"><i class="bi bi-cart-check"></i></button>
            <button class="btn-secondary wishlist-btn"><i class="bi bi-heart-fill"></i></button>
          </div>
        </div>
      </div>`
    )
    .join("");
    renderProductList(currentProducts);
  } catch (error) {
    domElements.productsContainer.innerHTML = ` <div class="error">⚠️ ${error.message}</div> `;
  }
};

renderProducts();

// register

document.addEventListener('DOMContentLoaded', () => {
  const form       = document.getElementById('registerForm');
  const toggleModalBtn = document.getElementById('registerBtn');

  const users = JSON.parse(localStorage.getItem('users') || '[]');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name            = form.name.value.trim();
    const email           = form.email.value.trim().toLowerCase();
    const password        = form.registerPassword.value;
    const confirmPassword = form.confirmPassword.value;

    if (!name || !email || !password || !confirmPassword) {
      alert('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    const isDuplicate = users.some(u =>
      u.email === email
    );
    if (isDuplicate) {
      alert('A user with that name or email already exists.');
      return;
    }

    const newUser = {
      name,
      email,
      password,
      isLoggedIn: false,
      favorites: [],
    };

    users.push(newUser);
    try {
      localStorage.setItem('users', JSON.stringify(users));
      alert('Registration successful! Please log in.');
      form.reset();
    } catch (err) {
      console.error('Storage error:', err);
      alert('Sorry, registration failed. Please try again.');
      form.reset();
    }
  });
});

// login
document.addEventListener('DOMContentLoaded', () => {
  const loginForm     = document.getElementById('loginForm');
  const emailInput    = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');

  // 1) Load all registered users from localStorage  
  const users = JSON.parse(localStorage.getItem('users') || '[]'); 

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email    = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    const user = users.find(u => 
      u.email === email && u.password === password
    ); 

    if (!user) {
      alert('Please enter valid email and password.'); 
      return;
    }

    user.isLoggedIn = true;  
    localStorage.setItem('users', JSON.stringify(users)); 

    localStorage.setItem('currentUser', JSON.stringify(user)); 

    alert('Login successful!');  
  });
});



// Function to show cart contents in a dialog
function showCart() {
  const cartDialog = document.querySelector("#cart-modal");
  cartDialog.showModal();
}

// Initialize event listeners
document.addEventListener("DOMContentLoaded", () => {
  // Add event listeners to "View Details" buttons
  const viewProductButtons = document.querySelectorAll(".viewBtn");
  viewProductButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productCard = button.closest(".product-card");
      const productTitle =
        productCard.querySelector(".product-title").textContent;
      const productPrice = parseFloat(
        productCard.querySelector(".product-price").textContent.replace("R", "")
      );
      const productImage = productCard.querySelector("img").src;
      const productDescription =
        "This is a sample description for the product.";

      const product = {
        title: productTitle,
        price: productPrice,
        image: productImage,
        description: productDescription,
      };
      showProductDetails(product);
    });
  });

  // Add event listener to cart icon
  const cartIcon = document.querySelector(".cartCount");
  cartIcon.addEventListener("click", () => {
    showCart();
  });


  // Close cart dialog
  const closeCartDialog = document.querySelector("#cart-modal .modal-close");
  closeCartDialog.addEventListener("click", () => {
    document.querySelector("#cart-modal").close();
  });
});

//login
// onclick = "document.getElementById('id02').style.display='none'";

// Get the modal
let modalLogin = document.getElementById("id02");


// register
let modalReg = document.getElementById("id03");

let productItem = document.getElementById("product-modal");


