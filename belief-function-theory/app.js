'use strict';

const { frame, sets, events, name, bounds, combine } = BeliefFunctionModel;
const get = id => document.getElementById(id);
const percent = new Intl.NumberFormat('en', { style: 'percent', maximumFractionDigits: 2 });
const fmt = value => percent.format(value);

const examples = {
  overlap: {
    first: { 1: 15, 3: 55 },
    second: { 4: 20, 6: 50 },
    description: 'Source 1 mainly supports {A, B}. Source 2 mainly supports {B, C}. Their overlap singles out B.'
  },
  ignorance: {
    first: {},
    second: {},
    description: 'Both sources put all their mass on Ω. Every nonempty proper event has bounds [0%, 100%].'
  },
  probability: {
    first: { 1: 25, 2: 50, 4: 25 },
    second: {},
    description: 'Source 1 puts all its mass on singletons, so its event bounds coincide.'
  },
  conflict: {
    first: { 1: 100 },
    second: { 4: 100 },
    description: 'Source 1 is certain of A and Source 2 is certain of C. Every pair of positive masses conflicts.'
  }
};

const sources = {};
const eventSelect = get('event');
const evidenceSelect = get('evidence');

for (const set of events) {
  const option = new Option(set === frame ? 'Ω · all outcomes' : name(set), set);
  eventSelect.add(option);
}

for (const [key, title] of [['first', 'Source 1'], ['second', 'Source 2']]) {
  const editor = document.createElement('fieldset');
  editor.className = 'card';
  editor.setAttribute('aria-describedby', 'mass-help');
  editor.innerHTML = `<legend>${title}</legend>`;
  const inputs = {};
  for (const set of sets) {
    const row = document.createElement('div');
    row.className = 'mass-row';
    const id = `${key}-${set}`;
    row.innerHTML = `
      <label for="${id}">${name(set)}${set === frame ? ' · unassigned' : ''}</label>
      <div class="mass-track" aria-hidden="true"><div></div></div>
      ${set === frame ? `<output id="${id}"></output>` : `
        <div class="mass-entry">
          <input id="${id}" type="number" min="0" max="100" step="1" inputmode="numeric"
            aria-label="${title}, mass on ${name(set)} in percent"><span aria-hidden="true">%</span>
        </div>`}
    `;
    editor.append(row);
    inputs[set] = { control: row.querySelector('input, output'), bar: row.querySelector('.mass-track div') };
  }
  const status = document.createElement('p');
  status.className = 'editor-status';
  status.setAttribute('role', 'status');
  editor.append(status);
  get('sources').append(editor);
  sources[key] = { inputs, status, values: Array(8).fill(0) };

  for (const set of sets.slice(0, -1)) {
    const control = inputs[set].control;
    control.addEventListener('input', () => {
      const source = sources[key];
      const requested = Math.round(control.valueAsNumber || 0);
      const available = source.values[frame] + source.values[set];
      const accepted = Math.min(available, Math.max(0, requested));
      source.values[set] = accepted;
      if (control.value !== '' || control.validity.badInput) control.value = accepted;
      status.textContent = requested > available
        ? `Only ${available}% is available for ${name(set)}. Lower another assignment to free mass.`
        : '';
      document.querySelectorAll('[data-preset]').forEach(button => button.setAttribute('aria-pressed', 'false'));
      get('scenario').textContent = 'Custom mass assignments';
      render();
    });
    control.addEventListener('blur', () => {
      control.value = sources[key].values[set];
    });
  }
}

function updateSource({ inputs, values }) {
  values[frame] = 100 - values.slice(1, frame).reduce((sum, value) => sum + value, 0);
  inputs[frame].control.value = fmt(values[frame] / 100);
  for (const set of sets) {
    inputs[set].bar.style.width = `${values[set]}%`;
    if (set !== frame) inputs[set].control.max = values[set] + values[frame];
  }
  return values.map(value => value / 100);
}

function render() {
  const first = updateSource(sources.first);
  const second = updateSource(sources.second);
  const combined = combine(first, second);
  const mass = { first, second, combined: combined.mass }[evidenceSelect.value];
  const event = Number(eventSelect.value);
  const interval = get('interval');

  get('conflict-result').textContent = `K = ${fmt(combined.conflict)}`;
  get('conflict-explanation').textContent = combined.mass
    ? `${fmt(sets.reduce((sum, set) => sum + combined.products[set], 0))} of the product mass survives on nonempty intersections.`
    : 'Total conflict leaves zero surviving mass. The normalized combination is undefined.';
  get('fusion-table').innerHTML = events.map(set => `
    <tr><th scope="row">${name(set)}</th><td>${fmt(combined.products[set])}</td>
    <td>${combined.mass ? fmt(combined.mass[set]) : '—'}</td></tr>
  `).join('');

  interval.hidden = !mass;
  interval.nextElementSibling.hidden = !mass;
  get('event-table').innerHTML = events.map(set => {
    const result = mass && bounds(mass, set);
    return `<tr class="${set === event ? 'selected' : ''}"><th scope="row">${name(set)}</th>
      <td>${result ? fmt(result.belief) : '—'}</td><td>${result ? fmt(result.plausibility) : '—'}</td></tr>`;
  }).join('');

  if (!mass) {
    get('event-result').textContent = 'Combined bounds are undefined under total conflict.';
    get('decomposition').textContent = 'Select either source to inspect its bounds.';
    return;
  }
  const { belief, plausibility } = bounds(mass, event);
  get('event-result').innerHTML = `
    <div class="bounds-values">
      <div>Belief<strong>${fmt(belief)}</strong></div>
      <div>Plausibility<strong>${fmt(plausibility)}</strong></div>
    </div>`;
  const bar = interval.firstElementChild;
  bar.style.left = `${Math.min(100, belief * 100)}%`;
  bar.style.width = `${Math.max(0, (plausibility - belief) * 100)}%`;
  get('decomposition').textContent =
    `${fmt(belief)} supports ${name(event)} outright. ${fmt(Math.max(0, plausibility - belief))} lies on sets that straddle the event and its complement.`;
}

function loadExample(key) {
  const example = examples[key];
  for (const [sourceKey, source] of Object.entries(sources)) {
    for (const set of sets.slice(0, -1)) {
      const value = example[sourceKey][set] ?? 0;
      source.values[set] = value;
      source.inputs[set].control.value = value;
    }
    source.status.textContent = '';
  }
  document.querySelectorAll('[data-preset]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.preset === key));
  });
  get('scenario').textContent = example.description;
  eventSelect.value = key === 'overlap' ? 2 : 1;
  evidenceSelect.value = key === 'conflict' ? 'combined' : 'first';
  render();
}

document.querySelectorAll('[data-preset]').forEach(button => {
  button.addEventListener('click', () => loadExample(button.dataset.preset));
});
get('reset').addEventListener('click', () => loadExample('overlap'));
get('show-combined').addEventListener('click', () => {
  evidenceSelect.value = 'combined';
  render();
  evidenceSelect.focus();
});
eventSelect.addEventListener('change', render);
evidenceSelect.addEventListener('change', render);
loadExample('overlap');
