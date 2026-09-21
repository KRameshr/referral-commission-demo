import { Router } from "express";
import Referral from "../models/Referral.js";
import { auth, allow } from "../middleware/auth.js";
const r = Router();
r.get("/referrals", auth, allow("admin"), async (_req, res) => {
  const rows = await Referral.find().populate("referrer", "name email referralCode").populate("customer", "name email").populate("service", "name price").sort({ createdAt: -1 });
  const summary = rows.reduce((a, x) => { a.clicks++; if (x.customer) a.registrations++; if (x.status === "purchased") a.purchases++; a.revenue += x.purchaseAmount; a.commission += x.commissionAmount; return a; }, { clicks: 0, registrations: 0, purchases: 0, revenue: 0, commission: 0 });
  res.json({ success: true, summary, referrals: rows });
});
export default r;
