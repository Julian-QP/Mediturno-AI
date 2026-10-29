import User from '../models/User.js';
// Revalidación contra MongoDB en endpoints privilegiados (evita roles JWT obsoletos).
export const authorizeDb = (...roles) => async (req,res,next) => {
  try {
    const user = await User.findById(req.user?.id).select('role isActive');
    if (!user || user.isActive === false) return res.status(403).json({message:'Cuenta deshabilitada o inexistente'});
    if (!roles.includes(user.role)) return res.status(403).json({message:'Acceso denegado para este rol'});
    req.currentUser = user;
    next();
  } catch(nextError){ next(nextError); }
};
