import mongoose from 'mongoose';
const schema = new mongoose.Schema({
 name:{type:String,required:true,trim:true,maxlength:100},
 address:{type:String,required:true,trim:true,maxlength:250},
 district:{type:String,default:'',trim:true,maxlength:100},
 latitude:{type:Number,min:-90,max:90},longitude:{type:Number,min:-180,max:180},
 isActive:{type:Boolean,default:true},
 services:{type:[String],default:[]}
},{timestamps:true});
export default mongoose.model('ClinicSite',schema);
