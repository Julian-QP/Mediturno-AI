import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  appointment: {type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', unique:true, required:true},
  doctor: {type: mongoose.Schema.Types.ObjectId, ref:'Doctor',required:true},
  patient: {type: mongoose.Schema.Types.ObjectId, ref:'User',required:true},
  doctorConsent: {type:Boolean,required:true},
  patientConsent: {type:Boolean,required:true},
  consentRecordedAt: {type:Date,required:true},
  consentMethod: {type:String,default:'Confirmación presencial registrada por el médico'},
  status: {type:String,enum:['consented','recording','completed','failed'],default:'consented'},
  startedAt:Date, stoppedAt:Date,
  transcript:{type:String,default:'',maxlength:45000},
  mimeType:String, fileName:String, audioBytes:Number
},{timestamps:true});
export default mongoose.model('LiveRecording',schema);
