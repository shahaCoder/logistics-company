# Security Audit Report

**Date:** December 6, 2025  
**Project:** Global Cooperation LLC - Logistics Platform  
**Auditor:** Senior Application Security Engineer  
**Scope:** Full-stack security audit (Next.js frontend + Express backend)

---

## Executive Summary

**Overall Security Score: 6.5/10**

This audit identified **3 Critical**, **8 High**, **7 Medium**, and **5 Low** severity security issues. The application has good foundational security practices (SSN encryption, HttpOnly cookies, rate limiting on login), but several critical vulnerabilities require immediate attention, particularly around file uploads, JSON parsing, and missing security middleware.

---

## Critical Issues (Fix Immediately)

### 1. **Unsafe JSON.parse Without Error Handling**
**File:** `backend/src/modules/driverApplication/driverApplication.controller.ts:48-62`  
**Severity:** Critical  
**Risk:** Denial of Service (DoS), potential code injection if JSON contains malicious data

**Issue:**
```typescript
if (typeof formData.previousAddresses === 'string') {
  formData.previousAddresses = JSON.parse(formData.previousAddresses);
}
// No try-catch, can throw and crash server
```

**Fix:**
```typescript
try {
  if (typeof formData.previousAddresses === 'string') {
    formData.previousAddresses = JSON.parse(formData.previousAddresses);
  }
} catch (error) {
  return res.status(400).json({ error: 'Invalid JSON format' });
}
```

---

### 2. **No File Type Validation on Uploads**
**File:** `backend/src/modules/driverApplication/driverApplication.controller.ts:10-15`  
**Severity:** Critical  
**Risk:** Malicious file uploads (executables, scripts), potential RCE if files are executed

**Issue:**
- Multer only checks file size (10MB), no MIME type validation
- Files uploaded to Cloudinary without content verification
- Only checks `mimetype` for PDF detection, but `mimetype` can be spoofed

**Fix:**
```typescript
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = {
      'licenseFront': ['image/jpeg', 'image/png', 'image/jpg'],
      'licenseBack': ['image/jpeg', 'image/png', 'image/jpg'],
      'medicalCard': ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
      'consentAlcoholDrug': ['image/jpeg', 'image/png', 'image/jpg'],
      // ... other consent types
    };
    
    const allowed = allowedMimes[file.fieldname];
    if (allowed && allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type for ${file.fieldname}`));
    }
  },
});
```

**Additional:** Add file content validation using `file-type` library to verify actual file type, not just MIME type.

---

### 3. **Deprecated Multer Version with Known Vulnerabilities**
**File:** `backend/package.json:30`  
**Severity:** Critical  
**Risk:** Known security vulnerabilities in Multer 1.x

**Issue:**
```json
"multer": "^1.4.5-lts.1"
```
Package.json shows: "Multer 1.x is impacted by a number of vulnerabilities, which have been patched in 2.x."

**Fix:**
```bash
npm install multer@^2.0.0
# Update controller to use new API if needed
```

---

### 4. **Admin Portal URL Exposed in Frontend Code**
**File:** `src/app/internal-driver-portal-7v92nx/layout.tsx:75`  
**Severity:** Critical  
**Risk:** Security through obscurity is weak, but URL is hardcoded in client-side code

**Issue:**
- Admin portal path `/internal-driver-portal-7v92nx` is visible in frontend bundle
- Anyone can discover the admin URL by inspecting source code

**Fix:**
- Consider using environment variable for admin path (though still visible in bundle)
- Implement IP whitelisting for admin routes
- Add additional authentication layer (2FA)
- Use subdomain for admin panel (e.g., `admin.glco.us`)

---

### 5. **Password Prompt in Browser (Insecure)**
**File:** `src/app/internal-driver-portal-7v92nx/applications/[id]/page.tsx:171`  
**Severity:** Critical  
**Risk:** Password visible in browser prompt, stored in memory, logged in browser history

**Issue:**
```typescript
body: JSON.stringify({ password: prompt("Enter your admin password to decrypt SSN:") || "" }),
```

**Fix:**
- Use modal with password input (already implemented at line 1044, but also using prompt)
- Remove `prompt()` usage entirely
- Ensure password is cleared from memory after use

---

## High Severity Issues

### 6. **No Rate Limiting on Driver Application Endpoint**
**File:** `backend/src/modules/driverApplication/driverApplication.controller.ts`  
**Severity:** High  
**Risk:** DDoS, spam submissions, resource exhaustion

**Fix:**
```typescript
import rateLimit from 'express-rate-limit';

const driverAppRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 applications per 15 minutes per IP
  message: { error: 'Too many applications. Please try again later.' },
});

router.post('/', driverAppRateLimiter, upload.fields(uploadFields), ...);
```

---

### 7. **Missing CSRF Protection**
**File:** `backend/src/index.ts`  
**Severity:** High  
**Risk:** Cross-Site Request Forgery attacks

**Issue:**
- No CSRF tokens for state-changing operations
- Relies only on SameSite=Strict cookies (good, but not sufficient)

**Fix:**
```typescript
import csrf from 'csurf';
const csrfProtection = csrf({ cookie: true });

// Apply to POST/PUT/DELETE routes
app.use('/api/driver-applications', csrfProtection);
// Send CSRF token to frontend via cookie or endpoint
```

**Alternative:** Use double-submit cookie pattern or SameSite=Strict (already implemented, but add explicit CSRF tokens for extra security).

---

### 8. **CORS Configuration Allows Localhost in Production**
**File:** `backend/src/index.ts:17-20`  
**Severity:** High  
**Risk:** Allows requests from localhost in production if FRONTEND_URL is not set

**Issue:**
```typescript
origin: process.env.FRONTEND_URL || 'http://localhost:3000',
```

**Fix:**
```typescript
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL].filter(Boolean)
  : ['http://localhost:3000', process.env.FRONTEND_URL].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

---

### 9. **No Audit Logging for Sensitive Operations**
**File:** `backend/src/modules/admin-applications/admin-applications.service.ts`  
**Severity:** High  
**Risk:** No trail of who accessed SSN, deleted applications, changed statuses

**Issue:**
- SSN decryption not logged
- Application deletion not logged
- Status changes not logged with admin details

**Fix:**
```typescript
// Create audit log model in Prisma
model AuditLog {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  adminId   String
  action    String   // 'DECRYPT_SSN', 'DELETE_APPLICATION', 'UPDATE_STATUS'
  resourceId String
  details   Json?
}

// Log in service functions
await prisma.auditLog.create({
  data: {
    adminId: req.user.id,
    action: 'DECRYPT_SSN',
    resourceId: applicationId,
  },
});
```

---

### 10. **JWT Token Expiration Too Long**
**File:** `backend/src/modules/auth/auth.service.ts:47`  
**Severity:** High  
**Risk:** Stolen tokens valid for 7 days, no refresh mechanism

**Issue:**
```typescript
expiresIn: '7d', // 7 days
```

**Fix:**
```typescript
expiresIn: '15m', // 15 minutes
// Implement refresh token mechanism
// Store refresh tokens in database with expiration
```

---

### 11. **No File Content Validation**
**File:** `backend/src/services/cloudinary.ts`  
**Severity:** High  
**Risk:** Malicious files uploaded if MIME type is spoofed

**Issue:**
- Only checks `mimetype` property (can be spoofed)
- No actual file content verification

**Fix:**
```typescript
import { fileTypeFromBuffer } from 'file-type';

const fileType = await fileTypeFromBuffer(buffer);
const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
if (!fileType || !allowedTypes.includes(fileType.mime)) {
  throw new Error('Invalid file type');
}
```

---

### 12. **Error Messages May Leak Information**
**File:** `backend/src/index.ts:54-60`  
**Severity:** High  
**Risk:** Stack traces or error details exposed in production

**Issue:**
```typescript
message: process.env.NODE_ENV === 'development' ? err.message : undefined,
```
Good, but some endpoints may still leak details.

**Fix:**
- Ensure all error handlers mask sensitive info
- Never expose database errors, file paths, or internal structure
- Use generic error messages in production

---

### 13. **No Password Complexity Requirements**
**File:** `backend/prisma/seed.ts`  
**Severity:** High  
**Risk:** Weak admin passwords

**Issue:**
- No validation of password strength during seed
- Admin can set weak password

**Fix:**
```typescript
import { z } from 'zod';

const passwordSchema = z.string()
  .min(12)
  .regex(/[A-Z]/, 'Must contain uppercase')
  .regex(/[a-z]/, 'Must contain lowercase')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[^A-Za-z0-9]/, 'Must contain special character');

const password = passwordSchema.parse(process.env.ADMIN_PASSWORD);
```

---

## Medium Severity Issues

### 14. **Missing Security Headers Middleware (Helmet)**
**File:** `backend/src/index.ts`  
**Severity:** Medium  
**Risk:** Missing security headers on backend API

