import { createClient } from '@supabase/supabase-js';
import { validateCase } from '../../../lib/rules.mjs';
export const dynamic='force-dynamic';
const answer=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
async function authorize(req){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return {error:answer({error:'Supabase aún no está configurado.'},503)};
 const token=req.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
 if(!token)return {error:answer({error:'Inicia sesión para acceder.'},401)};
 const db=createClient(url,key,{global:{headers:{Authorization:'Bearer '+token}},auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await db.auth.getUser(token);if(error||!data.user)return {error:answer({error:'Sesión inválida. Vuelve a iniciar sesión.'},401)};
 return {db,user:data.user};
}
export async function GET(req){const a=await authorize(req);if(a.error)return a.error;const {data,error}=await a.db.from('cases').select('*').eq('owner_id',a.user.id).order('updated_at',{ascending:false});return error?answer({error:'No se pudieron cargar los casos. Revisa la configuración de la base de datos.'},500):answer({cases:data});}
export async function POST(req){
 const a=await authorize(req);if(a.error)return a.error;
 if(Number(req.headers.get('content-length')||0)>24000)return answer({error:'Solicitud demasiado grande.'},413);
 let payload;try{const raw=await req.text();if(raw.length>24000)return answer({error:'Solicitud demasiado grande.'},413);payload=JSON.parse(raw);}catch{return answer({error:'Solicitud inválida.'},400);}
 if(!payload||typeof payload!=='object')return answer({error:'Solicitud inválida.'},400);
 const {value,errors}=validateCase(payload);if(errors.length)return answer({error:errors.join(' · ')},400);
 const row={...value,owner_id:a.user.id};for(const k of ['follow_up','repair_date','check_date','household_date'])row[k]=row[k]||null;
 let result;
 if(payload.id){if(!/^[0-9a-f-]{36}$/i.test(payload.id))return answer({error:'Identificador inválido.'},400);result=await a.db.from('cases').update(row).eq('id',payload.id).eq('owner_id',a.user.id).select().single();}
 else result=await a.db.from('cases').insert(row).select().single();
 if(result.error)return answer({error:result.error.code==='23505'?'Ese código de caso ya existe.': 'No se guardó el caso. Revisa los datos y la configuración de Supabase.'},400);
 return answer({case:result.data});
}
