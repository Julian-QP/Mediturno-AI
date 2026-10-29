import mongoose from 'mongoose';
const auditSchema=new mongoose.Schema({action:{type:String,enum:['rescheduled','cancelled'],required:true},by:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},previousSlot:{type:mongoose.Schema.Types.ObjectId,ref:'LabSlot73'},newSlot:{type:mongoose.Schema.Types.ObjectId,ref:'LabSlot73'},at:{type:Date,default:Date.now}},{_id:false});
const schema=new mongoose.Schema({
 order:{type:mongoose.Schema.Types.ObjectId,ref:'ExamOrder',required:true,unique:true},
 slot:{type:mongoose.Schema.Types.ObjectId,ref:'LabSlot73',required:true,index:true},
 patient:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
 doctor:{type:mongoose.Schema.Types.ObjectId,ref:'Doctor',required:true,index:true},
 status:{type:String,enum:['scheduled','result_received','reviewed','cancelled'],default:'scheduled'},
 resultText:{type:String,default:'',maxlength:5000},
 resultRecordedAt:Date,reviewedAt:Date,reviewedBy:{type:mongoose.Schema.Types.ObjectId,ref:'Doctor'},
 scheduledAt:{type:Date,default:Date.now},cancelledAt:Date,
 changeHistory:{type:[auditSchema],default:[]}
},{timestamps:true});
export default mongoose.model('LabBooking73',schema);
