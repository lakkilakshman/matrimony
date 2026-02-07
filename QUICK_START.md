# Quick Start Guide - Merukayana Matrimony

## 🚀 Quick Setup (5 Minutes)

### 1. Database Setup
```bash
# Open PHPMyAdmin: http://localhost/phpmyadmin
# Create database: merukayana_matrimony
# Import: backend/database/schema.sql
```

### 2. Backend Setup
```bash
cd backend
copy .env.example .env
# Edit .env - set DB_PASSWORD if needed
npm install
npm run dev
```

### 3. Frontend Setup
```bash
# In project root
npm install
npm run dev
```

### 4. Create Admin Account
```sql
-- In PHPMyAdmin, run this SQL:
INSERT INTO users (email, mobile, password_hash, role, status) 
VALUES (
  'admin@merukayana.com',
  '9999999999',
  '$2a$10$YourHashedPasswordHere',  -- Use bcrypt to hash 'admin123'
  'admin',
  'active'
);
```

---

## 📋 What's Been Built

### ✅ Backend (Complete)
- **Database**: 17 MySQL tables
- **Authentication**: JWT-based auth with bcrypt
- **APIs**: 
  - Auth (register, login, admin login)
  - Profiles (CRUD, search, pagination)
  - Admin (dashboard, user management, verification)
  - Favorites (shortlist management)
  - Interests (send/receive/accept/reject)
- **Security**: Helmet, CORS, rate limiting
- **File Upload**: Multer for profile photos

### ✅ Frontend Services (Complete)
- `api.js` - Axios instance with interceptors
- `authService.js` - Authentication methods
- `profileService.js` - Profile CRUD operations
- `adminService.js` - Admin operations
- `favoritesService.js` - Favorites management
- `interestsService.js` - Interest requests

### 🔄 Frontend Pages (To Update)
- [ ] LoginPage - Connect to API
- [ ] RegistrationPage - Multi-step with API
- [ ] BrowseProfilesPage - Fetch from API
- [ ] ProfileDetailPage - API integration
- [ ] SearchFilterPage - Backend filters
- [ ] UserProfilePage - Real data
- [ ] EditProfilePage - Update API
- [ ] AdminDashboard - Admin APIs

---

## 🔑 API Endpoints

### Authentication
```
POST   /api/auth/register        - Register user
POST   /api/auth/login           - User login
POST   /api/auth/admin-login     - Admin login
GET    /api/auth/me              - Current user
POST   /api/auth/logout          - Logout
```

### Profiles
```
GET    /api/profiles             - All profiles (paginated)
GET    /api/profiles/:id         - Single profile
PUT    /api/profiles/:id         - Update profile
GET    /api/profiles/search      - Search with filters
```

### Admin
```
GET    /api/admin/stats                    - Dashboard stats
GET    /api/admin/users                    - All users
PUT    /api/admin/users/:id/status         - Update status
GET    /api/admin/pending-verifications    - Pending profiles
PUT    /api/admin/profiles/:id/verify      - Verify profile
GET    /api/admin/logs                     - Activity logs
```

### Favorites
```
GET    /api/favorites                - User's favorites
POST   /api/favorites/:profileId     - Add favorite
DELETE /api/favorites/:profileId     - Remove favorite
```

### Interests
```
GET    /api/interests/sent           - Sent interests
GET    /api/interests/received       - Received interests
POST   /api/interests/:profileId     - Send interest
PUT    /api/interests/:id/accept     - Accept
PUT    /api/interests/:id/reject     - Reject
```

---

## 🗄️ Database Tables

1. **users** - Authentication & user accounts
2. **profiles** - Main profile information
3. **education_details** - Educational background
4. **professional_details** - Career information
5. **family_details** - Family information
6. **location_details** - Address & location
7. **astrology_details** - Horoscope details
8. **profile_photos** - Multiple photos per profile
9. **partner_preferences** - Desired partner criteria
10. **favorites** - Saved profiles
11. **interest_requests** - Interest management
12. **messages** - User messaging
13. **profile_views** - View tracking
14. **notifications** - System notifications
15. **admin_logs** - Admin activity
16. **otp_verifications** - OTP management

---

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=merukayana_matrimony
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📝 Next Steps

1. **Test Backend**: Visit `http://localhost:5000` to see API info
2. **Test Registration**: Create a test user account
3. **Test Login**: Login with created account
4. **Admin Access**: Login at `/admin-login`
5. **Update Pages**: Integrate remaining frontend pages with APIs

---

## 🐛 Common Issues

**Database Connection Failed**
- Check MySQL is running in XAMPP
- Verify `.env` credentials

**CORS Errors**
- Ensure `FRONTEND_URL` matches your frontend URL

**401 Unauthorized**
- Token expired or invalid
- Login again

**Port in Use**
- Change `PORT` in backend `.env`
- Change port in frontend `package.json`

---

## 📚 File Structure

```
mat/
├── backend/               # Node.js/Express API
│   ├── config/           # Database config
│   ├── controllers/      # Business logic
│   ├── middleware/       # Auth, upload, etc.
│   ├── routes/           # API routes
│   ├── database/         # SQL schema
│   └── server.js         # Main server
│
├── src/
│   ├── services/         # API service layer
│   ├── pages/            # React pages
│   ├── components/       # UI components
│   └── context/          # React context
│
├── SETUP_GUIDE.md        # Detailed setup
└── QUICK_START.md        # This file
```

---

## ✨ Features Implemented

- ✅ User registration & authentication
- ✅ Profile management (CRUD)
- ✅ Advanced search & filters
- ✅ Pagination
- ✅ Admin dashboard
- ✅ Profile verification workflow
- ✅ Favorites/shortlist
- ✅ Interest requests
- ✅ Activity logging
- ✅ File uploads
- ✅ Security (JWT, bcrypt, helmet)

---

## 🎯 Ready to Use

The backend is **fully functional** and ready to use. You can:
- Test APIs using Postman/Thunder Client
- Start integrating frontend pages
- Add sample data to database
- Customize as needed

**Happy Coding! 🚀**
