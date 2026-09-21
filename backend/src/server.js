import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.routes.js";
import referralRoutes from "./routes/referral.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app=express();
app.use(cors({origin:process.env.FRONTEND_URL||"http://localhost:5173"}));
app.use(express.json());
app.get("/api/health",(_req,res)=>res.json({success:true,message:"API is running"}));
app.use("/api/auth",authRoutes);
app.use("/api/referrals",referralRoutes);
app.use("/api/services",serviceRoutes);
app.use("/api/admin",adminRoutes);
const PORT=process.env.PORT||5000;
mongoose.connect(process.env.MONGO_URI).then(()=>app.listen(PORT,()=>console.log(`API: http://localhost:${PORT}`))).catch(e=>{console.error(e.message);process.exit(1)});
