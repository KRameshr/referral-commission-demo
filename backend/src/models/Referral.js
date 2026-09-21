import mongoose from "mongoose";
const schema=new mongoose.Schema({
 referrer:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 customer:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 referralCode:{type:String,required:true,index:true},
 status:{type:String,enum:["clicked","registered","purchased"],default:"clicked"},
 service:{type:mongoose.Schema.Types.ObjectId,ref:"Service",default:null},
 purchaseAmount:{type:Number,default:0},commissionRate:{type:Number,default:10},
 commissionAmount:{type:Number,default:0},
 commissionStatus:{type:String,enum:["pending","approved","paid"],default:"pending"}
},{timestamps:true});
export default mongoose.model("Referral",schema);
