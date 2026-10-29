import mongoose from 'mongoose';
const schema=new mongoose.Schema({
 site:{type:mongoose.Schema.Types.ObjectId,ref:'ClinicSite',required:true},
 doctor:{type:mongoose.Schema.Types.ObjectId,ref:'Doctor',default:null},
 date:{type:String,required:true},
 startHour:{type:String,required:true,default:'00:00'},
 endHour:{type:String,required:true,default:'23:59'},
 reason:{type:String,required:true,trim:true,maxlength:250},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}
},{timestamps:true});
schema.index({site:1,date:1});
export default mongoose.model('AvailabilityBlock',schema);
