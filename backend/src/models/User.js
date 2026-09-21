import mongoose from "mongoose";
const schema=new mongoose.Schema({
 name:{type:String,required:true},email:{type:String,required:true,unique:true,lowercase:true},
 password:{type:String,required:true},role:{type:String,enum:["admin","referrer","customer"],default:"customer"},
 referralCode:{type:String,unique:true,sparse:true},referredBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true});
export default mongoose.model("User",schema);
