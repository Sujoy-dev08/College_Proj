## 📘 Project Overview

A web-based application that provides a structured interface for workflows. The project uses HTML, CSS, JavaScript for the frontend and
Node.js for backend processing.

## 🚀 Features

-   User authentication and interface
-   Dashboard layout for users
-   CRUD operations
-   Responsive design
-   Static asset handling

## 🛠️ Tech Stack & Tools

-   **Frontend:** HTML, CSS, JavaScript
-   **Backend:** Node.js (`server.js`)
-   **Package Manager:** npm

## 📁 Project Structure

    .
    ├── node_modules/
    ├── public/
    ├── package.json
    ├── package-lock.json
    ├── server.js

## 📝 Getting Started -- Installation & Setup

1.  Clone repo:

    ``` bash
    git clone https://github.com/rohanchakraborty197/Collage_Proj.git
    cd Collage_Proj
    ```

2.  Install dependencies:

    ``` bash
    npm install
    ```

3.  Start server:

    ``` bash
    node server.js
    ```

4.  Open in browser:

    -   Visit `http://localhost:<port>`

## 👥 Usage

-   Register/login
-   Navigate dashboard
-   Use CRUD features


## 🎯 Future Improvements

-   Add database connectivity
-   Improve UI/UX
-   Role-based access
-   Deployment support

# 🔐 Password Hashing Implementation with Bcrypt

## Problem Statement
Previously, user passwords were stored as **plain text** in the database, which is a critical security vulnerability. If the database is compromised, all passwords are exposed.



### Step 1: Installed Bcrypt Package
```bash
npm install bcrypt
```
Bcrypt is an industry-standard library for secure password hashing.

---

### Step 2: Imported Bcrypt in server.js
```javascript
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10; // Cost factor for hashing
```
- **Salt Rounds = 10** means the hashing algorithm runs 2^10 = 1024 iterations
- Higher = more secure but slower

---

### Step 3: Updated Signup API
```javascript
// Hash password before storing
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
db.query(sql, [name, email, hashedPassword], ...)
```

---

### Step 4: Updated Login API
**Before (Insecure):**
```javascript
// Fetch user by email only
const sql = "SELECT * FROM users WHERE email=?";

// Then compare password using bcrypt
const match = await bcrypt.compare(password, user.password);
if (match) {
    // Login successful
}
```

---

## How Bcrypt Works

```
User Password: "mypassword123"
                    ↓
            bcrypt.hash()
                    ↓
Stored in DB: "$2b$10$N9qo8uLOickgx2ZMRZoMye.IjqQBrkHx5..."
              └─────┬─────┘
           60-character hash (irreversible)
```

---

## Files Changed

| File | Changes |
|------|---------|
| [package.json](cci:7://file:///c:/Users/rohan/OneDrive/Desktop/Collage_Proj/package.json:0:0-0:0) | Added bcrypt dependency |
| [server.js](cci:7://file:///c:/Users/rohan/OneDrive/Desktop/Collage_Proj/server.js:0:0-0:0) | Updated signup & login with bcrypt |

---

## Testing Steps

1. **Clear old users** (they have plain text passwords):
   ```sql
   TRUNCATE TABLE users;
   ```

2. **Create new account** via signup form

3. **Check database** - password will look like:
   ```
   $2b$10$XKxEZB1G...
   ```

4. **Login** with the new account

---

## Security Benefits

| Aspect | Before | After |
|--------|--------|-------|
| Password Storage | Plain text `password123` | Hashed `$2b$10$...` |
| If DB Leaked | All passwords exposed | Passwords protected |
| Rainbow Table Attack | Vulnerable | Protected (unique salt) |
| Brute Force | Easy | Very slow (10 rounds) |

---



## 🔗 Repository

https://github.com/rohanchakraborty197/Collage_Proj


