import mongoose from 'mongoose';
const schema=new mongoose.Schema({
 appointment:{type:mongoose.Schema.Types.ObjectId,ref:'Appointment',required:true,index:true},
 doctor:{type:mongoose.Schema.Types.ObjectId,ref:'Doctor',required:true,index:true},
 patient:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
 title:{type:String,required:true,trim:true,maxlength:160},
 patientInstructions:{type:String,default:'',maxlength:1200},
 status:{type:String,enum:['requested','scheduled','received','reviewed'],default:'requested'},
 requestedAt:{type:Date,default:Date.now}
},{timestamps:true});
export default mongoose.model('ExamOrder',schema);
