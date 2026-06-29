/* ============================================================
   Nestrox — Dashboard Logic
   ============================================================ */

(function () {
  'use strict';

  /* ---------- DOM References ---------- */
  const btnProfile  = document.getElementById('btn-profile');
  const btnBell     = document.getElementById('btn-bell');
  const sidebarLeft = document.getElementById('sidebar-left');
  const sidebarRight = document.getElementById('sidebar-right');
  const overlay     = document.getElementById('overlay');
  const btnLogout   = document.getElementById('menu-logout');

  /* ---------- Sidebar State ---------- */
  let activePanel = null; // 'left' | 'right' | null

  function openPanel(side) {
    // Close any currently open panel first
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

  // Profile icon → open left sidebar
  btnProfile.addEventListener('click', () => {
    if (activePanel === 'left') {
      closeAllPanels();
    } else {
      openPanel('left');
    }
  });

  // Bell icon → open right notification panel
  btnBell.addEventListener('click', () => {
    if (activePanel === 'right') {
      closeAllPanels();
    } else {
      openPanel('right');
    }
  });

  // Overlay click → close everything
  overlay.addEventListener('click', closeAllPanels);

  // Escape key → close panels
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllPanels();
  });

  // Logout → go back to login page
  btnLogout.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  /* ---------- Sidebar menu item clicks (placeholder) ---------- */
  const menuItems = document.querySelectorAll('.sidebar__item:not(#menu-logout)');
  menuItems.forEach((item) => {
    item.addEventListener('click', () => {
      closeAllPanels();
    });
  });

  /* ---------- Card clicks (placeholder) ---------- */
  const cards = document.querySelectorAll('.card');
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      // Future: navigate to respective screens
    });
  });

})();
