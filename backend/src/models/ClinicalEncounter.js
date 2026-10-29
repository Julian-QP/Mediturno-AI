import mongoose from 'mongoose';
const schema=new mongoose.Schema({
 appointment:{type:mongoose.Schema.Types.ObjectId,ref:'Appointment',required:true,unique:true},
 doctor:{type:mongoose.Schema.Types.ObjectId,ref:'Doctor',required:true,index:true},
 patient:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
 status:{type:String,enum:['in_progress','completed'],default:'in_progress'},
 privateNotes:{type:String,default:'',maxlength:8000},
 publicInstructions:{type:String,default:'',maxlength:1500},
 startedAt:{type:Date,default:Date.now},completedAt:Date
},{timestamps:true});
export default mongoose.model('ClinicalEncounter',schema);
