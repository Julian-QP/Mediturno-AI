import mongoose from 'mongoose';
const schema=new mongoose.Schema({
 name:{type:String,required:true,trim:true,minlength:3,maxlength:160,unique:true},
 description:{type:String,default:'',trim:true,maxlength:700},
 preparation:{type:String,default:'',trim:true,maxlength:1200},
 durationMinutes:{type:Number,default:30,min:5,max:480},
 isActive:{type:Boolean,default:true}
},{timestamps:true});
export default mongoose.model('LabExamCatalog74',schema);