**Fix:**
```typescript
import helmet from 'helmet';
app.use(helmet({
  contentSecurityPolicy: false, // Configure if needed
  crossOriginEmbedderPolicy: false,
}));
```

---

### 15. **No Content Security Policy (CSP)**
**File:** `next.config.ts`  
**Severity:** Medium  
**Risk:** XSS protection incomplete

**Issue:**
- Next.js config has security headers, but no CSP
- `dangerouslySetInnerHTML` used in multiple places

**Fix:**
Add CSP header in `next.config.ts`:
```typescript
{
  key: 'Content-Security-Policy',
  value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.emailjs.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
}
```

**Also:** Replace `dangerouslySetInnerHTML` with safer alternatives where possible.

---

### 16. **Rate Limiting Uses In-Memory Storage**
**File:** `src/app/api/contact-telegram/route.ts:5`  
**Severity:** Medium  
**Risk:** Rate limits reset on server restart, not shared across instances

**Issue:**
```typescript
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
```

**Fix:**
- Use Redis for production
- Or use external rate limiting service
- Or persist to database

---

### 17. **No Input Sanitization for Database Queries**
**File:** `backend/src/modules/admin-applications/admin-applications.service.ts:29`  
**Severity:** Medium  
**Risk:** Prisma protects against SQL injection, but search input not sanitized

**Issue:**
```typescript
{ firstName: { contains: filters.search, mode: 'insensitive' } },
```

**Fix:**
- Prisma parameterizes queries (safe), but sanitize input anyway:
```typescript
const sanitizedSearch = filters.search?.replace(/[%_]/g, '\\$&') || '';
```

---

### 18. **Missing Environment Variable Validation**
**File:** `backend/src/index.ts`  
**Severity:** Medium  
**Risk:** Application may start with missing/invalid env vars

**Fix:**
```typescript
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  SSN_ENCRYPTION_KEY: z.string().length(44), // base64 32 bytes
  ADMIN_JWT_SECRET: z.string().min(32),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  FRONTEND_URL: z.string().url().optional(),
  PORT: z.string().regex(/^\d+$/).optional(),
});

const env = envSchema.parse(process.env);
```

---

### 19. **No 2FA Support**
**File:** `backend/src/modules/auth/auth.service.ts`  
**Severity:** Medium  
**Risk:** Single-factor authentication only

**Recommendation:**
- Implement TOTP (Time-based One-Time Password) for admin users
- Use library like `speakeasy` or `otplib`
- Store 2FA secrets encrypted in database

---

### 20. **Admin Portal Path in Client Bundle**
**File:** Multiple frontend files  
**Severity:** Medium  
**Risk:** Admin URL discoverable via source code inspection

**Recommendation:**
- Use environment variable (still visible, but better)
- Implement additional security layers (IP whitelist, 2FA)
- Consider subdomain approach

---

## Low Severity Issues

### 21. **Console.log Statements in Production Code**
**Files:** Multiple backend files  
**Severity:** Low  
**Risk:** Information leakage, performance impact

**Fix:**
- Use proper logging library (Winston, Pino)
- Remove console.log from production code
- Use log levels (error, warn, info, debug)

---

### 22. **Missing .env.example File**
**File:** Root directory  
**Severity:** Low  
**Risk:** Developers may not know required environment variables

**Fix:**
Create `.env.example` with all required variables (without values).

---

### 23. **No Security.txt File**
**File:** `public/` directory  
**Severity:** Low  
**Risk:** Security researchers cannot report vulnerabilities

**Fix:**
Create `public/.well-known/security.txt`:
```
Contact: security@glco.us
Expires: 2026-12-31T23:59:59.000Z
Preferred-Languages: en
```

---

### 24. **Weak Error Handling in Some Endpoints**
**File:** `backend/src/modules/requests/requests.controller.ts`  
**Severity:** Low  
**Risk:** Generic error messages may not help debugging

**Recommendation:**
- Improve error messages (without exposing sensitive info)
- Use error codes for client-side handling
- Log detailed errors server-side only

---

### 25. **No Request Size Limits on JSON Body**
**File:** `backend/src/index.ts:22`  
**Severity:** Low  
**Risk:** Large JSON payloads can cause DoS

**Fix:**
```typescript
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
```

---

## Backend Security Evaluation

