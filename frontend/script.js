// ===== CONFIG =====
const API_BASE = "";


// ===== LOAD PRODUCTS =====
window.addEventListener("DOMContentLoaded", function () {
    loadProducts();
    checkUser();
});


function loadProducts() {
    fetch(`${API_BASE}/products`)
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('product-list');

            const images = [
                "images/big plates.png",
                "images/small plates.png",
                "images/bowl leaf plates.png"
            ];

            data.forEach((product, index) => {
                const card = document.createElement('div');
                card.classList.add('box');
                card.innerHTML = `
                    <img src="${images[index % images.length]}" alt="${product.name}" loading="lazy" />
                    <h2>${product.name}</h2>
                    <h3>Rs. ${product.price}</h3>
                    <a href="#" class="btn" onclick="goToOrder(${product.id}); return false;">Buy Now</a>
                `;
                container.appendChild(card);
            });
        })
        .catch(err => {
            console.error("Failed to load products:", err);
            // Show fallback products if server is not running
            showFallbackProducts();
        });
}


function showFallbackProducts() {
    const container = document.getElementById('product-list');

    const fallback = [
        { name: "Big Round Leaf Plate", price: 150, unit: "per pack", img: "images/big plates.png" },
        { name: "Small Round Leaf Plate", price: 100, unit: "per pack", img: "images/small plates.png" },
        { name: "Bowl Leaf Plate", price: 80, unit: "per pack", img: "images/bowl leaf plates.png" }
    ];

    container.innerHTML = ""; // (prevents duplicates)

    fallback.forEach((product, index) => {
        const card = document.createElement('div');
        card.classList.add('box');

        card.innerHTML = `
            <img src="${product.img}" alt="${product.name}" loading="lazy" />
            <h2>${product.name}</h2>
            <h3>Rs. ${product.price} ${product.unit}</h3>
            <a href="#" class="btn" onclick="goToOrder(${index + 1}); return false;">Buy Now</a>
        `;

        container.appendChild(card);
    });
}


// ===== MOBILE MENU =====
function toggleMenu() {
    document.querySelector('nav').classList.toggle('active');
}

function closeMenu() {
    document.querySelector('nav').classList.remove('active');
}


// ===== POPUP =====
function showPopup(message, title) {
    const popup = document.getElementById("popup");
    const msgEl = document.getElementById("popup-message");
    const titleEl = document.getElementById("popup-title");

    if (titleEl) titleEl.innerText = title || "Success";
    if (msgEl) msgEl.innerText = message;
    popup.style.display = "flex";

    setTimeout(() => {
        popup.style.display = "none";
    }, 2500);
}


// ===== TOAST MESSAGE =====
function showMessage(message, type) {
    let msgBox = document.getElementById("message-box");

    if (!msgBox) {
        msgBox = document.createElement("div");
        msgBox.id = "message-box";
        document.body.appendChild(msgBox);
    }

    msgBox.innerText = message;
    msgBox.style.backgroundColor = type === "success" ? "#28a745" : "#dc3545";

    setTimeout(() => {
        msgBox.remove();
    }, 3000);
}


// ===== ENQUIRY =====
function sendEnquiry() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const btn = document.querySelector(".send-btn");

    if (!name || !email || !message) {
        showMessage("Please fill all fields!", "error");
        return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMessage("Please enter a valid email!", "error");
        return;
    }

    btn.innerText = "Sending...";
    btn.disabled = true;

    fetch(`${API_BASE}/enquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
    })
    .then(res => res.json())
    .then(data => {
        showPopup(data.message || "Enquiry sent!", "Enquiry Sent!");
        document.getElementById('name').value = "";
        document.getElementById('email').value = "";
        document.getElementById('message').value = "";
        btn.innerText = "Send Message";
        btn.disabled = false;
    })
    .catch(err => {
        console.error(err);
        showMessage("Error sending enquiry!", "error");
        btn.innerText = "Send Message";
        btn.disabled = false;
    });
}


// ===== SIGNUP =====
function openSignup() {
    document.getElementById("signupModal").style.display = "block";
}

function closeSignup() {
    document.getElementById("signupModal").style.display = "none";
}

function registerUser() {
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value.trim();

    if (!name || !email || !password) {
        showMessage("Please fill all fields!", "error");
        return;
    }

    if (password.length < 6) {
        showMessage("Password must be at least 6 characters!", "error");
        return;
    }

    fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showMessage("Signup successful! Please sign in.", "success");
            closeSignup();
            // Clear fields
            document.getElementById("signupName").value = "";
            document.getElementById("signupEmail").value = "";
            document.getElementById("signupPassword").value = "";
        } else {
            showMessage(data.message || "Signup failed", "error");
        }
    })
    .catch(err => {
        console.error(err);
        showMessage("Server error!", "error");
    });
}


// ===== SIGNIN =====
function openSignin() {
    document.getElementById("signin-modal").style.display = "block";
}

function closeSignin() {
    document.getElementById("signin-modal").style.display = "none";
}

function loginUser() {
    const email = document.getElementById("signin-email").value.trim();
    const password = document.getElementById("signin-password").value.trim();

    if (!email || !password) {
        showMessage("Please fill all fields!", "error");
        return;
    }

    fetch(`${API_BASE}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showMessage("Login successful!", "success");
            localStorage.setItem("username", data.name);
            localStorage.setItem("userEmail", data.email);
            setTimeout(() => location.reload(), 500);
        } else {
            showMessage(data.message || "Login failed", "error");
        }
    })
    .catch(err => {
        console.error(err);
        showMessage("Server error", "error");
    });
}


