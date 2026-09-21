import { Router } from "express";
import Service from "../models/Service.js";
import Referral from "../models/Referral.js";
import { auth, allow } from "../middleware/auth.js";

const r = Router();
r.get("/", async (_req, res) => res.json({ success: true, services: await Service.find().sort({ price: 1 }) }));
r.post("/", auth, allow("admin"), async (req, res) => res.status(201).json({ success: true, service: await Service.create(req.body) }));

r.post("/:id/purchase", auth, allow("customer"), async (req, res) => {
  const s = await Service.findById(req.params.id);
  if (!s) return res.status(404).json({ success: false, message: "Service not found" });
  const x = await Referral.findOne({ customer: req.user._id, status: { $in: ["registered", "purchased"] } }).sort({ createdAt: -1 });
  if (!x) return res.status(400).json({ success: false, message: "No referral attribution found for this customer." });
  if (x.status === "purchased") return res.status(400).json({ success: false, message: "This demo customer already has a purchase recorded." });

  const rate = Number(process.env.COMMISSION_RATE || 10);
  x.service = s._id;
  x.purchaseAmount = s.price;
  x.commissionRate = rate;
  x.commissionAmount = Number((s.price * rate / 100).toFixed(2));
  x.status = "purchased";
  await x.save();

  res.json({ success: true, message: "Demo purchase recorded", commission: { rate, amount: x.commissionAmount, status: x.commissionStatus } });
});
export default r;