### ✅ Strengths
1. **SSN Encryption:** Properly implemented AES-256-GCM encryption
2. **Password Hashing:** Using bcrypt with salt rounds (12)
3. **HttpOnly Cookies:** JWT stored in HttpOnly cookies
4. **Rate Limiting:** Implemented on login endpoint
5. **Input Validation:** Using Zod schemas for validation
6. **Prisma ORM:** Protects against SQL injection
7. **Error Masking:** SSN masked in error messages

### ⚠️ Weaknesses
1. **No CSRF Protection:** Missing explicit CSRF tokens
2. **Long JWT Expiration:** 7 days is too long
3. **No Audit Logging:** Sensitive operations not logged
4. **File Upload Security:** No content validation
5. **Missing Helmet:** No security headers middleware
6. **No Refresh Tokens:** Single long-lived token

---

## Frontend Security Evaluation

### ✅ Strengths
1. **Environment Variables:** Properly using NEXT_PUBLIC_ prefix
2. **Input Validation:** Client-side validation with Zod
3. **XSS Protection:** Security headers in Next.js config
4. **No SSN in Logs:** SSN properly masked in UI

### ⚠️ Weaknesses
1. **Admin URL Exposure:** Hardcoded in client bundle
2. **Password Prompt:** Using browser prompt() (insecure)
3. **dangerouslySetInnerHTML:** Used in multiple places
4. **No CSP:** Missing Content Security Policy
5. **API URL Exposure:** NEXT_PUBLIC_API_URL visible in bundle

---

## Infrastructure & DevOps Risks

### ⚠️ Missing Security Measures
1. **No HTTPS Enforcement:** Relying on deployment platform (should verify)
2. **No Firewall Rules:** Not specified in codebase
3. **No Process User Specification:** No check if running as root
4. **No Backup Strategy:** Not documented
5. **No Log Retention Policy:** Not specified

### Recommendations
1. **HTTPS:** Ensure all traffic is HTTPS (HSTS header already set)
2. **Firewall:** Configure firewall rules (outside codebase scope)
3. **Process User:** Ensure application runs as non-root user
4. **Backups:** Implement automated database backups
5. **Monitoring:** Set up security monitoring and alerting

---

## Recommended Fixes (Prioritized)

### Immediate (Critical - Fix Today)
1. ✅ Add try-catch to all JSON.parse calls
2. ✅ Implement file type validation (MIME + content)
3. ✅ Upgrade Multer to 2.x
4. ✅ Remove password prompt(), use modal only
5. ✅ Add rate limiting to driver application endpoint

### High Priority (Fix This Week)
6. ✅ Implement CSRF protection
7. ✅ Fix CORS configuration for production
8. ✅ Add audit logging for sensitive operations
9. ✅ Reduce JWT expiration to 15 minutes + refresh tokens
10. ✅ Add file content validation using file-type library
11. ✅ Implement password complexity requirements

### Medium Priority (Fix This Month)
12. ✅ Add Helmet.js security headers
13. ✅ Implement CSP headers
14. ✅ Move rate limiting to Redis (production)
15. ✅ Add environment variable validation
16. ✅ Consider 2FA implementation

### Low Priority (Nice to Have)
17. ✅ Replace console.log with proper logging
18. ✅ Create .env.example file
19. ✅ Add security.txt file
20. ✅ Improve error handling

---

## Testing Recommendations

1. **Penetration Testing:** Hire external security firm for full pen test
2. **Dependency Scanning:** Run `npm audit` regularly, use Snyk or Dependabot
3. **SAST:** Use static analysis tools (SonarQube, ESLint security plugins)
4. **DAST:** Use dynamic analysis tools (OWASP ZAP, Burp Suite)
5. **Security Headers Check:** Use securityheaders.com to verify headers

---

## Compliance Considerations

### GDPR / Privacy
- ✅ SSN encryption implemented
- ✅ Data minimization (only collecting necessary data)
- ⚠️ **Missing:** Data retention policy
- ⚠️ **Missing:** User data export/deletion endpoints

### DOT Compliance (Driver Applications)
- ✅ Secure storage of driver information
- ✅ Audit trail needed for compliance (currently missing)

---

## Conclusion

The application has a solid security foundation with proper encryption, authentication, and input validation. However, **critical vulnerabilities in file uploads and JSON parsing must be addressed immediately**. The high-priority issues around CSRF, rate limiting, and audit logging should be fixed within a week.

**Estimated Effort to Fix Critical Issues:** 4-6 hours  
**Estimated Effort to Fix High Priority Issues:** 2-3 days  
**Estimated Effort to Fix All Issues:** 1-2 weeks

---

**Report Generated:** December 6, 2025  
**Next Review Date:** January 6, 2026

