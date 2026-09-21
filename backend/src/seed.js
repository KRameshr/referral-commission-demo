import "dotenv/config";import mongoose from "mongoose";import bcrypt from "bcryptjs";import User from "./models/User.js";import Service from "./models/Service.js";
await mongoose.connect(process.env.MONGO_URI);await User.deleteMany({});await Service.deleteMany({});
await User.create({name:"Demo Admin",email:"admin@example.com",password:await bcrypt.hash("Admin@123",10),role:"admin"});
await User.create({name:"Demo Referrer",email:"referrer@example.com",password:await bcrypt.hash("Referrer@123",10),role:"referrer",referralCode:"REF001"});
await Service.create([{name:"Skillwise Demo Service",description:"Demo service for referral testing",price:10000},{name:"ACCA Demo Service",description:"Demo course/service",price:25000}]);
console.log("Seed complete");await mongoose.disconnect();
