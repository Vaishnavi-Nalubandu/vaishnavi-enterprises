// Base API URL
const API_BASE = "";

// Wait until page loads
document.addEventListener("DOMContentLoaded", () => {

  // ===== AUTH CHECK =====
  const username = localStorage.getItem("username");

  if (!username) {
    // User is not signed in — show alert and redirect to home
    alert("Please sign in first to place an order. If you don't have an account, please sign up.");
    window.location.href = "index.html";
    return;
  }

  // Pre-fill customer name from logged-in user
  const nameField = document.getElementById("name");
  if (nameField && username) {
    nameField.value = username;
  }

  // Pre-select product from URL parameter (e.g. ?product=2)
  const urlParams = new URLSearchParams(window.location.search);
  const productParam = urlParams.get("product");
  if (productParam) {
    const productSelect = document.getElementById("product_id");
    if (productSelect) {
      productSelect.value = productParam;
    }
  }

  // ===== ORDER FORM SUBMISSION =====
  const form = document.getElementById("orderForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const product_id = document.getElementById("product_id").value;
    const quantity = document.getElementById("quantity").value;
    const customer_name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;

    if (!product_id || !quantity || !customer_name || !phone) {
      alert("Please fill all required fields");
      return;
    }

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Placing Order...";

    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          product_id: parseInt(product_id),
          quantity: parseInt(quantity),
          customer_name,
          phone
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Hide form, show success message
        form.style.display = "none";
        document.getElementById("order-success").style.display = "block";
      } else {
        alert(data.message || "Failed to place order");
        submitBtn.disabled = false;
        submitBtn.textContent = "Place Order";
      }

    } catch (error) {
      console.error("Order error:", error);
      alert("Something went wrong. Please try again.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Place Order";
    }
  });

});
