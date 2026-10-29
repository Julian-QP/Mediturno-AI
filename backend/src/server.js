import 'dotenv/config';
import app from './app.js';
import {connectDB} from './config/database.js';
async function main(){
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length<32) throw new Error('Configura JWT_SECRET con mínimo 32 caracteres');
  await connectDB();
  const port=Number(process.env.PORT)||3000;
  app.listen(port,()=>console.log(`MediTurno API en http://localhost:${port}`));
}
main().catch(e=>{console.error('No se pudo iniciar:',e.message);process.exit(1);});
