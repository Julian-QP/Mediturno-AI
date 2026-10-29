import mongoose from 'mongoose';
const cancellationSchema = new mongoose.Schema({
 status: {type:String,enum:['none','pending','approved','rejected'],default:'none'},
 reason: {type:String,default:'',maxlength:500},
 requestedAt: Date,
 reviewedAt: Date,
 reviewedBy: {type:mongoose.Schema.Types.ObjectId,ref:'User'},
 reviewNote: {type:String,default:'',maxlength:500}
},{_id:false});
const schema=new mongoose.Schema({
 doctor:{type:mongoose.Schema.Types.ObjectId,ref:'Doctor',required:true},
 patient:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
 site:{type:mongoose.Schema.Types.ObjectId,ref:'ClinicSite',default:null},
 startsAt:{type:Date,required:true},
 status:{type:String,enum:['reserved','cancelled','completed'],default:'reserved'},
 visitType:{type:String,enum:['initial','followup','single'],default:'initial'},
 careType:{type:String,enum:['general','specialized','test','control'],default:'general'},
 reason:{type:String,default:'',maxlength:600},
 locationName:{type:String,default:'Sede por confirmar',maxlength:120},
 cancellation:{type:cancellationSchema,default:()=>({status:'none'})}
},{timestamps:true});
schema.index({doctor:1,startsAt:1},{unique:true,partialFilterExpression:{status:'reserved'}});
export default mongoose.model('Appointment',schema);
