export function prefillTransactions(persona, tableBodyId = 'transactionTableBody') {
    const examples = {
        "Uni Student": [
          { name: "Textbooks", type: "expense", amount: "150", tags: { frequency: "Once-off", importance: ["Need"] } },
          { name: "Rent", type: "expense", amount: "600", tags: { frequency: "Recurring", importance: ["Need"] } },
          { name: "Groceries", type: "expense", amount: "200", tags: { frequency: "Recurring", importance: ["Need"] } },
          { name: "Spotify Subscription", type: "expense", amount: "12", tags: { frequency: "Recurring", importance: ["Want"] } },
          { name: "Part-time Job", type: "income", amount: "800", tags: { frequency: "Recurring", importance: ["Need"] } },
          
          // Assets/Liabilities (no tags)
          { name: "Emergency Fund", type: "savings", amount: "500" },
          { name: "HECS Student Loan", type: "debt", amount: "18000" },
          { name: "Bitcoin", type: "investment", amount: "150" },
        ],
      
        "Business Owner": [
          { name: "Client Payment", type: "income", amount: "3000", tags: { frequency: "Recurring", importance: ["Need"] } },
          { name: "Office Rent", type: "expense", amount: "1200", tags: { frequency: "Recurring", importance: ["Need"] } },
          { name: "Software Subscription", type: "expense", amount: "99", tags: { frequency: "Recurring", importance: ["Want"] } },
          { name: "Coffee for Clients", type: "expense", amount: "60", tags: { frequency: "Recurring", importance: ["Want"] } },
          { name: "Freelancer Payment", type: "expense", amount: "800", tags: { frequency: "Once-off", importance: ["Need"] } },
          
          // Assets/Liabilities
          { name: "Business Reserve", type: "savings", amount: "12000" },
          { name: "Business Loan", type: "debt", amount: "25000" },
          { name: "Index Fund", type: "investment", amount: "7000" },
        ],
      
        "Freelancer": [
          { name: "Client Invoice Payment", type: "income", amount: "2200", tags: { frequency: "Recurring", importance: ["Need"] } },
          { name: "Coworking Space", type: "expense", amount: "300", tags: { frequency: "Recurring", importance: ["Want"] } },
          { name: "Adobe Suite", type: "expense", amount: "50", tags: { frequency: "Recurring", importance: ["Need"] } },
          { name: "Business Insurance", type: "expense", amount: "100", tags: { frequency: "Recurring", importance: ["Need"] } },
          { name: "Web Hosting", type: "expense", amount: "30", tags: { frequency: "Recurring", importance: ["Need"] } },
      
          // Assets/Liabilities
          { name: "Retirement Savings", type: "savings", amount: "4000" },
          { name: "Credit Card Balance", type: "debt", amount: "1200" },
          { name: "ETF Portfolio", type: "investment", amount: "5000" },
        ],
      
        "Adult with Dependents": [
          { name: "Salary", type: "income", amount: "5000", tags: { frequency: "Recurring", importance: ["Need"] } },
          { name: "Mortgage Payment", type: "expense", amount: "1800", tags: { frequency: "Recurring", importance: ["Need"] } },
          { name: "Groceries", type: "expense", amount: "600", tags: { frequency: "Recurring", importance: ["Need"] } },
          { name: "Kids School Fees", type: "expense", amount: "400", tags: { frequency: "Recurring", importance: ["Need"] } },
          { name: "Streaming Services", type: "expense", amount: "40", tags: { frequency: "Recurring", importance: ["Want"] } },
      
          // Assets/Liabilities
          { name: "Emergency Savings", type: "savings", amount: "7000" },
          { name: "Superannuation Fund", type: "investment", amount: "50000" },
          { name: "Mortgage", type: "debt", amount: "350000" },
          { name: "Car Loan", type: "debt", amount: "8000" },
        ]
      };
      
   
      
    
    const rows = examples[persona];
    if (!rows) return;
  
    const tableBody = document.getElementById(tableBodyId);
    const transactionsSection = document.getElementById('transactionsSection');
    transactionsSection.classList.remove('hidden');
    tableBody.innerHTML = ''; // clear any existing rows
  
    rows.forEach(({ name, type, amount, tags }) => {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-[#2a2a2a]';
  
      ['name', 'type', 'amount', 'tags'].forEach(col => {
        const td = document.createElement('td');
        td.className = 'py-2 pr-4 min-h-[3rem]';
  
        let input;
        if (col === 'type') {
          input = document.createElement('select');
          ['expense', 'income', 'investment', 'debt', 'savings'].forEach(opt => {
            const o = document.createElement('option');
            o.value = opt;
            o.textContent = opt.charAt(0).toUpperCase() + opt.slice(1);
            if (opt === type) o.selected = true;
            input.appendChild(o);
          });
        } else if (col === 'amount') {
          input = document.createElement('input');
          input.type = 'number';
          input.step = '0.01';
          input.value = amount;
        } 
          else if (col === 'name') {
          input = document.createElement('input');
          input.type = 'text';
          input.value = name;

        } else if (col === 'tags') {
            input = document.createElement('input');
            input.type = 'hidden';
            input.readOnly = true;
          
            if (tags) {
              td.dataset.tags = JSON.stringify(tags);
          
              if (tags.frequency) {
                const f = document.createElement('span');
                f.textContent = tags.frequency;
                f.className = 'tag-pill ' + tags.frequency;
                td.appendChild(f);
              }
          
              (tags.importance || []).forEach(tag => {
                const p = document.createElement('span');
                p.textContent = tag;
                p.className = 'tag-pill ' + tag;
                td.appendChild(p);
              });
          
              td.addEventListener('click', ev => window.makeTagEditable(td, input));
            } else {
              td.textContent = '–'; // or leave blank, or add a "No tags" indicator
            }
          }
  
        if (col !== 'tags') {
          input.name = `prefilled-${col}`;
          input.className = 'bg-transparent text-white outline-none w-full';
          if (col !== 'type') td.addEventListener('click', () => window.makeEditable(td, input));
          td.appendChild(input);
        }
  
        tr.appendChild(td);
      });
  
      tableBody.appendChild(tr);
    });
  }
  