export function renderProjectionView(assetsData, targetContainer) {
    targetContainer.innerHTML = '';
  
    const controls = document.createElement('div');
    controls.className = 'space-y-4 text-white mb-8';
    controls.innerHTML = `
      <label>Savings Interest: <input id="savingsRate" type="range" min="0" max="10" value="2" step="0.1" /></label>
      <label>Investment Return: <input id="investmentRate" type="range" min="0" max="15" value="7" step="0.1" /></label>
      <label>Debt Growth: <input id="debtRate" type="range" min="0" max="15" value="3" step="0.1" /></label>
    `;
  
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
  