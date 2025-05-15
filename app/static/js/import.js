/* ---------------------------------------------------------------------------
   CostScope – CSV import logic with robust CSV-splitting & debug logging
   Exports: setupImportArea(dropzoneId)
---------------------------------------------------------------------------- */

export function setupImportArea(dropzoneId) {
  // 1) Grab DOM elements
  const dropzone            = document.getElementById(dropzoneId);
  const fileInput           = document.getElementById('fileInput');
  const transactionsSection = document.getElementById('transactionsSection');
  const importSection       = document.getElementById('importSection');
  const tableBody           = document.getElementById('transactionTableBody');

  // 2) Safety guard
  if (!dropzone || !fileInput) return;

  /* ─────────────────── Drag-and-drop styling ───────────────────────────── */
  const highlight   = () => dropzone.classList.add('border-blue-400', 'bg-[#222]');
  const unhighlight = () => dropzone.classList.remove('border-blue-400', 'bg-[#222]');

  dropzone.addEventListener('dragover',  e => { e.preventDefault(); highlight(); });
  dropzone.addEventListener('dragleave', e => { e.preventDefault(); unhighlight(); });
  dropzone.addEventListener('drop',      e => {
    e.preventDefault();
    unhighlight();
    if (e.dataTransfer.files.length) {
      console.log('[Import] File dropped:', e.dataTransfer.files[0].name);
      handleFile(e.dataTransfer.files[0]);
    }
  });

  /* ────────────── Fallback: click to open picker ───────────────────────── */
  dropzone.addEventListener('click',   () => fileInput.click());
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
      console.log('[Import] File selected:', fileInput.files[0].name);
      handleFile(fileInput.files[0]);
    }
  });

  /* ─────────────────── File reading & preview ─────────────────────────── */
  function handleFile(file) {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a .csv file');
      console.warn('[Import] Rejected non-CSV file:', file.name);
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const raw = e.target.result;
      console.log('[Import] Raw file length:', raw.length);

      // split into lines (handles both LF and CRLF)
      const rows = raw.split(/\r\n|\n/).filter(r => r.trim());
      console.log('[Import] Total rows (incl. header):', rows.length);
      if (rows.length < 2) return;

      tableBody.innerHTML = ''; // clear old preview

      // iterate data rows (skip header at index 0)
      for (let i = 1; i < rows.length; i++) {
        const rowText = rows[i];
        console.group(`[Import] Row ${i}`);
        console.log(' rowText:', rowText);

        // robustly split by commas outside quotes
        const cols = splitCsvLine(rowText);
        console.log(' split cols:', cols);

        if (cols.length < 3) {
          console.warn('  skipping malformed row');
          console.groupEnd();
          continue;
        }

        // destructure first 4 columns (tagsRaw may include commas)
        const [name, type, amount, tagsRaw = ''] = cols.map(s => s.trim());
        console.log('  name:', name, '| type:', type, '| amount:', amount);
        console.log('  raw tags:', tagsRaw);

        // build <tr>
        const tr = document.createElement('tr');
        tr.className = 'border-b border-[#2a2a2a]';

        // name | type | amount cells
        ['name', 'type', 'amount'].forEach((_, idx) => {
          const td = document.createElement('td');
          td.className = 'py-2 pr-4 min-h-[3rem]';
          td.textContent = cols[idx] || '—';
          makeEditable(td);
          tr.appendChild(td);
        });

        // tags cell
        const tagsTd = document.createElement('td');
        tagsTd.className = 'py-2 min-h-[3rem]';

        const tagsObj = parseTagsCell(tagsRaw);
        console.log('  parsed tagsObj:', tagsObj);

        tagsTd.dataset.tags = JSON.stringify(tagsObj);
        renderTagPills(tagsTd, tagsObj);
        makeTagEditable(tagsTd);
        tr.appendChild(tagsTd);

        tableBody.appendChild(tr);
        console.groupEnd();
      }

      // show preview
      importSection.classList.add('hidden');
      transactionsSection.classList.remove('hidden');
      console.log('[Import] Preview table displayed');
    };

    reader.readAsText(file);
  }
}

/* ─────────────────── Helper: split CSV line ────────────────────────────── */
/**
 * Splits a CSV line on commas that are not inside double quotes.
 * Retains quoted substrings (with quotes).
 */
function splitCsvLine(line) {
  const result = [];
  let curr = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"' && line[i - 1] !== '\\') {
      inQuotes = !inQuotes;  // toggle state
      curr += ch;            // keep the quote for later unwrapping
    } else if (ch === ',' && !inQuotes) {
      result.push(curr);
      curr = '';
    } else {
      curr += ch;
    }
  }
  result.push(curr);
  return result;
}

/* ─────────────────── Helper: robust tags parsing ───────────────────────── */
/**
 * Accepts either
 *   ① JSON:  {"frequency":"Recurring","importance":["Need"]}
 *   ② Plain list: need,recurring   want;once-off   need|once-off
 * Returns { frequency?: string, importance?: string[] }
 */
function parseTagsCell(raw) {
  if (!raw) return {};

  let txt = raw.trim().replace(/\r?\n/g, '');

  /* ── 1) unwrap outer quotes & unescape CSV artefacts ────────────────── */
  while (
    (txt.startsWith('"') && txt.endsWith('"')) ||
    (txt.startsWith("'") && txt.endsWith("'"))
  ) {
    txt = txt.slice(1, -1);
  }
  txt = txt.replace(/""/g, '"').replace(/\\"/g, '"');

  /* ── 2) first try JSON.parse ─────────────────────────────────────────── */
  try {
    const obj = JSON.parse(txt);
    if (obj && typeof obj === 'object') return obj;
  } catch (_) {
    /* not JSON, fall through */
  }

  /* ── 3) fallback: comma/semicolon/pipe-separated list ────────────────── */
  const parts = txt.split(/[;,|]/).map(t => t.trim().toLowerCase()).filter(Boolean);

  const mapped = { importance: [], frequency: undefined };
  parts.forEach(p => {
    if (p === 'recurring' || p === 'once-off' || p === 'onceoff' || p === 'once_off') {
      mapped.frequency = p === 'recurring' ? 'Recurring' : 'Once-off';
    } else if (p === 'need' || p === 'want') {
      mapped.importance.push(p[0].toUpperCase() + p.slice(1)); // Need / Want
    }
  });

  if (!mapped.importance.length) delete mapped.importance;
  if (!mapped.frequency)        delete mapped.frequency;
  return mapped;
}


/* ─────────────────── Helper: render coloured pills ─────────────────────── */
/**
 * Given a <td> and tags object, clears raw text and appends <span> pills.
 */
function renderTagPills(td, tags) {
  td.textContent = '';  // clear anything
  if (tags.frequency) {
    const f = document.createElement('span');
    f.textContent = tags.frequency;
    f.className   = 'tag-pill ' + tags.frequency;
    td.appendChild(f);
  }
  (tags.importance || []).forEach(tag => {
    const s = document.createElement('span');
    s.textContent = tag;
    s.className   = 'tag-pill ' + tag;
    td.appendChild(s);
  });
}
