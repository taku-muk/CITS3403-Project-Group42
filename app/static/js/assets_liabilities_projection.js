export function renderProjectionView(assetsData, targetContainer) {
    targetContainer.innerHTML = '';
  
    const controls = document.createElement('div');
    controls.className = 'grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-white';

    const sliders = [
      { id: 'savingsRate', label: 'Savings Interest', min: 0, max: 10, value: 2, step: 0.1 },
      { id: 'investmentRate', label: 'Investment Return', min: 0, max: 15, value: 7, step: 0.1 },
      { id: 'debtRate', label: 'Debt Growth', min: 0, max: 30, value: 3, step: 0.1 }
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
      const srInput = targetContainer.querySelector('#savingsRate');
      const irInput = targetContainer.querySelector('#investmentRate');
      const drInput = targetContainer.querySelector('#debtRate');
      
  
      if (!srInput || !irInput || !drInput) {
        console.error('Sliders not found in DOM!');
        return;
      }
  
      const sr = parseFloat(srInput.value) / 100;
      const ir = parseFloat(irInput.value) / 100;
      const dr = parseFloat(drInput.value) / 100;
  
      let s = 0, i = 0, d = 0;
      assetsData.forEach(a => {
        if (a.type === 'savings') s += a.amount;
        if (a.type === 'investment') i += a.amount;
        if (a.type === 'debt') d += a.amount;
      });
  
      const data = [];
      for (let y = 0; y <= 10; y++) {
        data.push((s + i - d).toFixed(2));
        s *= 1 + sr;
        i *= 1 + ir;
        d *= 1 + dr;
      }
  
      chart.data.datasets[0].data = data;
      chart.update();
    }
  
    updateChart();
  
    ['savingsRate', 'investmentRate', 'debtRate'].forEach(id => {
      const input = targetContainer.querySelector(`#${id}`);
      if (input) input.addEventListener('input', updateChart);
    });
    
  }
  