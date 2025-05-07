export function renderTopCards(values) {
    const container = document.getElementById('top-cards');
    container.innerHTML = '';
  
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6';
  
    const cards = [
      { title: 'Total Income', value: `$${values.totalIncome.toFixed(2)}` },
      { title: 'Total Expenditure', value: `$${values.totalExpenditure.toFixed(2)}` },
      { title: 'Net Income', value: `$${values.netIncome.toFixed(2)}` },
      { title: 'Runway (months)', value: `${values.runRate.toFixed(2)} mo` }
    ];
  
    for (const { title, value } of cards) {
      const card = document.createElement('div');
      card.className = 'bg-[#1e1e1e] p-6 rounded-xl shadow-lg border border-[#333]';
  
      card.innerHTML = `
        <h3 class="text-sm text-gray-400 mb-1">${title}</h3>
        <p class="text-2xl font-semibold text-white">${value}</p>
      `;
  
      grid.appendChild(card);
    }
  
    container.appendChild(grid);
  }
  