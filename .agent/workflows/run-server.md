---
description: How to start the TrackNHeal ambulance booking server
---

# Starting the Server

## Prerequisites
- Node.js installed
- MySQL installed and running
- Database `tracknheal_db` created with required tables

## Steps

1. Install dependencies (if not already done):
```bash
npm install
```

2. Ensure MySQL is running and the database is set up with required tables:
   - `users` table: `id`, `name`, `email`, `password`
   - `bookings` table: `id`, `patient_name`, `phone`, `pickup_location`, `drop_location`, `emergency_type`, `notes`

// turbo
3. Start the server:
```bash
node server.js
```

4. Open browser and visit:
   - http://localhost:3000

## Troubleshooting

### EADDRINUSE Error (Port 3000 in use)
If you get an error that port 3000 is already in use:

1. Find the process using port 3000:
```bash
netstat -ano | findstr :3000
```

2. Kill the process (replace PID with the actual process ID):
```bash
taskkill /PID <PID> /F
```

3. Restart the server with step 3 above.
