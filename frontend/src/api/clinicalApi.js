import {request} from './client.js';
const base='/clinical';
export const getClinicalDetails=id=>request(`${base}/doctor/appointments/${encodeURIComponent(id)}`);
export const startClinicalCare=id=>request(`${base}/doctor/appointments/${encodeURIComponent(id)}/start`,{method:'POST'});
export const saveClinicalNotes=(id,body)=>request(`${base}/doctor/appointments/${encodeURIComponent(id)}/notes`,{method:'PATCH',body});
export const finishClinicalCare=id=>request(`${base}/doctor/appointments/${encodeURIComponent(id)}/finish`,{method:'POST'});
export const createTreatmentPlan=(id,title)=>request(`${base}/doctor/appointments/${encodeURIComponent(id)}/treatments`,{method:'POST',body:{title}});
export const linkTreatmentPlan=(id,planId)=>request(`${base}/doctor/appointments/${encodeURIComponent(id)}/treatments/${encodeURIComponent(planId)}/link`,{method:'POST'});
export const createExamOrder=(id,body)=>request(`${base}/doctor/appointments/${encodeURIComponent(id)}/exams`,{method:'POST',body});
export const getDoctorClinicalList=()=>request(`${base}/doctor`);
export const getPatientClinicalList=()=>request(`${base}/patient`);

export const getPatientCareRecords=()=>request(`${base}/patient/care-records`);
export const editExamOrder=(appointmentId,examId,body)=>request(`${base}/doctor/appointments/${encodeURIComponent(appointmentId)}/exams/${encodeURIComponent(examId)}`,{method:'PATCH',body});
export const removeExamOrder=(appointmentId,examId)=>request(`${base}/doctor/appointments/${encodeURIComponent(appointmentId)}/exams/${encodeURIComponent(examId)}`,{method:'DELETE'});
export const removeTreatmentPlan=(appointmentId,planId)=>request(`${base}/doctor/appointments/${encodeURIComponent(appointmentId)}/treatments/${encodeURIComponent(planId)}`,{method:'DELETE'});
export const bookFollowupAppointment=(appointmentId,body)=>request(`${base}/doctor/appointments/${encodeURIComponent(appointmentId)}/followup-appointments`,{method:'POST',body});
