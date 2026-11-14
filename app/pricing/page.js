'use client';

import { useEffect, useState } from 'react';
import { getBrowserClient } from '../../lib/supabase';
import { calculatePricing, example, numberFields, pilotSignals, plans, validateDecision, validatePricing, version } from '../../lib/pricing.mjs';
import './pricing.css';

const mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const money = cents => mxn.format(cents / 100);
const ratioText = ratio => ratio === null ? 'No calculable' : ratio.toFixed(2) + '×';
const sources = { simulated: 'Simulado', whatsapp: 'WhatsApp', email: 'Correo', meeting: 'Reunión', receipt: 'Comprobante' };
const emptyDecision = { kind: 'quote', date: '', source: 'simulated' };
const sampleRow = { id: 'example', inputs: example, results: calculatePricing(example), calculation_version: version, decisions: [] };

export default function Pricing() {
  const [session, setSession] = useState(null);
  const db = getBrowserClient();
  useEffect(() => {
    if (!db) return;
    const { data } = db.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, [db]);

  return <PricingWorkspace key={session?.user.id ?? 'demo'} db={db} owner={session?.user.id} />;
}

function PricingWorkspace({ db, owner }) {
  const [form, setForm] = useState(example);
  const [rows, setRows] = useState([]);
  const [opened, setOpened] = useState(null);
  const [decision, setDecision] = useState(emptyDecision);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const pricing = validatePricing(form);
  const result = opened?.results ?? (pricing.errors.length ? null : calculatePricing(pricing.value));

  useEffect(() => {
    if (!owner) return;
    const controller = new AbortController();
    async function load() {
      try {
        setRows((await request(db, undefined, controller.signal)).scenarios);
      } catch (failure) {
        if (!controller.signal.aborted) setError(failure.message);
      }
    }
    load();
    return () => controller.abort();
  }, [db, owner]);

  function change(key, value) {
    setForm(previous => ({ ...previous, [key]: value }));
    setOpened(null);
    setNotice('');
    setError('');
  }

  function open(row) {
    setForm(row.inputs);
    setOpened(row);
    setDecision(emptyDecision);
    setError('');
    setNotice(`Escenario abierto: ${row.inputs.name}.`);
  }

  async function act(action) {
    setBusy(true);
    setNotice('');
    setError('');
    try {
      await action();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  function save(event) {
    event.preventDefault();
    if (pricing.errors.length) {
      setError(pricing.errors[0]);
      return;
    }
    act(async () => {
      if (owner) {
        const { scenario } = await request(db, pricing.value);
        setRows(previous => [scenario, ...previous]);
        open(scenario);
        setNotice('Escenario guardado en tu cuenta.');
      } else {
        const scenario = {
          id: crypto.randomUUID(), inputs: { ...pricing.value, evidence: 'simulated' },
          results: calculatePricing(pricing.value), calculation_version: version, decisions: [],
        };
        setRows(previous => [scenario, ...previous]);
        open(scenario);
        setNotice('Escenario guardado en esta sesión de prueba. Se borra al recargar.');
      }
    });
  }

  function record(event) {
    event.preventDefault();
    const entry = validateDecision({ ...decision, source: owner ? decision.source : 'simulated' });
    if (!entry) {
      setError('Elige una fecha, un evento y una fuente válidos.');
      return;
    }
    act(async () => {
      if (opened.decisions.some(item => item.kind === entry.kind && item.date === entry.date && item.source === entry.source)) {
        throw new Error('Ese evento ya está registrado.');
      }
      const saved = owner
        ? (await request(db, { scenarioId: opened.id, decision: entry })).decision
        : { ...entry, id: crypto.randomUUID() };
      const row = { ...opened, decisions: [...opened.decisions, saved] };
      setRows(previous => previous.map(item => item.id === row.id ? row : item));
      setOpened(row);
      setDecision(emptyDecision);
      setNotice('Evento registrado.');
    });
  }

  function numberInput(key, label, unit) {
    const [defaultLabel, min, max, step] = numberFields[key];
    return <label>{label || defaultLabel}<span className="pricing-input">
      <input type="number" inputMode={step === 1 ? 'numeric' : 'decimal'} min={min} max={max} step={step}
        value={form[key]} onChange={event => change(key, event.target.value)} required />
      {unit && <span aria-hidden="true">{unit}</span>}
    </span></label>;
  }

  function signIn() {
    act(async () => {
      const { error: oauthError } = await db.auth.signInWithOAuth({
        provider: 'google', options: { redirectTo: window.location.origin + '/pricing' },
      });
      if (oauthError) throw new Error('No se pudo iniciar sesión con Google.');
    });
  }

  function signOut() {
    act(async () => {
      const { error: signOutError } = await db.auth.signOut();
      if (signOutError) throw new Error('No se pudo cerrar la sesión.');
    });
  }

  const sortedDecisions = [...(opened?.decisions ?? [])].sort((a, b) => a.date.localeCompare(b.date));
  return <main className="pricing-workspace">
    <header className="pricing-heading">
      <div><h1>Calculadora de ahorro mensual</h1>
        <p>Compara lo que cuesta dar seguimiento a los mismos casos en WhatsApp + Excel y en Agua en seguimiento.</p></div>
      {db && <button className="button ghost small" type="button" onClick={owner ? signOut : signIn} disabled={busy}>
        {owner ? 'Cerrar sesión' : 'Entrar con Google'}
      </button>}
    </header>

    <p className="pricing-mode" role="note">{owner
      ? 'Sesión activa · Tus escenarios se guardan en tu cuenta.'
      : 'Demo con datos ficticios · Los cambios se borran al salir de la página. Usa solo datos inventados.'}</p>

    <div className="pricing-grid">
      <form className="panel pricing-panel" onSubmit={save} noValidate>
        <div className="pricing-section-title"><h2>Escenario de ahorro</h2>
          <button className="pricing-link" type="button" onClick={() => open(sampleRow)}>Cargar ejemplo</button></div>
        <fieldset disabled={busy}>
          <label>Nombre del escenario<input required maxLength={60} value={form.name}
            onChange={event => change('name', event.target.value)} /></label>
          <div className="pricing-fields">
            <label>Mes de comparación<input type="month" required min="2000-01" max="2099-12" value={form.period}
              onChange={event => change('period', event.target.value)} /></label>
            {numberInput('cases', 'Casos comparados')}
          </div>
          <label>Plan<select value={form.plan} onChange={event => change('plan', event.target.value)}>
            {Object.entries(plans).map(([key, plan]) => <option value={key} key={key}>{plan.label} · {money(plan.monthlyCents)} MXN/mes</option>)}
          </select></label>
          {owner && <label>Origen de los datos<select value={form.evidence} onChange={event => change('evidence', event.target.value)}>
            <option value="simulated">Datos simulados</option><option value="measured">Datos medidos</option>
          </select></label>}
          <fieldset className="pricing-role"><legend>Administración</legend><div className="pricing-fields">
            {numberInput('adminBaseline', 'WhatsApp + Excel', 'min')}
            {numberInput('adminPlan', 'Con el plan', 'min')}
            {numberInput('adminRate', 'Costo por hora', 'MXN')}
          </div></fieldset>
          <fieldset className="pricing-role"><legend>Coordinación</legend><div className="pricing-fields">
            {numberInput('coordBaseline', 'WhatsApp + Excel', 'min')}
            {numberInput('coordPlan', 'Con el plan', 'min')}
            {numberInput('coordRate', 'Costo por hora', 'MXN')}
          </div></fieldset>
          <details className="pricing-details"><summary>Costos adicionales y otros beneficios</summary>
            <div className="pricing-fields">{numberInput('setupMinutes')}{numberInput('oneTimeCharges')}{numberInput('recurringCharges')}{numberInput('otherBenefit')}</div>
            <label>Fuente del beneficio adicional<input maxLength={160} required={Number(form.otherBenefit) > 0}
              value={form.otherSource} onChange={event => change('otherSource', event.target.value)} /></label>
            <div className="pricing-fields">{numberInput('providerMinutes')}{numberInput('providerRate')}{numberInput('providerCosts')}</div>
          </details>
          <button className="button pricing-save" type="submit">{busy ? 'Procesando…' : 'Guardar escenario'}</button>
        </fieldset>
      </form>

      <section className="panel pricing-panel pricing-result" aria-labelledby="result-title">
        <div className="pricing-section-title"><h2 id="result-title">Resultado del escenario</h2>
          <span className="pricing-badge">{owner && form.evidence === 'measured' ? 'Datos medidos' : 'Datos simulados'}</span></div>
        {result ? <>
          <div className="pricing-total"><span>Ahorro antes de la cuota</span><strong>{money(result.laborValue)} MXN</strong></div>
          <div className={'pricing-total balance ' + (result.balance < 0 ? 'negative' : '')}>
            <span>Saldo del primer mes</span><strong>{money(result.balance)} MXN</strong></div>
          <dl className="pricing-metrics">
            <div><dt>Costo total del primer mes</dt><dd>{money(result.cost)} MXN</dd></div>
            <div><dt>Valor total antes de costos</dt><dd>{money(result.benefit)} MXN</dd></div>
            <div><dt>Saldo mensual recurrente</dt><dd>{money(result.recurringBalance)} MXN</dd></div>
            <div><dt>Beneficio por cada peso de costo</dt><dd>{ratioText(result.ratio)}</dd></div>
          </dl>
          <p className="pricing-explanation">{result.recurringBalance < 0
            ? `Faltan ${money(-result.recurringBalance)} MXN de beneficio mensual para cubrir el costo recurrente.`
            : 'El beneficio estimado cubre el costo recurrente.'}
            {' '}{result.ratio === null ? 'La razón requiere un costo mayor a cero.' : result.ratio >= 10 ? 'Alcanza la meta de 10:1.' : 'Queda por debajo de la meta de 10:1.'}</p>
          <details className="pricing-details"><summary>Costo de entrega para Agua</summary>
            <dl className="pricing-metrics"><div><dt>Costo de entrega</dt><dd>{money(result.providerCost)} MXN</dd></div>
              <div><dt>Cuota menos costo de entrega</dt><dd>{money(result.providerContribution)} MXN</dd></div></dl>
          </details>
        </> : <p className="pricing-explanation">{pricing.errors[0]}</p>}
        <p className="pricing-scope">{form.plan === 'free' ? 'Free incluye 5 casos activos y un espacio de desborde. El séptimo reporte queda en WhatsApp, sin responsable ni fecha.'
          : form.plan === 'program' ? 'Program incluye 3 sitios, 100 casos activos en total y una vista combinada.'
          : 'Site incluye 25 casos activos, 30 min de configuración y 15 min de soporte. La migración se cotiza aparte.'}</p>
      </section>
    </div>

    {error && <p className="alert" role="alert">{error}</p>}
    <p className="pricing-status" role="status">{notice}</p>
    <section className="panel pricing-panel">
      <h2>Escenarios guardados</h2>
      {!rows.length ? <p>Guarda un escenario para volver a abrirlo y comparar sus resultados.</p> :
        <div className="table-scroll"><table className="pricing-table"><thead><tr>
          <th>Escenario</th><th>Plan</th><th>Saldo del primer mes</th><th>Beneficio/costo</th><th>Acción</th>
        </tr></thead><tbody>{rows.map(row => <tr key={row.id}>
          <td>{row.inputs.name} <small>{row.inputs.period} · {row.inputs.evidence === 'measured' ? 'Medido' : 'Simulado'}</small></td>
          <td>{plans[row.inputs.plan]?.label || '—'}</td><td>{money(row.results.balance)} MXN</td>
          <td>{ratioText(row.results.ratio)}</td><td><button className="pricing-link" type="button"
            aria-label={`Abrir ${row.inputs.name}`} onClick={() => open(row)} disabled={busy}>Abrir</button></td>
        </tr>)}</tbody></table></div>}
    </section>

    {opened && opened.id !== 'example' && <section className="panel pricing-panel pricing-log">
      <h2>Decisiones del comité</h2><p>{opened.inputs.name} · Registra cada señal con su fecha y fuente.</p>
      <form onSubmit={record} noValidate><fieldset className="pricing-decision" disabled={busy}>
        <label>Evento<select value={decision.kind} onChange={event => setDecision({ ...decision, kind: event.target.value })}>
          {Object.entries(pilotSignals).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select></label>
        <label>Fecha<input type="date" required value={decision.date}
          onChange={event => setDecision({ ...decision, date: event.target.value })} /></label>
        {owner && <label>Fuente<select value={decision.source} onChange={event => setDecision({ ...decision, source: event.target.value })}>
          {Object.entries(sources).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select></label>}
        <button className="button small" type="submit">Registrar evento</button>
      </fieldset></form>
      {sortedDecisions.length > 0 && <ul>{sortedDecisions.map(entry =>
        <li key={entry.id}>{entry.date} · {pilotSignals[entry.kind]} · {sources[entry.source]}</li>)}</ul>}
      <p className="pricing-scope">El hogar confirma si la fuga se resolvió. El registro del comité solo documenta la decisión comercial.</p>
    </section>}
  </main>;
}

async function request(db, payload, signal) {
  const { data, error } = await db.auth.getSession();
  if (error || !data.session) throw new Error('Vuelve a iniciar sesión con Google.');
  const response = await fetch('/api/pricing', {
    method: payload ? 'POST' : 'GET',
    headers: { Authorization: 'Bearer ' + data.session.access_token, 'Content-Type': 'application/json' },
    body: payload ? JSON.stringify(payload) : undefined,
    signal,
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'No se pudo completar la acción.');
  return body;
}
