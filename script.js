const viewProductModalBtn = document.querySelectorAll(".viewBtn");
const viewProductDialog = document.querySelector("dialog");
const closeProductDialog = document.querySelector("dialog button");



// Function to show product details in a dialog
  // Grab references
  const viewProduct   = document.querySelectorAll(".viewBtn");
  const closeBtn  = document.getElementById('modal-close');
  const productModal = document.getElementById('product-modal');

  // Open as a modal dialog (blocks interaction with the rest of the page)
  openBtn.addEventListener('click', () => {
    productModal.showModal();  // uses HTMLDialogElement.showModal() :contentReference[oaicite:0]{index=0}
  });

  // Close via the dialog’s .close() method
  closeBtn.addEventListener('click', () => {
    productModal.close();      // HTMLDialogElement.close() :contentReference[oaicite:1]{index=1}
  });

  // (Optional) Close when the user clicks outside the dialog’s content
  productModal.addEventListener('click', (e) => {
    if (e.target === productModal) {
      productModal.close();
    }
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


