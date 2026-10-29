import mongoose from 'mongoose';
const schema=new mongoose.Schema({site:{type:mongoose.Schema.Types.ObjectId,ref:'ClinicSite',required:true,index:true},examType:{type:String,required:true,trim:true,maxlength:160},startsAt:{type:Date,required:true,index:true},capacity:{type:Number,min:1,max:100,required:true},booked:{type:Number,min:0,default:0},isActive:{type:Boolean,default:true}}, {timestamps:true});
schema.index({site:1,examType:1,startsAt:1},{unique:true});
export default mongoose.model('LabSlot73',schema);
