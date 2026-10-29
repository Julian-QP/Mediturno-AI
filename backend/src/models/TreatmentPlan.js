import mongoose from 'mongoose';
const schema=new mongoose.Schema({
 doctor:{type:mongoose.Schema.Types.ObjectId,ref:'Doctor',required:true,index:true},
 patient:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
 title:{type:String,required:true,trim:true,maxlength:120},
 status:{type:String,enum:['active','closed'],default:'active'},
 appointmentIds:[{type:mongoose.Schema.Types.ObjectId,ref:'Appointment'}],
 createdAt:{type:Date,default:Date.now}
},{timestamps:true});
export default mongoose.model('TreatmentPlan',schema);
