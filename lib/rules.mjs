export const labels = {reported:'Reportado',repair_pending:'Reparación pendiente',verification_pending:'Verificación pendiente',verified:'Verificado',referred:'Referido · sin resolver',reopened:'Reabierto'};
export const emptyCase = {code:'',description:'',responsible:'',next_action:'',follow_up:'',repair_note:'',repair_date:'',check_person:'',check_date:'',check_method:'',check_result:'pending',supply_suitable:false,household_result:'pending',household_date:'',household_channel:'',reopen_reason:'',status:'reported'};
export function missingEvidence(c){return [!c.repair_note?.trim()&&'Descripción de la reparación',!c.repair_date&&'Fecha de reparación',!c.check_person?.trim()&&'Persona que verificó',!c.check_date&&'Fecha de verificación',!c.check_method?.trim()&&'Método de verificación',c.check_result!=='passed'&&'Prueba de funcionamiento satisfactoria',c.supply_suitable!==true&&'Suministro adecuado durante la prueba',c.household_result!=='confirmed'&&'Confirmación del hogar',!c.household_date&&'Fecha de confirmación del hogar',!c.household_channel?.trim()&&'Canal de confirmación'].filter(Boolean);}
export function computedStatus(c,close=false){if(c.household_result==='continued')return 'reopened';if(c.status==='referred')return 'referred';if(close&&missingEvidence(c).length===0)return 'verified';if(c.repair_date||c.repair_note?.trim())return 'verification_pending';return c.status==='repair_pending'?'repair_pending':'reported';}
const limits={code:30,description:500,responsible:100,next_action:250,repair_note:1000,check_person:100,check_method:1000,household_channel:100,reopen_reason:1000};
export function validateCase(input){
 const c={...emptyCase};const errors=[];
 if(!input||typeof input!=='object'||Array.isArray(input))return {errors:['Datos de caso inválidos'],value:c};
 for(const [k,max] of Object.entries(limits)){if(input[k]!==undefined&&typeof input[k]!=='string'){errors.push('Texto inválido: '+k);continue;}c[k]=(input[k]??'').trim();if(c[k].length>max)errors.push(k+': máximo '+max+' caracteres');}
 for(const k of ['follow_up','repair_date','check_date','household_date']){const v=input[k]??'';if(typeof v!=='string'){errors.push('Fecha inválida: '+k);continue;}c[k]=v;if(v&&(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v))errors.push('Fecha inválida: '+k);}
 for(const k of ['code','description','responsible'])if(!c[k])errors.push('Campo obligatorio: '+({code:'código',description:'problema',responsible:'responsable'}[k]));
 for(const [k,allowed] of Object.entries({status:Object.keys(labels),check_result:['pending','passed','failed','inconclusive'],household_result:['pending','confirmed','continued','unreachable']})){c[k]=input[k]??emptyCase[k];if(!allowed.includes(c[k]))errors.push('Opción inválida: '+k);}
 c.supply_suitable=input.supply_suitable===true;
 if(input.supply_suitable!==undefined&&typeof input.supply_suitable!=='boolean')errors.push('Condiciones de suministro inválidas');
 if(c.household_result==='continued'&&!c.reopen_reason)errors.push('Explica por qué continúa la pérdida');
 if(c.status!=='verified'&&(!c.next_action||!c.follow_up))errors.push('Indica siguiente acción y fecha de seguimiento');
 if(c.status==='verified'&&missingEvidence(c).length)errors.push('No se puede cerrar: '+missingEvidence(c).join(', '));
 if(c.repair_date&&c.check_date&&c.check_date<c.repair_date)errors.push('La verificación no puede ser anterior a la reparación');
 if(c.repair_date&&c.household_date&&c.household_date<c.repair_date)errors.push('La confirmación no puede ser anterior a la reparación');
 const today=new Date().toISOString().slice(0,10);for(const k of ['repair_date','check_date','household_date'])if(c[k]&&c[k]>today)errors.push('La evidencia no puede tener fecha futura: '+k);
 return {errors,value:c};
}
