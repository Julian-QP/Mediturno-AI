import mongoose from 'mongoose';
const schema=new mongoose.Schema({
 site:{type:mongoose.Schema.Types.ObjectId,ref:'ClinicSite',required:true,index:true},
 name:{type:String,trim:true,required:true,maxlength:90},
 floor:{type:String,trim:true,default:'',maxlength:60},
 isActive:{type:Boolean,default:true},
 doctor:{type:mongoose.Schema.Types.ObjectId,ref:'Doctor',default:null},
 notes:{type:String,trim:true,default:'',maxlength:300}
},{timestamps:true});
schema.index({site:1,name:1},{unique:true});
export default mongoose.models.Consultorio72||mongoose.model('Consultorio72',schema);
