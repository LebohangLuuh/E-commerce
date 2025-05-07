
import {
  addItem,
  removeItem,
  updateQuantity,
  calculateTotal,
  toggleItem,
  fetchProducts,
  findProduct,
  clearCart,
  filterProduct
} from "./ecommerce.js";

// Application State
let currentProducts = [];
let cart = [];
let wishlist = [];

const closeProductDialog = document.querySelector("dialog button");
const form = document.getElementById("registerForm");
const users = JSON.parse(localStorage.getItem("users")) || [];

// DOM Elements
const domElements = {
  productsContainer: document.getElementById("products-container"),
  filterSelect: document.querySelector("#filter"),

  viewBtn: document.getElementById("viewBtn"),

  cartIcon: document.getElementById("cart-icon"),
  wishlistIcon: document.getElementById("wishList-icon"),

  modals: {
    product: document.getElementById("product-modal"),
    cart: document.getElementById("cart-modal"),
    wishlist: document.getElementById("wishlist-modal"),
    login: document.getElementById("login-modal"),
    register: document.getElementById("register-modal"),
  },
};


const updateCartCount = () => {
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const countSpan = document.querySelector(".cartCount span");
  if (countSpan) {
    countSpan.textContent = cartCount;
  }
};

// Cart Management
const updateCartUI = () => {
  // Update cart count
  updateCartCount();

  // Update cart modal
  if (!domElements.modals.cart) return;
  
  const cartContent = domElements.modals.cart.querySelector(".modal-content");
  if (!cartContent) return;
  
  cartContent.innerHTML = cart.length ? cart.map((item) => 
    `<div class="cart-item flex" data-id="${item.id}"><div>
            <img class="cart-item-image " src="${item.thumbnail}" alt="${item.title}">
            </div>
            <div class="cart-item-info m-10 w-full">
                <h4 class="cart-item-title text-2xl text-gray-400 font-bold">${item.title}</h4>
                <p class="cart-item-desc text-emerald-900 font-thin text-lg">${item.category}</p>
                <h1 class="cart-item-price text-amber-400 text-3xl font-thin">R${item.price.toFixed(2)} </h1>
                <br> 
                <div class="flex gap-2">
                    <button class="quantity-btn" data-action="decrease"><i class="bi text-4xl text-amber-400 bi-dash-circle-fill"></i></button>
                     <p class="cart-item-quantity text-2xl">Quantity: ${item.quantity}</p>
                    <button class="quantity-btn" data-action="increase"><i class="bi text-4xl text-emerald-900 bi-plus-circle-fill"></i></button>
                </div>
                    <p class="bold mt-5">Subtotal: R${(item.price * item.quantity).toFixed(2)}</p>
                <button class="remove-btn mt-5 rounded-full w-full h-[3rem] bg-red-500 text-white ">Remove</button>
            </div>
        </div>` ).join("") : "<p>Your cart is empty</p>";

  // Update cart summary
  const cartSummary = domElements.modals.cart.querySelector(".cart-summary");
  if (cartSummary) {
    const total = calculateTotal(cart);
    cartSummary.innerHTML = 
    `<div class="cart-summary text-end flex flex-col left-9 position-relative">
    <h3 class="font-bold text-3xl">Cart Summary</h3>
    <h3 class="text-amber-400 text-3xl font-thin ">Total: R${total.toFixed(2)}</h3>
     <button class="btnCheckout rounded-full bg-emerald-900 h-12 m-10 transform hover:scale-105 hover:bg-emerald-900 hover:text-amber-400 text-white w-full">Checkout</button>
     <button class="clear-btn bg-red-500 text-white h-3xl ml-6 p-5">Clear Cart</button>
     </div>`;
    
    const clearBtn = cartSummary.querySelector(".clear-btn");
    if (clearBtn) {
      const newClearBtn = clearBtn.cloneNode(true);
      clearBtn.parentNode.replaceChild(newClearBtn, clearBtn);
      
      newClearBtn.addEventListener("click", () => {
        cart = clearCart();
        updateCartUI();
        alert("Cart has been cleared!");
      });
    }
    
    const checkoutBtn = cartSummary.querySelector(".checkout-btn");
    if (checkoutBtn) {
      const newCheckoutBtn = checkoutBtn.cloneNode(true);
      checkoutBtn.parentNode.replaceChild(newCheckoutBtn, checkoutBtn);
      
      newCheckoutBtn.addEventListener("click", () => {
        if (cart.length > 0) {
          alert("Proceeding to checkout...");
          // checkout logic
        } else {
          alert("Your cart is empty!");
        }
      });
    }
  }
};

