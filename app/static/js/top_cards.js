export function renderTopCards(values) {
  const container = document.getElementById('top-cards');
  container.innerHTML = '';

  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6';

  const cards = [
      { title: 'Total Income', value: `$${values.totalIncome}` },
      { title: 'Total Expenditure', value: `$${values.totalExpenditure}` },
      { title: 'Net Income', value: `$${values.netIncome}` },
      { title: 'Run Rate', value: `${values.runRate} Months` }
  ];

  cards.forEach(card => {
      const div = document.createElement('div');
      div.className = 'bg-[#1e1e1e] p-5 rounded-xl border border-[#333] flex flex-col gap-1 h-32';


      div.innerHTML = `
      <p class="text-[#838383] text-sm">${card.title}</p>
      <h2 class="text-2xl font-medium leading-tight mt-1">${card.value}</h2>
  `;
  
      grid.appendChild(div);
  });

  container.appendChild(grid);
}
