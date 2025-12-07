import express from "express";
import mysql from "mysql2";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Narayan@2004",
    database: "tracknheal_db"
});

db.connect(err => {
    if (err) throw err;
    console.log("✅ MySQL Connected");
});

// ✅ SIGNUP API
app.post("/signup", (req, res) => {
    const { name, email, password } = req.body;
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

    db.query(sql, [name, email, password], (err, result) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.json({ message: "Email already exists" });
            }
            return res.json({ message: "Signup failed" });
        }
        res.json({ message: "Signup successful" });
    });
});

// ✅ LOGIN API
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email=? AND password=?";

    db.query(sql, [email, password], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.json({ message: "Login successful" });
        } else {
            res.json({ message: "Invalid email or password" });
        }
    });
});

// ✅ Start server
app.listen(3000, () => {
    console.log("✅ Server running at http://localhost:3000");
});
