import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  specialty: { type: String, required: true, trim: true },
  bio: { type: String, default: '' },
  photoUrl: { type: String, default: '' },
  // Horarios base de atención (no equivale a disponibilidad final)
  workingDays: { type: [Number], default: [1,2,3,4,5] },
  startHour: { type: String, default: '09:00' },
  endHour: { type: String, default: '17:00' }
}, { timestamps: true });
export default mongoose.model('Doctor', schema);
