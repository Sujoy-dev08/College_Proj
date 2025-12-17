import express from "express";
import mysql from "mysql2";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10; // Cost factor for bcrypt hashing

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

// ✅ MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "BABU@08ram",
    database: "tracknheal_db"
});

db.connect(err => {
    if (err) throw err;
    console.log("✅ MySQL Connected");
});

// ✅ SIGNUP API (with password hashing)
app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
        return res.json({ message: "All fields are required" });
    }

    try {
        // Hash password with bcrypt
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

        db.query(sql, [name, email, hashedPassword], (err, result) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.json({ message: "Email already exists" });
                }
                console.error("Signup error:", err);
                return res.json({ message: "Signup failed" });
            }
            res.json({ message: "Signup successful", userId: result.insertId });
        });
    } catch (error) {
        console.error("Hashing error:", error);
        res.json({ message: "Signup failed" });
    }
});

// ✅ LOGIN API (with password comparison)
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.json({ success: false, message: "Email and password are required" });
    }
    const sql = "SELECT * FROM users WHERE email=?";
    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error("Login error:", err);
            return res.json({ success: false, message: "Login failed" });
        }

        if (results.length > 0) {
            const user = results[0];

            try {
                // Check if password is bcrypt hashed (starts with $2b$ or $2a$)
                const isHashed = user.password.startsWith('$2b$') || user.password.startsWith('$2a$');

                let match = false;
                if (isHashed) {
                    // Compare with bcrypt
                    match = await bcrypt.compare(password, user.password);
                } else {
                    // Legacy: plain text comparison (for old accounts)
                    match = (password === user.password);
                }

                if (match) {
                    res.json({ success: true, message: "Login successful", userId: user.id, userName: user.name });
                } else {
                    res.json({ success: false, message: "Invalid email or password" });
                }
            } catch (error) {
                console.error("Compare error:", error);
                res.json({ success: false, message: "Login failed" });
            }
        } else {
            res.json({ success: false, message: "Invalid email or password" });
        }
    });
});

// ✅ BOOK AMBULANCE API
app.post("/book", (req, res) => {
    const { patientName, phone, pickupLocation, dropLocation, emergencyType, notes } = req.body;

    // Validate required fields
    if (!patientName || !phone || !pickupLocation || !dropLocation || !emergencyType) {
        return res.json({
            success: false,
            message: "All required fields must be filled"
        });
    }

    const sql = `INSERT INTO bookings (patient_name, phone, pickup_location, drop_location, emergency_type, notes) 
                 VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(sql, [patientName, phone, pickupLocation, dropLocation, emergencyType, notes || ""], (err, result) => {
        if (err) {
            console.error("Booking error:", err);
            return res.json({
                success: false,
                message: "Booking failed. Please try again."
            });
        }
        res.json({
            success: true,
            message: "Booking confirmed!",
            bookingId: result.insertId
        });
    });
});

// ✅ Start server
app.listen(3000, () => {
    console.log("✅ Server running at http://localhost:3000");
});
