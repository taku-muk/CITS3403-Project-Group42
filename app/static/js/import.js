export function setupImportArea(dropzoneId) {
    const dropzone = document.getElementById(dropzoneId);
    const fileInput = document.getElementById('fileInput');
    const transactionsSection = document.getElementById('transactionsSection');
    const importSection = document.getElementById('importSection');
    const tableBody = document.getElementById('transactionTableBody');
  
    if (!dropzone || !fileInput) return;
  
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('border-blue-400', 'bg-[#222]');
    });
  
    dropzone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropzone.classList.remove('border-blue-400', 'bg-[#222]');
    });
  
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('border-blue-400', 'bg-[#222]');
      if (e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
      }
    });
  
    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        handleFile(fileInput.files[0]);
      }
    });
  
    function handleFile(file) {
      if (!file.name.endsWith('.csv')) {
        alert('Please upload a CSV file.');
        return;
      }
  
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const rows = content.split('\n').filter(row => row.trim() !== '');
        const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
  
        tableBody.innerHTML = '';
  
        for (let i = 1; i < rows.length; i++) {
          const values = rows[i].split(',');
          if (values.length < 3) continue;
  
          const [name, type, amount, tagsRaw] = values.map(v => v.trim());
  
          const row = document.createElement('tr');
          row.className = 'border-b border-[#2a2a2a]';
  
          ['name', 'type', 'amount'].forEach((field, index) => {
            const td = document.createElement('td');
            td.className = 'py-2 pr-4 min-h-[3rem]';
            td.textContent = values[index] || '—';
            makeEditable(td);
            row.appendChild(td);
          });
  
          const tagsTd = document.createElement('td');
          tagsTd.className = 'py-2 min-h-[3rem]';
  
          let parsedTags = {};
          if (tagsRaw) {
            let cleanTags = tagsRaw;
            try {
              // Excel-style CSV may wrap JSON in double double-quotes
              if ((cleanTags.startsWith('"') && cleanTags.endsWith('"')) || 
                  (cleanTags.startsWith("'") && cleanTags.endsWith("'"))) {
                cleanTags = cleanTags.slice(1, -1); // strip outer quotes
              }
              cleanTags = cleanTags.replace(/""/g, '"'); // fix inner quotes
              parsedTags = JSON.parse(cleanTags);
            } catch (err) {
              console.warn('Failed to parse tags JSON:', cleanTags);
              parsedTags = { importance: tagsRaw.split(';').map(t => t.trim()) };
            }
            
          }
          tagsTd.dataset.tags = JSON.stringify(parsedTags);
          
  
          // Immediately render pills (match style)
          if (parsedTags.frequency) {
            const f = document.createElement('span');
            f.textContent = parsedTags.frequency;
            f.className = 'tag-pill ' + parsedTags.frequency;
            tagsTd.appendChild(f);
          }
          (parsedTags.importance || []).forEach(tag => {
            const p = document.createElement('span');
            p.textContent = tag;
            p.className = 'tag-pill ' + tag;
            tagsTd.appendChild(p);
          });
  
          makeTagEditable(tagsTd);
          row.appendChild(tagsTd);
  
          tableBody.appendChild(row);
        }
  
        importSection.classList.add('hidden');
        transactionsSection.classList.remove('hidden');
      };
  
      reader.readAsText(file);
    }
  }
  