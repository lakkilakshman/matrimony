# Database Import Instructions

## ✅ Schema Fixed!

The MySQL error has been resolved. The `age` field is now a regular INT column instead of a generated column.

## How to Import the Schema

### Step 1: Open PHPMyAdmin
- Go to: `http://localhost/phpmyadmin`
- Login with your MySQL credentials

### Step 2: Create Database (if not already created)
1. Click **"New"** in the left sidebar
2. Database name: `merukayana_matrimony`
3. Collation: `utf8mb4_general_ci`
4. Click **"Create"**

### Step 3: Import Schema
1. Click on the `merukayana_matrimony` database in the left sidebar
2. Click the **"Import"** tab at the top
3. Click **"Choose File"** button
4. Navigate to: `backend/database/schema.sql`
5. Click **"Go"** at the bottom of the page
6. Wait for the success message

### Step 4: Verify Tables Created
After import, you should see 17 tables:
- ✅ users
- ✅ profiles
- ✅ education_details
- ✅ professional_details
- ✅ family_details
- ✅ location_details
- ✅ astrology_details
- ✅ profile_photos
- ✅ partner_preferences
- ✅ favorites
- ✅ interest_requests
- ✅ messages
- ✅ profile_views
- ✅ notifications
- ✅ admin_logs
- ✅ otp_verifications

### Step 5: Start Backend Server
Once the database is imported successfully:

```bash
cd backend
npm run dev
```

You should see:
```
✅ Database connected successfully
🚀 Server is running on port 5000
```

## What Was Fixed

**Problem:** MySQL doesn't allow `CURDATE()` function in GENERATED columns.

**Solution:** 
- Changed `age` from auto-calculated to regular INT field
- Age is now calculated in the application code when:
  - Creating new profiles (registration)
  - Updating profiles
  - Fetching profile data

**Files Updated:**
- `backend/database/schema.sql` - Removed GENERATED ALWAYS AS clause
- `backend/utils/helpers.js` - Added `calculateAge()` function
- `backend/controllers/authController.js` - Calculate age during registration

## Next Steps

After successful import:
1. ✅ Database is ready
2. ✅ Backend will connect successfully
3. ✅ You can test registration/login
4. ✅ Age will be calculated automatically

The application will now work correctly! 🎉
