# Admin Portal Setup Guide

## Backend Setup

### 1. Environment Variables

Add to `backend/.env`:

```env
# Admin Authentication
ADMIN_EMAIL=youremail@yourdomain.com
ADMIN_PASSWORD=yourVeryStrongPassword#23987
ADMIN_JWT_SECRET=your-secret-jwt-key-min-32-chars
```

Generate JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. Create Admin User

Run the seed script:

```bash
cd backend
npm run prisma:seed
```

This creates a SUPER_ADMIN user with the email and password from `.env`.

### 3. Start Backend

```bash
npm run dev
```

## Frontend Setup

### 1. Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 2. Access Admin Portal

The admin portal is accessible at:

```
http://localhost:3000/internal-driver-portal-7v92nx
```

**⚠️ IMPORTANT:** This URL is intentionally obscure. Do not share it publicly or mention it in code comments.

**Note:** The folder name does NOT start with `_` (underscore) because Next.js treats folders starting with `_` as private folders that are excluded from routing.

## Default Login Credentials

After running `npm run seed` with default `.env` values:

- **Email:** `admin@glco.us`
- **Password:** `Admin123!@#`

**⚠️ IMPORTANT:** Change these credentials before deploying to production!

To change credentials:
1. Edit `backend/.env`:
   ```env
   ADMIN_EMAIL=yournewemail@example.com
   ADMIN_PASSWORD=YourNewStrongPassword123!@#
   ```
2. Run: `cd backend && npm run seed`

To check current admin user:
```bash
cd backend
npm run check-admin
```

## Security Features 

✅ **HttpOnly Cookies** - JWT tokens stored in HttpOnly cookies  
✅ **Rate Limiting** - 5 login attempts per 15 minutes  
✅ **Role-Based Access** - SUPER_ADMIN, MANAGER, VIEWER  
✅ **SSN Encryption** - SSN only decrypted with password confirmation (SUPER_ADMIN only)  
✅ **No SSN in Logs** - SSN never logged or exposed in error messages  
✅ **CSRF Protection** - SameSite=Strict cookies  
✅ **Secure Headers** - Proper CORS and security headers  

## API Endpoints

### Auth
- `POST /api/auth/login` - Login (rate limited)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Admin Applications
- `GET /api/admin/applications` - List applications (with filters)
- `GET /api/admin/applications/:id` - Get application details
- `PATCH /api/admin/applications/:id/status` - Update status and notes
- `POST /api/admin/applications/:id/decrypt-ssn` - Decrypt SSN (SUPER_ADMIN only)

## Features

### Applications List
- Search by name, email, phone
- Filter by status
- Filter by last 4 SSN
- Pagination

### Application Details
- Full applicant information
- SSN decryption (SUPER_ADMIN only, requires password)
- CDL documents (front/back images)
- Medical card
- Employment history
- Legal consents with signatures
- Status management
- Internal notes

## Roles

- **SUPER_ADMIN** - Full access, can decrypt SSN
- **MANAGER** - Can view and update applications
- **VIEWER** - Read-only access (not implemented yet)

## Production Checklist

- [ ] Change admin portal URL to a new random path
- [ ] Set strong `ADMIN_PASSWORD`
- [ ] Set strong `ADMIN_JWT_SECRET`
- [ ] Enable HTTPS (cookies require Secure flag)
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS for production domain
- [ ] Review rate limiting settings
- [ ] Test SSN decryption flow
- [ ] Verify no SSN in logs

