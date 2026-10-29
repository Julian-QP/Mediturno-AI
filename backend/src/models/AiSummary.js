import mongoose from 'mongoose';
const schema=new mongoose.Schema({
 appointment:{type:mongoose.Schema.Types.ObjectId,ref:'Appointment',unique:true,required:true},
 doctor:{type:mongoose.Schema.Types.ObjectId,ref:'Doctor',required:true,index:true},
 patient:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
 consentAt:{type:Date,required:true},transcript:{type:String,default:'',maxlength:45000},
 draft:{type:String,default:'',maxlength:18000},approvedText:{type:String,default:'',maxlength:18000},
 status:{type:String,enum:['transcribed','draft','approved'],default:'transcribed'},
 approvedAt:Date,approvedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},pdfDriveFileId:String,
 pdfDriveName:String
},{timestamps:true});
export default mongoose.model('AiSummary',schema);
