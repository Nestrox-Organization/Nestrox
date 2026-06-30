/* ============================================================
   Nestrox — Help & Support Page Logic
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     Session Auth Guard (API-based)
     ============================================================ */
  fetch('/api/user')
    .then(res => {
      if (!res.ok) throw new Error('Unauthorized');
      return res.json();
    })
    .then(data => {
      const greetingEl = document.querySelector('.sidebar__greeting');
      if (greetingEl && data.user && data.user.fullName) {
        greetingEl.textContent = `Welcome, ${data.user.fullName}!`;
      }
    })
    .catch(() => {
      // Redirect to login if not authenticated
      window.location.href = 'index.html';
    });

  /* ---------- DOM References ---------- */
  const btnProfile   = document.getElementById('btn-profile');
  const btnBell      = document.getElementById('btn-bell');
  const sidebarLeft  = document.getElementById('sidebar-left');
  const sidebarRight = document.getElementById('sidebar-right');
  const overlay      = document.getElementById('overlay');
  const btnLogout    = document.getElementById('menu-logout');
  const btnBack      = document.getElementById('btn-back');

  /* ---------- Sidebar State ---------- */
  let activePanel = null;

  function openPanel(side) {
    closeAllPanels();
    if (side === 'left') {
      sidebarLeft.classList.add('open');
    } else {
      sidebarRight.classList.add('open');
    }
    overlay.classList.add('active');
    activePanel = side;
  }

  function closeAllPanels() {
    sidebarLeft.classList.remove('open');
    sidebarRight.classList.remove('open');
    overlay.classList.remove('active');
    activePanel = null;
  }

  /* ---------- Event Listeners ---------- */

  btnProfile.addEventListener('click', () => {
    activePanel === 'left' ? closeAllPanels() : openPanel('left');
  });

  btnBell.addEventListener('click', () => {
    activePanel === 'right' ? closeAllPanels() : openPanel('right');
  });

  overlay.addEventListener('click', closeAllPanels);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllPanels();
  });

  /* ---------- Sidebar navigation ---------- */
  document.getElementById('menu-profile').addEventListener('click', () => {
    closeAllPanels();
  });

  document.getElementById('menu-room-settings').addEventListener('click', () => {
    closeAllPanels();
  });

  document.getElementById('menu-settlements').addEventListener('click', () => {
    closeAllPanels();
  });

  document.getElementById('menu-app-settings').addEventListener('click', () => {
    closeAllPanels();
  });

  // Help & Support — already on this page, just close sidebar
  document.getElementById('menu-help').addEventListener('click', () => {
    closeAllPanels();
  });

  /* ---------- Logout ---------- */
  btnLogout.addEventListener('click', () => {
    fetch('/api/logout', { method: 'POST' })
      .then(() => { window.location.href = 'index.html'; })
      .catch(() => { window.location.href = 'index.html'; });
  });

  /* ---------- Back Button → Dashboard ---------- */
  btnBack.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });

})();
