import { createClient } from '@supabase/supabase-js';
export const answer=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function authorize(req){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 const token=req.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
 if(!token)return {error:answer({error:'Inicia sesión para acceder.'},401)};
 if(!url||!key)return {error:answer({error:'Supabase aún no está configurado.'},503)};
 const db=createClient(url,key,{global:{headers:{Authorization:'Bearer '+token}},auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await db.auth.getUser(token);if(error||!data.user)return {error:answer({error:'Sesión inválida. Vuelve a iniciar sesión.'},401)};
 return {db,user:data.user};
}
