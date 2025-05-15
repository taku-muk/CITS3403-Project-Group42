export function renderProjectionView(assetsData, targetContainer,income) {
  targetContainer.innerHTML = '';

  const controls = document.createElement('div');
  controls.className = 'grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-white';

  const sliders = [
    { id: 'savingsInterest', label: 'Savings Interest', min: 0, max: 10, value: 2, step: 0.1 },
    { id: 'investmentReturn', label: 'Investment Return', min: 0, max: 15, value: 7, step: 0.1 },
    { id: 'debtGrowth', label: 'Debt Growth', min: 0, max: 30, value: 3, step: 0.1 }
  ];

  sliders.forEach(cfg => {
    const wrap = document.createElement('div');
    wrap.className = 'flex flex-col gap-2';

    const label = document.createElement('label');
    label.className = 'text-sm';
    label.setAttribute('for', cfg.id);
    label.textContent = cfg.label;

    const sliderRow = document.createElement('div');
    sliderRow.className = 'flex items-center gap-3';

    const input = document.createElement('input');
    input.type = 'range';
    input.id = cfg.id;
    input.min = cfg.min;
    input.max = cfg.max;
    input.step = cfg.step;
    input.value = cfg.value;
    input.className = 'flex-1';

    const valueDisplay = document.createElement('span');
    valueDisplay.id = cfg.id + 'Value';
    valueDisplay.textContent = `${cfg.value}%`;
    valueDisplay.className = 'text-sm w-10';

    input.addEventListener('input', () => {
      valueDisplay.textContent = `${input.value}%`;
       updateChart();
    });

    sliderRow.append(input, valueDisplay);
    wrap.append(label, sliderRow);
    controls.appendChild(wrap);
  });
  [
    { id: 'savingsRate',    label: 'Savings Rate (% of income)',    value: 20 },
    { id: 'investmentRate', label: 'Investment Rate (% of income)', value: 15 },
    { id: 'repaymentRate',  label: 'Repayment Rate (% of income)',  value: 10 }
  ].forEach(cfg => {
    const wrap = document.createElement('div');
    wrap.className = 'flex flex-col gap-2';

    const lbl = document.createElement('label');
    lbl.className = 'text-sm';
    lbl.htmlFor = cfg.id;
    lbl.textContent = cfg.label;

    const row = document.createElement('div');
    row.className = 'flex items-center gap-3';

    const inp = document.createElement('input');
    inp.type      = 'range';
    inp.id        = cfg.id;
    inp.min       = 0;
    inp.max       = 100;
    inp.step      = 1;
    inp.value     = cfg.value;
    inp.className = 'flex-1';

    const disp = document.createElement('span');
    disp.id          = cfg.id + 'Value';
    disp.className   = 'text-sm w-10';
    disp.textContent = `${cfg.value}%`;

    // update only its own label on drag
    inp.addEventListener('input', () => {
      disp.textContent = `${inp.value}%`;
      updateChart(); // enable later when wiring logic
    });

    row.append(inp, disp);
    wrap.append(lbl, row);
    controls.append(wrap);
  });
  


  const canvas = document.createElement('canvas');
  canvas.id = 'projectionChart';

  
  targetContainer.appendChild(controls);
  targetContainer.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array.from({ length: 11 }, (_, i) => `Year ${i}`),
      datasets: [{
        label: 'Projected Net Worth',
        data: [],
        borderWidth: 2,
        borderColor: 'white',
        backgroundColor: 'rgba(255,255,255,0.1)'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: 'white' } }
      },
      scales: {
        x: { ticks: { color: 'white' } },
        y: { ticks: { color: 'white' } }
      }
    }
  });

  function updateChart() {
    // 1) Base income (can be negative)
    const baseIncome = parseFloat(income) || 0;
  
    // 2) Growth sliders (must match your slider IDs)
    const siInput  = targetContainer.querySelector('#savingsInterest');
    const irInput  = targetContainer.querySelector('#investmentReturn');
    const dgInput  = targetContainer.querySelector('#debtGrowth');
  
    // 3) Contribution-rate sliders
    const srInput  = targetContainer.querySelector('#savingsRate');
    const ivInput  = targetContainer.querySelector('#investmentRate');
    const rrInput  = targetContainer.querySelector('#repaymentRate');
  
    if (!siInput || !irInput || !dgInput || !srInput || !ivInput || !rrInput) {
      console.error('One or more sliders not found!');
      return;
    }
  
    // 4) Parse decimals
    const si = parseFloat(siInput.value) / 100;  // savings interest
    const ig = parseFloat(irInput.value) / 100;  // investment return
    const dg = parseFloat(dgInput.value) / 100;  // debt growth
  
    const sr = parseFloat(srInput.value) / 100;  // % of income → savings
    const iv = parseFloat(ivInput.value) / 100;  // % of income → investment
    const rr = parseFloat(rrInput.value) / 100;  // % of income → debt repayment
  
    // 5) Starting balances
    let s = 0, i = 0, d = 0;
    assetsData.forEach(a => {
      if (a.type === 'savings')    s += a.amount;
      if (a.type === 'investment') i += a.amount;
      if (a.type === 'debt')       d += a.amount;
    });
  
    // 6) Build 10-year projection
    const projected = [];
    for (let year = 0; year <= 10; year++) {
      projected.push((s + i - d).toFixed(2));
  
      // a) compound existing balances
      s = s * (1 + si);
      i = i * (1 + ig);
      d = d * (1 + dg);
  
      // b) then add/subtract contributions
      s += baseIncome * sr;
      i += baseIncome * iv;
      d = Math.max(0, d - baseIncome * rr);
    }
  
    // 7) Render
    chart.data.datasets[0].data = projected;
    chart.update();
  }
  

  updateChart();

  [
    'savingsInterest',
    'investmentReturn',
    'debtGrowth',
    'savingsRate',
    'investmentRate',
    'repaymentRate'
  ].forEach(id => {
    const input = targetContainer.querySelector(`#${id}`);
    if (input) input.addEventListener('input', updateChart);
  });
  
}