// Wishlist Management
const updateWishlistUI = () => {
  if (!domElements.modals.wishlist) return;
  
  const wishlistContent = domElements.modals.wishlist.querySelector(".modal-content");
  if (!wishlistContent) return;
  
  wishlistContent.innerHTML = wishlist.length
    ? wishlist.map((item) => `
        <div class="wishlist-item flex m-10" data-id="${item.id}">
            <div>
                <img src="${item.thumbnail}" class="wishlist-item-image w-[10rem]">
            </div>
            <div class="wishlist-item-info m-10 w-full">
                <h4 class="text-2xl text-gray-400 font-bold">${item.title}</h4>
                <p class="text-emerald-900 font-thin text-lg">${item.category}</p>
                <h1 class="text-amber-400 text-3xl font-thin">R${item.price.toFixed(2)}</h1>
                <button class="remove-btn mt-5 rounded-full w-full h-[3rem] bg-red-500 text-white">Remove</button>
            </div>
        </div> `).join(""): "<p>Your wishlist is empty</p>";
};

// show wishlist modal
function showWishlistModal() {
  updateWishlistUI();
  if (domElements.modals.wishlist) {
    if (typeof domElements.modals.wishlist.showModal === "function") {
      domElements.modals.wishlist.showModal();
    } else {
      domElements.modals.wishlist.style.display = "block";
    }
  }
}


function showProductModal(product) {
  const modal = domElements.modals.product;
  if (!modal) {
    console.error("Product modal not found in the DOM");
    return;
  }

  // Main image
  const mainImg = modal.querySelector(".detailsModal > img");
  if (mainImg) {
    mainImg.src = product.thumbnail;
    mainImg.alt = product.title;
  }

  // alternative images container
  const altImagesContainer = modal.querySelector(".altImagesContainer");
  if (altImagesContainer) {
    // alternative image elements
    const altImages = altImagesContainer.querySelectorAll(".altImages");
    altImagesContainer.className = "altImagesContainer flex flex-row flex-1 w-[30%]"
    
    // clear images 
    altImages.forEach(imgElement => {
      imgElement.src = "";
      imgElement.alt = "";
    });
    
    // alternative images
    if (product.images && product.images.length > 0) {
      altImages.forEach((imgElement, index) => {
        if (index < product.images.length) {
          imgElement.src = product.images[index];
          imgElement.alt = product.title;
        }
      });
    }
  }

  // Brand
  const brand = modal.querySelector(".brand");
  if (brand) brand.textContent = `Brand: ${product.brand}`;

  // Rating
  const rating = modal.querySelector(".rating");
  if (rating) {
    // round rating to the nearest integer
    const roundedRating = Math.round(product.rating);
    
    //  stars rating
    let starsHTML = '';
    for (let i = 0; i < roundedRating; i++) {
      starsHTML += '<i class="bi gap-1  text-amber-400 bi-star-fill"></i> ';
    }
    
    rating.innerHTML = `Rating : ${starsHTML}`;
  }

  // Discount
  const discount = modal.querySelector(".discount");
  if (discount) discount.textContent = `${product.discountPercentage}%`;

  // Title
  const title = modal.querySelector(".title");
  if (title) title.textContent = product.title;

  // Category
  const category = modal.querySelector(".category");
  if (category) category.textContent = `Category: ${product.category}`;

  // Description
  const description = modal.querySelector(".description");
  if (description) description.textContent = product.description;

  // Stock
  const stock = modal.querySelector(".stock");
  if (stock) stock.textContent = `Stock: ${product.stock}`;

  // Quantity
  const quantity = modal.querySelector(".quantity");
  if (quantity) quantity.textContent = `Minimum order Quantity: ${product.minimumOrderQuantity}`;

  // return policy
  const returnPolicy = modal.querySelector(".returnPolicy");
  if (returnPolicy) returnPolicy.textContent = `Return Policy: ${product.returnPolicy}`
    
  // warranty info
  const warranty = modal.querySelector(".warrantyInfo");
  if (warranty) warranty.textContent = `Warranty Info : ${product.warrantyInformation}`

  // Price
  const price = modal.querySelector(".price");
  if (price) price.textContent = `R${product.price.toFixed(2)}`;

  // Show the modal
  if (typeof modal.showModal === "function") {
    modal.showModal();
  } else {
    modal.style.display = "block";
  }
}


