import { Router } from "express";
import Referral from "../models/Referral.js";
import User from "../models/User.js";
import { auth, allow } from "../middleware/auth.js";

const r = Router();

r.post("/track", async (req, res) => {
  const code = String(req.body.referralCode || "").toUpperCase();
  const ref = await User.findOne({ referralCode: code, role: "referrer" });
  if (!ref) return res.status(404).json({ success: false, message: "Referral code not found" });
  const x = await Referral.create({ referrer: ref._id, referralCode: ref.referralCode, status: "clicked" });
  res.status(201).json({ success: true, referralId: x._id });
});

r.get("/me", auth, allow("referrer"), async (req, res) => {
  const rows = await Referral.find({ referrer: req.user._id }).populate("customer", "name email").populate("service", "name price").sort({ createdAt: -1 });
  const totals = rows.reduce((a, x) => {
    a.clicks++;
    if (x.customer) a.registrations++;
    if (x.status === "purchased") a.purchases++;
    a.commission += x.commissionAmount;
    return a;
  }, { clicks: 0, registrations: 0, purchases: 0, commission: 0 });
  res.json({ success: true, totals, referrals: rows });
});

export default r;
