# Merukayana Matrimony - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **MySQL** (v8.0 or higher)
- **XAMPP/WAMP** (for PHPMyAdmin)

---

## Step 1: Database Setup

### 1.1 Start MySQL Server
- Open XAMPP/WAMP Control Panel
- Start **Apache** and **MySQL** services

### 1.2 Access PHPMyAdmin
- Open browser and go to: `http://localhost/phpmyadmin`
- Login with your MySQL credentials (default: username=`root`, password=empty)

### 1.3 Create Database
1. Click on **"New"** in the left sidebar
2. Database name: `merukayana_matrimony`
3. Collation: `utf8mb4_general_ci`
4. Click **"Create"**

### 1.4 Import Schema
1. Select the `merukayana_matrimony` database
2. Click on **"Import"** tab
3. Click **"Choose File"**
4. Navigate to: `backend/database/schema.sql`
5. Click **"Go"** at the bottom
6. Wait for success message

### 1.5 Verify Tables
- Click on `merukayana_matrimony` database
- You should see 17 tables created:
  - users
  - profiles
  - education_details
  - professional_details
  - family_details
  - location_details
  - astrology_details
  - profile_photos
  - partner_preferences
  - favorites
  - interest_requests
  - messages
  - profile_views
  - notifications
  - admin_logs
  - otp_verifications

---

## Step 2: Backend Setup

### 2.1 Configure Environment
1. Navigate to `backend` folder
2. Copy `.env.example` to `.env`:
   ```bash
   cd backend
   copy .env.example .env
   ```

3. Edit `.env` file with your database credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=          # Your MySQL password (leave empty if no password)
   DB_NAME=merukayana_matrimony
   JWT_SECRET=your_super_secret_key_here_change_this
   ```

### 2.2 Install Dependencies
```bash
cd backend
npm install
```

### 2.3 Start Backend Server
```bash
npm run dev
```

You should see:
```
✅ Database connected successfully
🚀 Server is running on port 5000
📍 API URL: http://localhost:5000
```

---

## Step 3: Frontend Setup

### 3.1 Install Frontend Dependencies
```bash
# In project root directory
npm install
```

### 3.2 Start Frontend Development Server
```bash
npm run dev
```

The app will open at: `http://localhost:3000`

---

## Step 4: Create Admin Account

### 4.1 Using PHPMyAdmin
1. Go to PHPMyAdmin
2. Select `merukayana_matrimony` database
3. Click on `users` table
4. Click **"Insert"** tab
5. Fill in the following:
   - email: `admin@merukayana.com`
   - mobile: `9999999999`
   - password_hash: (see below)
   - role: `admin`
   - status: `active`

### 4.2 Generate Password Hash
To hash the password "admin123", run this in Node.js:

```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('admin123', 10);
console.log(hash);
```

Or use an online bcrypt generator with password: `admin123`

### 4.3 Admin Login
- Go to: `http://localhost:3000/admin-login`
- Email: `admin@merukayana.com`
- Password: `admin123`

---

## Step 5: Test the Application

### 5.1 Register New User
1. Go to: `http://localhost:3000/register`
2. Fill in registration form
3. Submit

### 5.2 Login
1. Go to: `http://localhost:3000/login`
2. Use registered credentials
3. Login

### 5.3 Browse Profiles
- After login, click "Browse Profiles"
- You should see profiles from the database

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Profiles
- `GET /api/profiles` - Get all profiles (with pagination)
- `GET /api/profiles/:id` - Get single profile
- `PUT /api/profiles/:id` - Update profile
- `GET /api/profiles/search` - Search profiles with filters

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/pending-verifications` - Pending verifications
- `PUT /api/admin/profiles/:id/verify` - Verify/reject profile
- `GET /api/admin/logs` - Admin activity logs

### Favorites
- `GET /api/favorites` - Get user's favorites
- `POST /api/favorites/:profileId` - Add to favorites
- `DELETE /api/favorites/:profileId` - Remove from favorites

### Interests
- `GET /api/interests/sent` - Sent interest requests
- `GET /api/interests/received` - Received interest requests
- `POST /api/interests/:profileId` - Send interest
- `PUT /api/interests/:id/accept` - Accept interest
- `PUT /api/interests/:id/reject` - Reject interest

---

## Troubleshooting

### Database Connection Failed
- Check if MySQL is running in XAMPP/WAMP
- Verify database credentials in `.env`
- Ensure database name is correct

### Port Already in Use
- Backend (5000): Change `PORT` in `.env`
- Frontend (3000): Change port in `package.json` dev script

### CORS Errors
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Default: `http://localhost:3000`

---

## Next Steps

1. **Add Sample Data**: Create some test profiles in the database
2. **Test Features**: Try registration, login, profile browsing
3. **Admin Panel**: Verify profiles using admin dashboard
4. **Customize**: Update colors, branding, content as needed

---

## File Structure

```
mat/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── profileController.js
│   │   ├── adminController.js
│   │   ├── favoritesController.js
│   │   └── interestsController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── profiles.js
│   │   ├── admin.js
│   │   ├── favorites.js
│   │   └── interests.js
│   ├── database/
│   │   └── schema.sql
│   ├── uploads/
│   ├── .env
│   ├── package.json
│   └── server.js
├── src/
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── profileService.js
│   │   ├── adminService.js
│   │   ├── favoritesService.js
│   │   └── interestsService.js
│   ├── pages/
│   ├── components/
│   └── context/
└── .env
```

---

## Support

For issues or questions:
1. Check the console for error messages
2. Verify all services are running
3. Check database connection
4. Review API endpoint responses