// Event Handlers
const setupEventListeners = () => {
  // Product interactions
  if (!domElements.productsContainer) return;
  
  domElements.productsContainer.addEventListener("click", async (e) => {
    const productElement = e.target.closest(".product");
    if (!productElement) return;

    const productId = productElement.dataset.id;
    const product = findProduct(currentProducts, productId);

    if (e.target.closest(".viewBtn")) {
      showProductModal(product);
    }

    if (e.target.closest(".cartBtn")) {
      cart = addItem(cart, product);
      updateCartUI();
      showNotification("✅ Added to cart ");
    }

    if (e.target.closest(".wishListBtn")) {
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
  if (domElements.modals.cart) {
    domElements.modals.cart.addEventListener("click", (e) => {
      const itemElement = e.target.closest(".cart-item");
      if (!itemElement) return;

      const productId = itemElement.dataset.id;

      if (e.target.closest(".quantity-btn")) {
        const action = e.target.closest(".quantity-btn").dataset.action;
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
  }

  if (domElements.wishlistIcon) {
    domElements.wishlistIcon.addEventListener("click", showWishlistModal);
  }

  // Wishlist interactions
  if (domElements.modals.wishlist) {
    domElements.modals.wishlist.addEventListener("click", (e) => {
      if (e.target.closest(".remove-btn")) {
        const itemElement = e.target.closest(".wishlist-item");
        if (!itemElement) return;
        
        const productId = itemElement.dataset.id;
        const product = findProduct(currentProducts, productId);
        
        if (product) {
          const result = toggleItem(wishlist, product);
          wishlist = result.updatedList;
          updateWishlistUI();
          showNotification("❌ Removed from wishlist");
        }
      }
    });
  }

  // Modal close buttons
  document.querySelectorAll(".modal-close").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest("dialog").close();
    });
  });

// products
function renderProductList(products) {
  if (!domElements.productsContainer) return;
  
  domElements.productsContainer.innerHTML = products
    .map((product) => 
        `<div class="product transition-all duration-300 hover:shadow-lg hover:shadow-emerald-900 hover:scale-105 h-[35rem] rounded-[.5rem] position-relative overflow-hidden bg-white" data-id="${product.id
        }">${product.discountPercentage
          ? `<div class="discount position-absolute top-[1rem] left-[1rem] w-[4rem] bg-emerald-500 text-white p-[0.5rem]">${product.discountPercentage}%</div>`
          : ""
        }
        <img src="${product.thumbnail}" alt="${product.title}">
        <div class="details text-center relative p-[2rem]">
          <div class="reviews text-emerald-900 absolute right-5"><i class="bi text-amber-400 bi-star-fill"></i> ${product.rating}</div>
          <div class="title font-bold text-gray-500">${product.title}</div>
          <div class="price text-emerald-900 font-bold text-3xl">R${product.price.toFixed(2)}</div>
          <div class="title font-thin text-gray-500">${product.category}</div>

           <div class="btn-group h-10 flex gap-2 mt-5">
          <button id="viewBtn"
            class="viewBtn flex-1 bg-emerald-900 rounded-full text-white transform hover:scale-105 hover:bg-emerald-900 hover:text-amber-400">View</button>
          <button id="cartBtn"
            class="cartBtn flex-1 border border-emerald-900 rounded-full transform hover:scale-105 text-emerald-900 text-sm"><i
              class="bi text-emerald-900 text-xl bi-cart-check-fill"></i> Buy</button>
          <button id="wishListBtn"
            class="wishListBtn flex-1 border border-amber-400 rounded-full transform hover:scale-105 text-amber-400 text-sm "><i
              class="bi text-amber-400 text-xl bi-heart-fill"></i> Favourite</button>
          </div>
        </div>
      </div>`).join("");
}

//filter products
if (domElements.filterSelect) {
  domElements.filterSelect.addEventListener("change", () => {
    const category = domElements.filterSelect.value;
    const filtered =
      !category || category === "All Categories"
        ? currentProducts
        : currentProducts.filter((p) => p.category === category);
    renderProductList(filtered);
  });
}

// Function to show notification
function showNotification(message) {
  // Check if notification element exists, create if not
  let notification = document.getElementById('notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    notification.style.position = 'fixed';
    notification.style.bottom = '25rem';
    notification.style.right = '45rem';
    notification.style.backgroundColor = '#058743';
    notification.style.color = 'yellow';
    notification.style.padding = '6rem';
    notification.style.borderRadius = '15px';
    notification.style.zIndex = '1000';
    notification.style.transition = 'opacity 0.5s';
    document.body.appendChild(notification);
  }
  
  notification.textContent = message;
  notification.style.opacity = '1';
  
  setTimeout(() => {
    notification.style.opacity = '0';
  }, 3000);
}

// Product Rendering
const renderProducts = async () => {
  try {
    currentProducts = await fetchProducts();
    renderProductList(currentProducts);
  } catch (error) {
    if (domElements.productsContainer) {
      domElements.productsContainer.innerHTML = ` <div class="error h-[10rem] bg-red-500 flex justify-content-center p-10 content-center items-center text-center ">⚠️ ${error.message}</div> `;
    }
  }
};


// register
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  if (!form) return;
  
  const users = JSON.parse(localStorage.getItem('users') || '[]');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim().toLowerCase();
    const password = form.registerPassword.value;
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
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;
  
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  if (!emailInput || !passwordInput) return;

  // all registered users from localStorage  
  const users = JSON.parse(localStorage.getItem('users') || '[]'); 

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim().toLowerCase();
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
    loginForm.reset();
  });
});


