import mongoose from 'mongoose';
const consultationNoteSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  consent: {
    patientAccepted: { type: Boolean, default: false },
    doctorAccepted: { type: Boolean, default: false },
    recordedAt: { type: Date, default: null }
  },
  transcript: { type: String, default: '', select: false },
  segments: [{ speaker: String, startMs: Number, endMs: Number, text: String }],
  summaryDraft: { type: String, default: '', select: false },
  approvedSummary: { type: String, default: '', select: false },
  status: { type: String, enum: ['pending', 'draft', 'approved'], default: 'pending' },
  approvedAt: { type: Date, default: null },
  drive: { fileId: String, ownerGoogleSub: String },
  transcriptionProvider: { type: String, enum: ['assemblyai','whisper','none'], default: 'none' },
  summarizationProvider: { type: String, enum: ['gemini','ollama','none'], default: 'none' }
}, { timestamps: true });
export default mongoose.model('ConsultationNote', consultationNoteSchema);
