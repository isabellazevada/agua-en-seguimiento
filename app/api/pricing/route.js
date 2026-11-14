import { answer, authorize } from '../../../lib/server-auth';
import { calculatePricing, validateDecision, validatePricing, version } from '../../../lib/pricing.mjs';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const auth = await authorize(req);
  if (auth.error) return auth.error;
  const { data, error } = await auth.db.from('pricing_scenarios')
    .select('id, inputs, results, calculation_version, created_at, decisions:pricing_decisions(id, kind, date, source)')
    .eq('owner_id', auth.user.id).order('created_at', { ascending: false }).limit(100);
  if (error) return answer({ error: 'No se pudieron cargar los escenarios. Comprueba que esté instalada la migración de precios.' }, 500);
  return answer({ scenarios: data });
}

export async function POST(req) {
  const auth = await authorize(req);
  if (auth.error) return auth.error;
  if (Number(req.headers.get('content-length')) > 8192) {
    return answer({ error: 'Solicitud demasiado grande.' }, 413);
  }
  let body;
  try {
    const raw = await req.text();
    if (raw.length > 8192) return answer({ error: 'Solicitud demasiado grande.' }, 413);
    body = JSON.parse(raw);
  } catch {
    return answer({ error: 'Solicitud inválida.' }, 400);
  }

  if (body?.decision) {
    const decision = validateDecision(body.decision);
    const validId = typeof body.scenarioId === 'string' && /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(body.scenarioId);
    if (!decision || !validId) return answer({ error: 'Selecciona un evento, una fecha y una fuente válidos.' }, 400);
    const { data, error } = await auth.db.from('pricing_decisions').insert({
      ...decision, scenario_id: body.scenarioId, owner_id: auth.user.id,
    }).select('id, kind, date, source').single();
    if (error) return answer({ error: 'No se pudo registrar el evento. Comprueba que el escenario sea tuyo y que el evento no exista.' }, 400);
    return answer({ decision: data }, 201);
  }

  const { value, errors } = validatePricing(body);
  if (errors.length) return answer({ error: errors.join(' ') }, 400);
  const { data, error } = await auth.db.from('pricing_scenarios').insert({
    owner_id: auth.user.id, inputs: value, results: calculatePricing(value), calculation_version: version,
  }).select('id, inputs, results, calculation_version, created_at').single();
  if (error) return answer({ error: 'No se pudo guardar el escenario. Comprueba la configuración de precios.' }, 500);
  return answer({ scenario: { ...data, decisions: [] } }, 201);
}
