export const plans = {
  free: { label: 'Free', monthlyCents: 0, capacity: 5 },
  site: { label: 'Site', monthlyCents: 49000, capacity: 25 },
  program: { label: 'Program', monthlyCents: 149000, capacity: 100 },
};

export const version = 1;
export const pilotSignals = {
  quote: 'Cotización solicitada',
  approval: 'Aprobación por escrito',
  payment: 'Pago recibido',
  renewal: 'Renovación',
};
export const example = {
  name: 'Piloto de ejemplo', plan: 'site', cases: 5, period: '2026-11',
  evidence: 'simulated',
  adminBaseline: 120, adminPlan: 60, adminRate: 200,
  coordBaseline: 60, coordPlan: 105, coordRate: 200,
  setupMinutes: 0, oneTimeCharges: 0, recurringCharges: 0,
  otherBenefit: 0, otherSource: '',
  providerMinutes: 0, providerRate: 0, providerCosts: 0,
};

export const numberFields = {
  cases: ['Casos comparados', 1, 100, 1],
  adminBaseline: ['Administración en WhatsApp + Excel', 0, 60000, 1],
  adminPlan: ['Administración con el plan', 0, 60000, 1],
  adminRate: ['Costo por hora de administración', 0, 100000, 0.01],
  coordBaseline: ['Coordinación en WhatsApp + Excel', 0, 60000, 1],
  coordPlan: ['Coordinación con el plan', 0, 60000, 1],
  coordRate: ['Costo por hora de coordinación', 0, 100000, 0.01],
  setupMinutes: ['Configuración del lado del comprador (min)', 0, 60000, 1],
  oneTimeCharges: ['Cargos únicos aprobados (MXN)', 0, 1000000, 0.01],
  recurringCharges: ['Cargos mensuales adicionales (MXN)', 0, 1000000, 0.01],
  otherBenefit: ['Otro beneficio comprobable (MXN)', 0, 1000000, 0.01],
  providerMinutes: ['Preparación, soporte y reintentos (min)', 0, 60000, 1],
  providerRate: ['Costo de entrega por hora (MXN)', 0, 100000, 0.01],
  providerCosts: ['Otros costos de entrega (MXN)', 0, 1000000, 0.01],
};

const cents = value => Math.round(value * 100);
const validMonth = value => typeof value === 'string' && /^20\d\d-(0[1-9]|1[0-2])$/.test(value);

export function validatePricing(input) {
  const source = input ?? {};
  const name = typeof source.name === 'string' ? source.name.trim() : '';
  const otherSource = typeof source.otherSource === 'string' ? source.otherSource.trim() : '';
  const { plan, period, evidence } = source;
  const errors = [];
  const value = { name, plan, period, evidence, otherSource };
  if (!name || name.length > 60) errors.push('Escribe un nombre de 1 a 60 caracteres.');
  if (!Object.hasOwn(plans, plan)) errors.push('Selecciona un plan válido.');
  if (!validMonth(period)) errors.push('Selecciona un mes válido para ambos métodos.');
  if (!['simulated', 'measured'].includes(evidence)) errors.push('Selecciona el origen de los datos.');
  for (const [key, [label, min, max, step]] of Object.entries(numberFields)) {
    const raw = source[key];
    const numeric = typeof raw === 'number' || (typeof raw === 'string' && /^\d+(\.\d{1,2})?$/.test(raw));
    const n = numeric ? Number(raw) : NaN;
    const rounded = step === 1 ? Math.round(n) : cents(n) / 100;
    if (!Number.isFinite(n) || n !== rounded || n < min || n > max) {
      errors.push(`${label}: ingresa un valor entre ${min} y ${max} con la precisión indicada.`);
    }
    value[key] = n;
  }
  if (Object.hasOwn(plans, plan) && value.cases > plans[plan].capacity) {
    errors.push(`El plan ${plans[plan].label} admite hasta ${plans[plan].capacity} casos activos para esta comparación.`);
  }
  if (otherSource.length > 160 || (value.otherBenefit > 0 && !otherSource)) {
    errors.push('Indica la fuente del beneficio adicional en hasta 160 caracteres.');
  }
  return { value, errors };
}

export function calculatePricing(input) {
  const labor = (minutes, hourly) => Math.sign(minutes) * Math.round(Math.abs(minutes) * cents(hourly) / 60);
  const laborValue = labor(input.adminBaseline - input.adminPlan, input.adminRate)
    + labor(input.coordBaseline - input.coordPlan, input.coordRate);
  const benefit = laborValue + cents(input.otherBenefit);
  const monthlyFee = plans[input.plan].monthlyCents;
  const recurringCost = monthlyFee + cents(input.recurringCharges);
  const cost = recurringCost + labor(input.setupMinutes, input.coordRate) + cents(input.oneTimeCharges);
  const providerCost = labor(input.providerMinutes, input.providerRate) + cents(input.providerCosts);
  return {
    laborValue, benefit, monthlyFee, cost, recurringCost, providerCost,
    balance: benefit - cost,
    recurringBalance: benefit - recurringCost,
    providerContribution: monthlyFee - providerCost,
    ratio: cost === 0 ? null : benefit / cost,
  };
}

export function validateDecision(input) {
  const { kind, date, source } = input ?? {};
  const parsed = typeof date === 'string' && /^20\d{2}-\d{2}-\d{2}$/.test(date) ? new Date(date) : null;
  if (!Object.hasOwn(pilotSignals, kind) || !parsed || Number.isNaN(parsed.getTime())
    || parsed.toISOString().slice(0, 10) !== date
    || !['simulated', 'whatsapp', 'email', 'meeting', 'receipt'].includes(source)) return null;
  return { kind, date, source };
}
