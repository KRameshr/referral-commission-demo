import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Referral from "../models/Referral.js";

const r = Router();
const code = () => `REF${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
const safeUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role, referralCode: u.referralCode });

r.post("/register", async (req, res) => {
  try {
    const { name, email, password, role = "customer", referralCode } = req.body;
    if (role !== "customer") return res.status(400).json({ success: false, message: "Only customer registration is enabled in this demo." });
    if (!name || !email || !password) return res.status(400).json({ success: false, message: "Name, email and password are required" });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ success: false, message: "Email already registered" });

    let referrer = null;
    if (referralCode) referrer = await User.findOne({ referralCode: referralCode.toUpperCase(), role: "referrer" });
    if (referralCode && !referrer) return res.status(400).json({ success: false, message: "Invalid referral code" });

    const u = await User.create({
      name, email: email.toLowerCase(), password: await bcrypt.hash(password, 10), role: "customer",
      referredBy: referrer?._id || null,
    });

    if (referrer) {
      const click = await Referral.findOne({ referrer: referrer._id, referralCode: referrer.referralCode, customer: null }).sort({ createdAt: -1 });
      if (click) { click.customer = u._id; click.status = "registered"; await click.save(); }
      else await Referral.create({ referrer: referrer._id, customer: u._id, referralCode: referrer.referralCode, status: "registered" });
    }

    res.status(201).json({ success: true, message: "Customer registered successfully", user: safeUser(u) });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

r.post("/login", async (req, res) => {
  const u = await User.findOne({ email: String(req.body.email || "").toLowerCase() });
  if (!u || !(await bcrypt.compare(req.body.password || "", u.password))) return res.status(401).json({ success: false, message: "Invalid email or password" });
  const token = jwt.sign({ userId: u._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ success: true, token, user: safeUser(u) });
});

export default r;