// Function to show cart contents in a dialog
function showCart() {
  const cartDialog = document.querySelector("#cart-modal");
  if (cartDialog) cartDialog.showModal();
}

function wishList() {
  const wishList = document.querySelector("#wishlist-modal");
  if (wishList) wishList.showModal();
}



// Initialize event listeners
document.addEventListener("DOMContentLoaded", () => {
  const viewBtns = domElements.productsContainer.querySelectorAll('.viewBtn');
  viewBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const productId = this.getAttribute('data-id');
      const product = currentProducts.find(p => String(p.id) === String(productId));
      if (product) {
        showProductModal(product);
      }
    });
  });

  // Add event listener to cart icon
  const cartIcon = document.querySelector(".cartCount");
  if (cartIcon) {
    cartIcon.addEventListener("click", () => {
      showCart();
    });
  }

  const wishlistIcon = document.querySelector(".wishlist")
  if (wishlistIcon) {
    wishlistIcon.addEventListener("click", () => {
      wishList();
    });
  }

  // Close cart dialog
  const closeCartDialog = document.querySelector("#cart-modal .modal-close");
  if (closeCartDialog) {
    closeCartDialog.addEventListener("click", () => {
      const cartModal = document.querySelector("#cart-modal");
      if (cartModal) cartModal.close();
    });
  }
});

// Get the modal
let modalLogin = document.getElementById("id02");


// register
let modalReg = document.getElementById("id03");

let productItem = document.getElementById("product-modal");

// Initialize App
document.addEventListener("DOMContentLoaded", async () => {
  await renderProducts();
  setupEventListeners();
  
  // Initialize cart count
  updateCartCount();
  
  // Add event listener to wishlist icon
  if (domElements.wishlistIcon) {
    domElements.wishlistIcon.addEventListener("click", showWishlistModal);
  }
});


