import Doctor from '../models/Doctor.js';
export async function listDoctors(req,res) {
  const doctors = await Doctor.find().populate('user','name role isActive').sort({specialty:1});
  res.json(doctors.filter(d=>d.user?.role==='doctor' && d.user?.isActive!==false).map(d=>({id:d._id,name:d.user?.name,specialty:d.specialty,bio:d.bio,photoUrl:d.photoUrl,workingDays:d.workingDays,startHour:d.startHour,endHour:d.endHour})));
}
