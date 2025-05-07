

 
export function renderAssetsAndLiabilities(assets) {
  const container = document.getElementById('assets-liabilities');
  container.innerHTML = '';
  console.log('assets:', assets);

  // ✅ GROUP assets by name for the cards
  const aggregated = {};
  assets.forEach(asset => {
    const typeKey = asset.type ? asset.type.toLowerCase() : asset.name.toLowerCase();
    const displayKey = typeKey.charAt(0).toUpperCase() + typeKey.slice(1);
    
    if (!aggregated[displayKey]) {
      aggregated[displayKey] = { amount: 0, progress: asset.progress || 50 };
    }
    aggregated[displayKey].amount += asset.amount;
  });
  

  // Ensure all categories exist
  ['Savings', 'Investment', 'Debt'].forEach(type => {
    if (!aggregated[type]) {
      aggregated[type] = { amount: 0, progress: 0 };
    }
  });

  const savings = aggregated['Savings'].amount;
  const investment = aggregated['Investment'].amount;
  const debt = aggregated['Debt'].amount;
  const netWorth = (savings + investment) - debt;

  const outer = document.createElement('div');
  outer.className = 'bg-[#151515] p-6 rounded-xl border border-[#333] space-y-6';

  const heading = document.createElement('h2');
  heading.className = 'text-2xl font-bold mb-4';
  heading.innerText = `Net Worth: $${netWorth}`;
  outer.appendChild(heading);

  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

  Object.entries(aggregated).forEach(([name, data]) => {
    const card = document.createElement('div');
    card.className = 'bg-[#1e1e1e] p-6 rounded-xl border border-[#333] flex flex-col gap-4';

    card.innerHTML = `
      <p class="text-[#838383] text-sm">${name}</p>
      <h3 class="text-xl font-bold">$${data.amount}</h3>
      <div class="w-full h-2 bg-[#151515] rounded-full">
        <div class="bg-white h-2 rounded-full" style="width: ${data.progress}%"></div>
      </div>
    `;

    grid.appendChild(card);
  });

  outer.appendChild(grid);

  // ✅ NEW: detailed list of individual assets under cards
  const listWrapper = document.createElement('div');
  listWrapper.className = 'mt-8 space-y-4';
  
  // title
  const sectionTitle = document.createElement('h3');
  sectionTitle.className = 'text-lg font-semibold text-white';
  sectionTitle.innerHTML = `My Assets and Liabilities <span class="text-[#888] text-sm">(${assets.length})</span>`;

  listWrapper.appendChild(sectionTitle);
  
  // List container
  const ul = document.createElement('ul');
  ul.className = 'space-y-4';
  
  // icons for each type
  const icons = {
    savings: lucide.createElement(lucide.Wallet),
    investment: lucide.createElement(lucide.TrendingUp),
    debt: lucide.createElement(lucide.Landmark)
  };
  
  
  // for each asset (individual entries, not aggregated)
  assets.forEach(asset => {
    const li = document.createElement('li');
    li.className = 'flex items-center justify-between p-1'; // no bg, no border
  
    // left side: icon + name
    const left = document.createElement('div');
    left.className = 'flex items-center gap-2'; // small gap between icon and name
  
    const iconSvg = icons[asset.type.toLowerCase()] || lucide.createElement(lucide.HelpCircle);
     iconSvg.setAttribute('stroke', 'white'); // optional: customize color
     iconSvg.setAttribute('width', '20');     // optional: size
     iconSvg.setAttribute('height', '20');


     const iconWrapper = document.createElement('div');
     iconWrapper.className = 'w-10 h-10 flex items-center justify-center rounded-lg bg-[#1e1e1e] border border-[#333]';
     iconWrapper.appendChild(iconSvg);

     left.appendChild(iconWrapper);


  
    const nameText = document.createElement('div');
    nameText.className = 'text-sm text-white';
    nameText.textContent = asset.name;

    left.appendChild(nameText);
  
    const amount = document.createElement('div');
     amount.className = `text-sm ${
     asset.type.toLowerCase() === 'investment' ? 'text-green-300'
  : asset.type.toLowerCase() === 'debt' ? 'text-red-300'
  : 'text-green-300'
}`;

    const amountPrefix = asset.type.toLowerCase() === 'debt' ? '-' : '+';
    amount.textContent = `${amountPrefix} $${asset.amount}`;
  
    li.appendChild(left);
    li.appendChild(amount);
  
    ul.appendChild(li);
  });
  
  
  
  listWrapper.appendChild(ul);
outer.appendChild(listWrapper);
container.appendChild(outer);  // ✅ this attaches everything to DOM

  
}
