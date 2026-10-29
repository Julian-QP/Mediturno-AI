import mongoose from 'mongoose';
const schema=new mongoose.Schema({
 doctor:{type:mongoose.Schema.Types.ObjectId,ref:'Doctor',required:true},
 site:{type:mongoose.Schema.Types.ObjectId,ref:'ClinicSite',required:true},
 weekday:{type:Number,required:true,min:0,max:6}, // 0=domingo
 startHour:{type:String,required:true},endHour:{type:String,required:true},
 slotMinutes:{type:Number,enum:[30],default:30},
 isActive:{type:Boolean,default:true}
},{timestamps:true});
schema.index({doctor:1,site:1,weekday:1,startHour:1,endHour:1},{unique:true});
export default mongoose.model('DoctorShift',schema);
