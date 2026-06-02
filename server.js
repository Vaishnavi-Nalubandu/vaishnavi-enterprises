const cors = require("cors");
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend")));


// ===== DATABASE CONNECTION (RAILWAY) =====
const db = mysql.createConnection({
    host: "zephyr.proxy.rlwy.net",
    user: "root",
    password: "WrmVYMgjpxAlzFvsAXfGaHZiPSWzeqTn",
    database: "railway",
    port: 28058
});

db.connect((err) => {
    if (err) {
        console.error("❌ Database connection failed:", err.message);
    } else {
        console.log("✅ Connected to Railway MySQL");
    }
});

db.query(`
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  size VARCHAR(50),
  price DECIMAL(10,2),
  stock INT
)
`, (err) => {
    if (err) {
        console.error("Table creation error:", err.message);
    } else {
        console.log("✅ Products table ready");
    }
});

db.query("SELECT COUNT(*) AS count FROM products", (err, result) => {
    if (err) {
        console.error(err);
        return;
    }

    if (result[0].count === 0) {
        db.query(`
            INSERT INTO products (name, size, price, stock) VALUES
            ('Leaf Plate', 'Large', 250.00, 50),
            ('Leaf Plate', 'Medium', 180.00, 40),
            ('Leaf Plate', 'Small', 120.00, 30)
        `, (err) => {
            if (err) console.error(err);
            else console.log("✅ Sample products inserted ONCE");
        });
    } else {
        console.log("ℹ️ Products already exist, skipping insert");
    }
});


// ===== DEFAULT ROUTE =====
app.get("/", (req, res) => {
    console.log("Serving file from:", path.join(__dirname, "frontend", "index.html"));
    res.sendFile(path.join(__dirname, "frontend", "index.html"));
});


// ===== PRODUCTS =====
app.get("/products", (req, res) => {
    db.query("SELECT * FROM products", (err, result) => {
        if (err) {
            console.error("Products fetch error:", err.message);
            return res.status(500).json({ success: false, message: "Failed to load products" });
        }
        res.json(result);
    });
});


// ===== ENQUIRY =====
app.post("/enquiry", (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const sql = "INSERT INTO enquiries (name, email, message) VALUES (?, ?, ?)";
    db.query(sql, [name, email, message], (err) => {
        if (err) {
            console.error("Enquiry error:", err.message);
            return res.status(500).json({ success: false, message: "Error saving enquiry" });
        }
        res.json({ success: true, message: "Enquiry saved successfully!" });
    });
});


// ===== GET ENQUIRIES =====
app.get("/enquiries", (req, res) => {
    db.query("SELECT * FROM enquiries ORDER BY id DESC", (err, result) => {
        if (err) {
            console.error("Enquiries fetch error:", err.message);
            return res.status(500).json({ success: false, message: "Failed to load enquiries" });
        }
        res.json(result);
    });
});


// ===== ORDERS =====
app.post("/orders", (req, res) => {
    const { product_id, quantity, customer_name, phone } = req.body;

    if (!product_id || !quantity || !customer_name || !phone) {
        return res.status(400).json({ success: false, message: "Required fields missing" });
    }

    const query = "INSERT INTO orders (product_id, quantity, customer_name, phone) VALUES (?, ?, ?, ?)";
    db.query(query, [product_id, quantity, customer_name, phone], (err) => {
        if (err) {
            console.error("Order error:", err.message);
            return res.status(500).json({ success: false, message: "Error placing order" });
        }
        res.json({ success: true, message: "Order placed successfully!" });
    });
});


// ===== ORDER HISTORY =====
app.get("/my-orders/:name", (req, res) => {
    const customerName = req.params.name;

    const query = `
        SELECT o.id, o.quantity, o.phone, p.name AS product_name, p.price
        FROM orders o
        LEFT JOIN products p ON o.product_id = p.id
        WHERE o.customer_name = ?
        ORDER BY o.id DESC
    `;

    db.query(query, [customerName], (err, result) => {
        if (err) {
            console.error("Order history error:", err.message);
            return res.status(500).json({ success: false, message: "Failed to load orders" });
        }
        res.json({ success: true, orders: result });
    });
});


// ===== RESET PASSWORD =====
app.post("/reset-password", async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const checkSql = "SELECT * FROM users WHERE email = ?";
    db.query(checkSql, [email], async (err, result) => {
        if (result.length === 0) {
            return res.status(404).json({ success: false, message: "No account found with this email" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updateSql = "UPDATE users SET password = ? WHERE email = ?";

        db.query(updateSql, [hashedPassword, email], () => {
            res.json({ success: true, message: "Password reset successful!" });
        });
    });
});


// ===== SIGNUP =====
app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(sql, [name, email, hashedPassword], (err) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(409).json({ success: false, message: "Email already registered!" });
            }
            return res.status(500).json({ success: false });
        }
        res.json({ success: true });
    });
});
db.query(`
CREATE TABLE IF NOT EXISTS enquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    message TEXT
)
`);


// ===== SIGNIN =====
app.post("/signin", (req, res) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
        if (!result || result.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const user = result[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Incorrect password" });
        }

        res.json({
            success: true,
            name: user.name,
            email: user.email
        });
    });
});


// ===== START SERVER =====
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});