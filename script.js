(() => {
  const STORAGE_KEY = 'pim2-unip-checklist-v2';
  const checks = [...document.querySelectorAll('.check-item input[type="checkbox"]')];
  const progressText = document.getElementById('progressText');
  const progressPercent = document.getElementById('progressPercent');
  const progressBar = document.getElementById('progressBar');
  const sideProgressBar = document.getElementById('sideProgressBar');
  const sideProgressText = document.getElementById('sideProgressText');
  const toast = document.getElementById('toast');
  let activeFilter = 'all';

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2300);
  }

  function readState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch { return {}; }
  }

  function saveState() {
    const state = {};
    checks.forEach(c => state[c.dataset.key] = c.checked);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch { showToast('Não foi possível salvar o progresso neste navegador.'); }
  }

  function refreshGroupProgress() {
    document.querySelectorAll('.check-group').forEach(group => {
      const groupChecks = [...group.querySelectorAll('.check-item input[type="checkbox"]')];
      const done = groupChecks.filter(c => c.checked).length;
      const total = groupChecks.length;
      const badge = group.querySelector('.count-badge');
      if (badge) badge.textContent = `${done}/${total}`;
      group.classList.toggle('is-complete', total > 0 && done === total);
    });
  }

  function applyChecklistFilter(filter) {
    document.querySelectorAll('.check-item').forEach(item => {
      const input = item.querySelector('input');
      const tags = item.dataset.tags || '';
      let visible = true;
      if (filter === 'done') visible = input.checked;
      else if (filter === 'pending') visible = !input.checked;
      else if (filter !== 'all') visible = tags.includes(filter) || item.closest('.check-group')?.dataset.group?.includes(filter);
      item.style.display = visible ? '' : 'none';
    });

    document.querySelectorAll('.check-group').forEach(group => {
      const anyVisible = [...group.querySelectorAll('.check-item')].some(i => i.style.display !== 'none');
      group.style.display = anyVisible ? '' : 'none';
      if (filter !== 'all' && anyVisible) {
        group.classList.remove('is-collapsed');
        group.querySelector('.check-group__title')?.setAttribute('aria-expanded','true');
      }
    });
  }

  function updateProgress() {
    const done = checks.filter(c => c.checked).length;
    const total = checks.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    if (progressText) progressText.textContent = `${done} de ${total} concluídos`;
    if (progressPercent) progressPercent.textContent = `${pct}%`;
    if (progressBar) progressBar.style.width = `${pct}%`;
    if (sideProgressBar) sideProgressBar.style.width = `${pct}%`;
    if (sideProgressText) sideProgressText.textContent = `${pct}%`;
    refreshGroupProgress();
    applyChecklistFilter(activeFilter);
  }

  const saved = readState();
  checks.forEach(c => {
    c.checked = Boolean(saved[c.dataset.key]);
    c.addEventListener('change', () => {
      saveState();
      updateProgress();
    });
  });
  updateProgress();

  document.getElementById('resetChecklist')?.addEventListener('click', () => {
    if (!confirm('Limpar todas as marcações do checklist?')) return;
    checks.forEach(c => c.checked = false);
    saveState();
    updateProgress();
    showToast('Checklist zerado.');
  });

  document.getElementById('copyPending')?.addEventListener('click', async () => {
    const pending = checks
      .filter(c => !c.checked)
      .map(c => `- [ ] ${c.closest('.check-item').querySelector('strong').textContent.trim()}`);
    const text = pending.length ? `PENDÊNCIAS DO PIM II\n\n${pending.join('\n')}` : 'Checklist do PIM II concluído.';
    try {
      await navigator.clipboard.writeText(text);
      showToast('Pendências copiadas.');
    } catch {
      showToast('Não foi possível copiar automaticamente.');
    }
  });


  // Checklist groups: compact by default, expandable on demand.
  const checkGroups = [...document.querySelectorAll('.check-group')];
  checkGroups.forEach((group, index) => {
    const title = group.querySelector('.check-group__title');
    if (!title) return;
    title.setAttribute('role', 'button');
    title.setAttribute('tabindex', '0');
    const setCollapsed = value => {
      group.classList.toggle('is-collapsed', value);
      title.setAttribute('aria-expanded', value ? 'false' : 'true');
    };
    setCollapsed(index !== 0);
    const toggle = () => setCollapsed(!group.classList.contains('is-collapsed'));
    title.addEventListener('click', toggle);
    title.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  const filterButtons = [...document.querySelectorAll('.filter-chip')];
  filterButtons.forEach(btn => btn.addEventListener('click', () => {
    activeFilter = btn.dataset.filter;
    filterButtons.forEach(b => {
      b.classList.toggle('active', b === btn);
      b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
    });
    applyChecklistFilter(activeFilter);
  }));
  filterButtons.forEach(b => b.setAttribute('aria-pressed', b.classList.contains('active') ? 'true' : 'false'));

  document.querySelectorAll('.discipline-card').forEach(card => {
    const summary = card.querySelector('summary');
    summary?.setAttribute('aria-expanded', card.open ? 'true' : 'false');
    card.addEventListener('toggle', () => summary?.setAttribute('aria-expanded', card.open ? 'true' : 'false'));
  });

  const searchInput = document.getElementById('globalSearch');
  const searchStatus = document.getElementById('searchStatus');
  const searchable = [...document.querySelectorAll('.searchable-block, .discipline-card, .check-item')];
  const normalize = text => (text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  function runSearch() {
    if (!searchInput) return;
    const q = normalize(searchInput.value.trim());
    if (!q) {
      searchable.forEach(el => el.classList.remove('search-hidden'));
      if (searchStatus) searchStatus.textContent = '';
      applyChecklistFilter(activeFilter);
      return;
    }

    let direct = 0;
    document.querySelectorAll('.discipline-card, .check-item').forEach(el => {
      const hay = normalize(`${el.dataset.search || ''} ${el.dataset.tags || ''} ${el.textContent}`);
      const match = hay.includes(q);
      el.classList.toggle('search-hidden', !match);
      if (match) direct++;
    });

    document.querySelectorAll('.searchable-block').forEach(block => {
      const own = normalize(`${block.dataset.search || ''} ${block.querySelector('.section-heading')?.textContent || ''}`);
      const childMatch = block.querySelector('.discipline-card:not(.search-hidden), .check-item:not(.search-hidden)');
      block.classList.toggle('search-hidden', !own.includes(q) && !childMatch);
    });

    if (searchStatus) {
      searchStatus.textContent = direct
        ? `${direct} item(ns) relacionado(s) encontrado(s).`
        : 'Nenhum item direto encontrado. Tente outro termo.';
    }
  }

  searchInput?.addEventListener('input', runSearch);
  document.addEventListener('keydown', event => {
    if (event.key === '/' && searchInput && document.activeElement !== searchInput && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
      event.preventDefault();
      searchInput.focus();
    }
    if (event.key === 'Escape') {
      document.getElementById('sidebar')?.classList.remove('open');
      document.getElementById('menuButton')?.setAttribute('aria-expanded', 'false');
    }
  });

  document.getElementById('copyUrlButton')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      showToast('Link copiado.');
    } catch {
      showToast('Não foi possível copiar o link.');
    }
  });

  const menuButton = document.getElementById('menuButton');
  const sidebar = document.getElementById('sidebar');
  menuButton?.addEventListener('click', () => {
    const open = sidebar?.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', () => {
    sidebar?.classList.remove('open');
    menuButton?.setAttribute('aria-expanded','false');
  }));

  const sections = [...document.querySelectorAll('.section-anchor')];
  const navLinks = [...document.querySelectorAll('.nav-link')];
  let navFrame = 0;
  function updateActiveNav() {
    navFrame = 0;
    const current = sections.reduce((active, section) =>
      section.getBoundingClientRect().top <= 170 ? section.id : active, 'inicio');
    const target = navLinks.some(a => a.getAttribute('href') === `#${current}`) ? current : 'riscos';
    navLinks.forEach(a => {
      const active = a.getAttribute('href') === `#${target}`;
      a.classList.toggle('active', active);
      if (active) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', () => {
    if (!navFrame) navFrame = requestAnimationFrame(updateActiveNav);
  }, { passive: true });
  updateActiveNav();
})();
