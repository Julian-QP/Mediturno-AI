import mongoose from 'mongoose';
const schema=new mongoose.Schema({
 title:{type:String,required:true,trim:true,maxlength:120},
 message:{type:String,required:true,trim:true,maxlength:1200},
 category:{type:String,required:true,enum:['informative','urgent','suspension']},
 audience:{type:String,required:true,enum:['all','patients','doctors'],default:'all'},
 validFrom:{type:Date,required:true},
 validUntil:{type:Date,required:true},
 site:{type:mongoose.Schema.Types.ObjectId,ref:'ClinicSite',default:null},
 block:{type:mongoose.Schema.Types.ObjectId,ref:'AvailabilityBlock',default:null},
 publishedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
 isActive:{type:Boolean,default:true}
},{timestamps:true});
schema.index({validFrom:1,validUntil:1,isActive:1});
export default mongoose.model('Announcement',schema);
