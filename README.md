# Referral Commission Demo

Standalone proof-of-concept for the client referral requirement.

## Client demo flow
1. A (Owner/Admin) logs in and monitors the dashboard.
2. B (Referrer) logs in and gets a unique referral link.
3. B shares `/?ref=REF001` with C.
4. C registers through the referral link.
5. C logs in and purchases a demo service.
6. The backend records the purchase and calculates the configured commission (10% by default).
7. A refreshes the Admin dashboard and sees the complete referral activity.

## Demo accounts
- Admin: `admin@example.com` / `Admin@123`
- Referrer: `referrer@example.com` / `Referrer@123`
- Referrer code after seed: `REF001`

## Demo services
- Skillwise Demo Service — ₹10,000
- ACCA Demo Service — ₹25,000

## Run
### Backend
```powershell
cd backend
npm install
copy .env.example .env
# put your MongoDB Atlas URI in .env as MONGO_URI
npm run seed
npm run dev
```

### Frontend (new terminal)
```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Configuration
`COMMISSION_RATE=10` is in `backend/.env`. Change it later when the client changes the commission percentage.

This is a demo/proof-of-concept, not a production payment system. Purchases are simulated; no real payment gateway is connected.
