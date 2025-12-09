---
description: How to test the TrackNHeal API endpoints
---

# Testing API Endpoints

## Prerequisites
- Server running at http://localhost:3000
- Use curl, Postman, or browser dev tools

## Available Endpoints

### 1. Signup (POST /signup)
Create a new user account.

```bash
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "password": "securepass123"}'
```

**Expected Response:**
```json
{"message": "Signup successful"}
```

---

### 2. Login (POST /login)
Authenticate an existing user.

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "securepass123"}'
```

**Expected Response:**
```json
{"message": "Login successful", "userId": 1}
```

---

### 3. Book Ambulance (POST /book)
Create a new ambulance booking.

```bash
curl -X POST http://localhost:3000/book \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "Jane Smith",
    "phone": "9876543210",
    "pickupLocation": "123 Main Street",
    "dropLocation": "City Hospital",
    "emergencyType": "Cardiac",
    "notes": "Patient has chest pain"
  }'
```

**Expected Response:**
```json
{"success": true, "message": "Booking confirmed!", "bookingId": 1}
```

---

## Emergency Types
Valid values for `emergencyType`:
- Cardiac
- Accident
- Pregnancy
- Respiratory
- General
- Other
