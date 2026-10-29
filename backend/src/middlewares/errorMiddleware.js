export function errorHandler(err,req,res,next) {
  console.error(err);
  if (err.code === 11000) return res.status(409).json({ message:'El registro ya existe o el horario está ocupado' });
  if (err.name === 'CastError') return res.status(400).json({ message:'Identificador inválido' });
  res.status(500).json({ message:'Error interno del servidor' });
}
