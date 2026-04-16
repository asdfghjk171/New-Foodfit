# HealthFit Test Credentials

## Authentication
- **Type**: localStorage-based (simulated - no real backend)
- **Signup**: Any name, valid email, password (min 6 chars)
- **Login**: Uses credentials stored in browser's localStorage `users` array

## Test Accounts
- Sign up with any email/password. Example:
  - Email: test@healthfit.com
  - Password: test123456
  - Name: Test User

## Notes
- Credentials persist only in the same browser (localStorage)
- Each new browser/incognito session requires fresh signup
- No external authentication service used
