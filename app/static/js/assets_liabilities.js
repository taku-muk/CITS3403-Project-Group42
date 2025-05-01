export function renderAssetsAndLiabilities(assets) {
  const container = document.getElementById('assets-liabilities');
  container.innerHTML = '';

  const title = document.createElement('h2');
  title.className = 'text-2xl font-bold';
  title.innerText = 'Assets and Liabilities';
  container.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6';

  assets.forEach(asset => {
    const card = document.createElement('div');
    card.className = 'bg-[#1e1e1e] p-6 rounded-xl border border-[#333] flex flex-col gap-4';

    card.innerHTML = `
      <p class="text-[#838383] text-sm">${asset.name}</p>
      <h3 class="text-xl font-bold">$${asset.amount}</h3>
      <div class="w-full h-2 bg-[#151515] rounded-full">
        <div class="bg-white h-2 rounded-full" style="width: ${asset.progress}%;"></div>
      </div>
    `;

    grid.appendChild(card);
  });

  container.appendChild(grid);
}

  