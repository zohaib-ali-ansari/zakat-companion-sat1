# Zakat Companion Backend

This backend provides the initial MongoDB Atlas authentication flow for the Zakat Companion app.

## Setup

1. Copy `.env.example` to `.env`
2. Fill in your MongoDB Atlas connection string
3. Set a JWT secret
4. Add SMTP credentials for OTP emails (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`)
5. Install dependencies:

```bash
npm install
```

5. Start the server:

```bash
npm run dev
```

## Endpoints

### Register

POST `/api/auth/register`

Body:
```json
{
  "name": "Ali",
  "email": "ali@example.com",
  "password": "123456"
}
```

This sends a 6-digit OTP to the user's email before completing registration.

### Forgot Password

POST `/api/auth/forgot-password`

Body:
```json
{
  "email": "ali@example.com"
}
```

This sends a 6-digit OTP to the user's email for password reset.

### Login

POST `/api/auth/login`

Body:
```json
{
  "email": "ali@example.com",
  "password": "123456"
}
```

### Health

GET `/api/health`

## Notes

- MongoDB Atlas connection string is required.
- JWT is used for login sessions.
- Add more routes later for assets, payment history, and live market pricing.
