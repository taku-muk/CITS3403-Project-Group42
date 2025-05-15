import { renderProjectionView } from "/static/js/assets_liabilities_projection.js";

export function renderAssetsAndLiabilities(assets, viewMode, totalIncome, netIncome )  {
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

  const savings = aggregated['Savings'].amount + netIncome;  // ⬅️ ADDED netIncome
  aggregated['Savings'].amount += netIncome;
  const investment = aggregated['Investment'].amount;
  const debt = aggregated['Debt'].amount;

  const netWorth = (savings + investment) - debt;

  const outer = document.createElement('div');
  outer.className = 'relative bg-[#151515] p-6 rounded-xl border border-[#333] space-y-6';


// 🔥 Create a flex container to hold heading and button
  const headingWrapper = document.createElement('div');
  headingWrapper.className = 'flex justify-between items-center mb-4';

  const heading = document.createElement('h2');
  heading.className = 'text-2xl font-bold';
  heading.innerText = `Net Worth: $${netWorth}`;

  const toggleContainer = document.createElement('div');
  toggleContainer.className = 'flex gap-1';  // closer together

  const listBtn = document.createElement('button');
  listBtn.className = `flex items-center justify-center bg-transparent p-2 ${viewMode === 'list' ? 'border-b-2 border-white' : ''}`;


  const listIcon = lucide.createElement(lucide.List);
  listIcon.setAttribute('width', '20');
  listIcon.setAttribute('height', '20');
  listIcon.setAttribute('stroke', viewMode === 'list' ? 'white' : '#888');
  listIcon.setAttribute('stroke-width', '2.5');

  listBtn.appendChild(listIcon);

  const chartBtn = document.createElement('button');
  chartBtn.className = `flex items-center justify-center bg-transparent p-2 ${viewMode === 'projection' ? 'border-b-2 border-white' : ''}`;

  const chartIcon = lucide.createElement(lucide.BarChart2);
  chartIcon.setAttribute('width', '20');
  chartIcon.setAttribute('height', '20');
  chartIcon.setAttribute('stroke', viewMode === 'projection' ? 'white' : '#888');
  chartIcon.setAttribute('stroke-width', '2.5');

  chartBtn.appendChild(chartIcon);

  listBtn.addEventListener('click', () => {
    if (viewMode !== 'list')  renderAssetsAndLiabilities(assets, 'list', totalIncome, netIncome);
  });

  chartBtn.addEventListener('click', () => {
    if (viewMode !== 'projection') renderAssetsAndLiabilities(assets, 'projection', totalIncome, netIncome);
  });

  toggleContainer.appendChild(listBtn);
  toggleContainer.appendChild(chartBtn);

  headingWrapper.appendChild(heading);
  headingWrapper.appendChild(toggleContainer);


  // ✅ Now append wrapper to outer
  outer.appendChild(headingWrapper);

 
  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

  Object.entries(aggregated).forEach(([name, data]) => {
    const card = document.createElement('div');
    card.className = 'bg-[#1e1e1e] p-6 rounded-xl border border-[#333] flex flex-col gap-4';
  
    // Only show arrow for "Savings"
    let arrowHTML = '';
    if (name === 'Savings') {
      if (netIncome > 0) {
        arrowHTML = '<i data-lucide="arrow-up-right" class="w-4 h-4 text-green-400 ml-1"></i>';
      } else if (netIncome < 0) {
        arrowHTML = '<i data-lucide="arrow-down-right" class="w-4 h-4 text-red-400 ml-1"></i>';
      }
    }
  
    card.innerHTML = `
  <p class="text-[#838383] text-sm">${name}</p>
  <div class="flex items-center">
    <h3 class="text-xl font-bold">$${(data.amount || 0).toLocaleString()}</h3>
    ${
      name === 'Savings'
        ? netIncome > 0
          ? '<i data-lucide="arrow-up" class="w-5 h-5 text-green-400 ml-3"></i>'
          : netIncome < 0
          ? '<i data-lucide="arrow-down" class="w-5 h-5 text-red-400 ml-3"></i>'
          : ''
        : ''
    }
  </div>
  <div class="w-full h-2 bg-[#151515] rounded-full mt-2">
    <div class="bg-white h-2 rounded-full" style="width: ${data.progress}%"></div>
  </div>
`;
  
    grid.appendChild(card);
  });
  
  outer.appendChild(grid);



  // ✅ List / projection toggle area
  const listWrapper = document.createElement('div');



  outer.appendChild(listWrapper);

  // 🏆 toggle logic
  if (viewMode === 'list') {
    const ul = document.createElement('ul');
    ul.className = 'space-y-4';
  
   
  
 
  
// ✅ keep only *constructors* in the map
const iconMap = {
  savings: lucide.Wallet,
  investment: lucide.TrendingUp,
  debt: lucide.Landmark
};
  // ✅ Insert "This Month's Income" item at top
  const incomeLi = document.createElement('li');
  incomeLi.className = 'flex items-center justify-between border-b border-[#333] pb-2 mb-2';

  const left = document.createElement('div');
  left.className = 'flex items-center gap-2';

  const incomeIcon = lucide.createElement(lucide.DollarSign);
  incomeIcon.setAttribute('stroke', '#FFFFFF'); // Tailwind green-500
  incomeIcon.setAttribute('width', '22');
  incomeIcon.setAttribute('height', '22');

  const iconWrapper = document.createElement('div');
  iconWrapper.className = 'w-10 h-10 flex items-center justify-center rounded-lg bg-[#1e1e1e] border border-[#333]';
  iconWrapper.appendChild(incomeIcon);

  const label = document.createElement('div');
  label.className = 'text-sm text-white font-semibold';
  label.textContent = "This Month's Income";

  left.appendChild(iconWrapper);
  left.appendChild(label);

  const amount = document.createElement('div');
  const incomeValue = Number(netIncome || 0);
const isPositive = incomeValue >= 0;

amount.className = `text-sm font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`;
amount.textContent = `${isPositive ? '+' : '−'} $${Math.abs(incomeValue).toLocaleString()}`;

  incomeLi.appendChild(left);
  incomeLi.appendChild(amount);

  ul.appendChild(incomeLi);



assets.forEach(asset => {
  const li = document.createElement('li');
  li.className = 'flex items-center justify-between';

  const left = document.createElement('div');
  left.className = 'flex items-center gap-2';

  // ✅ build a fresh SVG for every row
  const Icon    = iconMap[asset.type?.toLowerCase()] || lucide.HelpCircle;
  const iconSvg = lucide.createElement(Icon);
  iconSvg.setAttribute('stroke', 'white');
  iconSvg.setAttribute('width', '20');
  iconSvg.setAttribute('height', '20');

  const iconWrapper = document.createElement('div');
  iconWrapper.className =
    'w-10 h-10 flex items-center justify-center rounded-lg bg-[#1e1e1e] border border-[#333]';
  iconWrapper.appendChild(iconSvg);

  left.appendChild(iconWrapper);

  const nameText = document.createElement('div');
  nameText.className = 'text-sm text-white';
  nameText.textContent = asset.name;
  left.appendChild(nameText);

  const amount = document.createElement('div');
  amount.className = `text-sm ${
    asset.type.toLowerCase() === 'investment'
      ? 'text-green-300'
      : asset.type.toLowerCase() === 'debt'
      ? 'text-red-300'
      : 'text-green-300'
  }`;

  const amountPrefix = asset.type.toLowerCase() === 'debt' ? '-' : '+';
  amount.textContent = `${amountPrefix} $${asset.amount}`;

  li.appendChild(left);
  li.appendChild(amount);

  ul.appendChild(li);
});
listWrapper.appendChild(ul)

    

  } else if (viewMode === 'projection') {
    renderProjectionView(assets, listWrapper, netIncome);
  }


  container.appendChild(outer);
  lucide.createIcons();
}
