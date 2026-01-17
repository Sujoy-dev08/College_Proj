import "dotenv/config";
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
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
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
    const { userId, patientName, phone, pickupLocation, dropLocation, emergencyType, notes } = req.body;

    // Validate required fields
    if (!patientName || !phone || !pickupLocation || !dropLocation || !emergencyType) {
        return res.json({
            success: false,
            message: "All required fields must be filled"
        });
    }

    const sql = `INSERT INTO bookings (user_id, patient_name, phone, pickup_location, drop_location, emergency_type, notes, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`;

    db.query(sql, [userId || null, patientName, phone, pickupLocation, dropLocation, emergencyType, notes || ""], (err, result) => {
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

// ✅ GET USER'S BOOKING HISTORY
app.get("/user/bookings/:userId", (req, res) => {
    const { userId } = req.params;

    const sql = "SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC";
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Fetch user bookings error:", err);
            return res.json({ success: false, message: "Failed to fetch bookings" });
        }
        res.json({ success: true, bookings: results });
    });
});

// ✅ USER CANCEL BOOKING
app.put("/user/bookings/:bookingId/cancel", (req, res) => {
    const { bookingId } = req.params;
    const { userId } = req.body;

    // First check if booking belongs to user and is cancellable
    const checkSql = "SELECT * FROM bookings WHERE id = ? AND user_id = ?";
    db.query(checkSql, [bookingId, userId], (err, results) => {
        if (err) {
            console.error("Check booking error:", err);
            return res.json({ success: false, message: "Failed to cancel booking" });
        }

        if (results.length === 0) {
            return res.json({ success: false, message: "Booking not found" });
        }

        const booking = results[0];
        if (booking.status === 'completed' || booking.status === 'cancelled') {
            return res.json({ success: false, message: "Cannot cancel this booking" });
        }

        // Cancel the booking
        const updateSql = "UPDATE bookings SET status = 'cancelled' WHERE id = ?";
        db.query(updateSql, [bookingId], (err, result) => {
            if (err) {
                console.error("Cancel booking error:", err);
                return res.json({ success: false, message: "Failed to cancel booking" });
            }
            res.json({ success: true, message: "Booking cancelled successfully" });
        });
    });
});

// ✅ ADMIN APIs:
// ✅ ADMIN LOGIN API
app.post("/admin/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: "Email and password are required" });
    }

    const sql = "SELECT * FROM admins WHERE email=?";
    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error("Admin login error:", err);
            return res.json({ success: false, message: "Login failed" });
        }

        if (results.length > 0) {
            const admin = results[0];

            try {
                const isHashed = admin.password.startsWith('$2b$') || admin.password.startsWith('$2a$');
                let match = false;

                if (isHashed) {
                    match = await bcrypt.compare(password, admin.password);
                } else {
                    // Allow plain text for initial setup
                    match = (password === admin.password);
                }

                if (match) {
                    res.json({
                        success: true,
                        message: "Admin login successful",
                        adminId: admin.id,
                        adminName: admin.username
                    });
                } else {
                    res.json({ success: false, message: "Invalid admin credentials" });
                }
            } catch (error) {
                console.error("Admin compare error:", error);
                res.json({ success: false, message: "Login failed" });
            }
        } else {
            res.json({ success: false, message: "Invalid admin credentials" });
        }
    });
});

// ✅ GET ALL BOOKINGS (for admin dashboard)
app.get("/admin/bookings", (req, res) => {
    const sql = "SELECT * FROM bookings ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Fetch bookings error:", err);
            return res.json({ success: false, message: "Failed to fetch bookings" });
        }
        res.json({ success: true, bookings: results });
    });
});

// ✅ UPDATE BOOKING STATUS
app.put("/admin/bookings/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'dispatched', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.json({ success: false, message: "Invalid status" });
    }

    const sql = "UPDATE bookings SET status = ? WHERE id = ?";
    db.query(sql, [status, id], (err, result) => {
        if (err) {
            console.error("Update status error:", err);
            return res.json({ success: false, message: "Failed to update status" });
        }
        if (result.affectedRows === 0) {
            return res.json({ success: false, message: "Booking not found" });
        }
        res.json({ success: true, message: "Status updated successfully" });
    });
});

// ✅ GET BOOKING STATS (for dashboard cards)
app.get("/admin/stats", (req, res) => {
    const sql = `
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'dispatched' THEN 1 ELSE 0 END) as dispatched,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
        FROM bookings
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Stats error:", err);
            return res.json({ success: false, message: "Failed to fetch stats" });
        }
        res.json({ success: true, stats: results[0] });
    });
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
