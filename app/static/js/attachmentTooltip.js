export function setupAttachmentTooltip(btnId, tooltipId) {
    const button = document.getElementById(btnId);
    const tooltip = document.getElementById(tooltipId);
  
    if (!button || !tooltip) return;
  
    const personas = [
      { label: "Uni Student", icon: "🎓" },
      { label: "Business Owner", icon: "🏢" },
      { label: "Freelancer", icon: "💼" },
      { label: "Adult with Dependents", icon: "👨‍👩‍👧" },
    ];
  
    // Build content
    tooltip.innerHTML = "";
  
    personas.forEach(persona => {
      const personaBtn = document.createElement("button");
      personaBtn.className = "block w-full text-left px-2 py-1 text-sm text-gray-300 hover:text-white hover:bg-[#2a2a2a] rounded transition";
      personaBtn.textContent = `${persona.icon} ${persona.label}`;
      personaBtn.onclick = () => alert(`Selected persona: ${persona.label}`);
      tooltip.appendChild(personaBtn);
    });
  
    // Separator
    const hr = document.createElement("div");
    hr.className = "my-2 border-t border-gray-600";
    tooltip.appendChild(hr);
  
    // Download options
    const downloads = [
      { label: "Download empty template", icon: "📄", action: () => alert("Download empty template") },
      { label: "Download prefilled template", icon: "📝", action: () => alert("Download prefilled template") },
    ];
  
    downloads.forEach(d => {
      const btn = document.createElement("button");
      btn.className = "block w-full text-left px-2 py-1 text-sm text-gray-300 hover:text-white hover:bg-[#2a2a2a] rounded transition";
      btn.textContent = `${d.icon} ${d.label}`;
      btn.onclick = d.action;
      tooltip.appendChild(btn);
    });
  
    // Position + toggle
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      tooltip.classList.toggle("hidden");
  
      const rect = button.getBoundingClientRect();
      tooltip.style.top = rect.bottom + window.scrollY + "px";
      tooltip.style.left = rect.left + "px";
    });
  
    document.addEventListener("click", (e) => {
      if (!tooltip.contains(e.target) && !button.contains(e.target)) {
        tooltip.classList.add("hidden");
      }
    });
  }
  