// ===== MODAL CLOSE ON OUTSIDE CLICK =====
window.addEventListener("click", function (event) {
    const signupModal = document.getElementById("signupModal");
    const signinModal = document.getElementById("signin-modal");
    const forgotModal = document.getElementById("forgotModal");
    const orderHistoryModal = document.getElementById("orderHistoryModal");

    if (event.target === signupModal) signupModal.style.display = "none";
    if (event.target === signinModal) signinModal.style.display = "none";
    if (event.target === forgotModal) forgotModal.style.display = "none";
    if (event.target === orderHistoryModal) orderHistoryModal.style.display = "none";
});


// ===== CHECK USER / SHOW USER =====
function checkUser() {
    const username = localStorage.getItem("username");

    if (username) {
        document.getElementById("user-section").style.display = "flex";
        document.getElementById("auth-section").style.display = "none";
        document.getElementById("welcome").innerText = "Welcome, " + username;
    } else {
        document.getElementById("user-section").style.display = "none";
        document.getElementById("auth-section").style.display = "flex";
    }
}


// ===== LOGOUT =====
function logout() {
    localStorage.removeItem("username");
    localStorage.removeItem("userEmail");
    location.reload();
}


// ===== AUTH GATE FOR ORDER PAGE =====
function goToOrder(productId) {
    const username = localStorage.getItem("username");
    if (!username) {
        showMessage("Please sign in first to place an order!", "error");
        setTimeout(() => openSignin(), 1500);
        return;
    }
    if (productId) {
        window.location.href = "order.html?product=" + productId;
    } else {
        window.location.href = "order.html";
    }
}


// ===== FORGOT PASSWORD =====
function openForgotPassword() {
    closeSignin();
    document.getElementById("forgotModal").style.display = "block";
}

function closeForgotPassword() {
    document.getElementById("forgotModal").style.display = "none";
}

function resetPassword() {
    const email = document.getElementById("forgot-email").value.trim();
    const newPassword = document.getElementById("forgot-new-password").value.trim();
    const confirmPassword = document.getElementById("forgot-confirm-password").value.trim();

    if (!email || !newPassword || !confirmPassword) {
        showMessage("Please fill all fields!", "error");
        return;
    }

    if (newPassword.length < 6) {
        showMessage("Password must be at least 6 characters!", "error");
        return;
    }

    if (newPassword !== confirmPassword) {
        showMessage("Passwords do not match!", "error");
        return;
    }

    fetch(`${API_BASE}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, "success");
            closeForgotPassword();
            document.getElementById("forgot-email").value = "";
            document.getElementById("forgot-new-password").value = "";
            document.getElementById("forgot-confirm-password").value = "";
            setTimeout(() => openSignin(), 1500);
        } else {
            showMessage(data.message || "Reset failed", "error");
        }
    })
    .catch(err => {
        console.error(err);
        showMessage("Server error!", "error");
    });
}


// ===== ORDER HISTORY =====
function openOrderHistory() {
    const username = localStorage.getItem("username");
    if (!username) {
        showMessage("Please sign in first!", "error");
        return;
    }

    const modal = document.getElementById("orderHistoryModal");
    const container = document.getElementById("order-history-list");
    container.innerHTML = "<p style='color:#888;'>Loading orders...</p>";
    modal.style.display = "block";

    fetch(`${API_BASE}/my-orders/${encodeURIComponent(username)}`)
        .then(res => res.json())
        .then(data => {
            if (!data.success || data.orders.length === 0) {
                container.innerHTML = "<p style='color:#888; text-align:center; padding:20px 0;'>No orders found.</p>";
                return;
            }

            let html = '<table class="order-history-table"><thead><tr><th>Order #</th><th>Product</th><th>Qty</th><th>Price</th><th>Phone</th></tr></thead><tbody>';
            data.orders.forEach(order => {
                html += `<tr>
                    <td>${order.id}</td>
                    <td>${order.product_name || "N/A"}</td>
                    <td>${order.quantity}</td>
                    <td>Rs. ${order.price || "N/A"}</td>
                    <td>${order.phone}</td>
                </tr>`;
            });
            html += '</tbody></table>';
            container.innerHTML = html;
        })
        .catch(err => {
            console.error(err);
            container.innerHTML = "<p style='color:#dc3545; text-align:center;'>Failed to load orders.</p>";
        });
}

function closeOrderHistory() {
    document.getElementById("orderHistoryModal").style.display = "none";
}
function placeOrder() {
    const product_id = new URLSearchParams(window.location.search).get("product");
    const quantity = document.getElementById("quantity").value;
    const customer_name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;

    if (!product_id || !quantity || !customer_name || !phone) {
        alert("Please fill all fields");
        return;
    }

    fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            product_id,
            quantity,
            customer_name,
            phone
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("✅ Order placed successfully!");
            window.location.href = "index.html";
        } else {
            alert(data.message || "Error placing order");
        }
    })
    .catch(err => {
        console.error(err);
        alert("Server error");
    });
}
