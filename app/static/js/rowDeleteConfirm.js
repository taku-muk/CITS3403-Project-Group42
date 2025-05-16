// static/js/rowDeleteConfirm.js

export function setupRowDeleteConfirmation(tableSelector) {
    const tableBody = document.querySelector(tableSelector);
    if (!tableBody) return;
  
    tableBody.addEventListener('contextmenu', e => {
      e.preventDefault();
      const row = e.target.closest('tr');
      if (!row) return;
  
      document.querySelectorAll('.confirm-tooltip').forEach(t => t.remove());
  
      const tooltip = document.createElement('div');
      tooltip.className = 'confirm-tooltip';
      tooltip.innerHTML = `
        <p class="confirm-text">Delete this row?</p>
        <div class="confirm-buttons">
          <button class="confirm-yes">Yes</button>
          <button class="confirm-no">No</button>
        </div>
      `;
      document.body.appendChild(tooltip);
  
      const { pageX: x, pageY: y } = e;
      tooltip.style.left = `${Math.min(x, window.innerWidth - tooltip.offsetWidth - 10)}px`;
      tooltip.style.top  = `${Math.min(y, window.innerHeight - tooltip.offsetHeight - 10)}px`;
  
      tooltip.querySelector('.confirm-yes').onclick = () => {
        row.remove();
        tooltip.remove();
      };
      tooltip.querySelector('.confirm-no').onclick = () => {
        tooltip.remove();
      };
  
      const onClickAway = evt => {
        if (!tooltip.contains(evt.target)) {
          tooltip.remove();
          document.removeEventListener('mousedown', onClickAway);
        }
      };
      setTimeout(() => document.addEventListener('mousedown', onClickAway), 0);
    });
  }
  