/* ============================================================
   Nestrox — Dashboard Logic
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     Session Auth Guard (API-based)
     ============================================================ */
  let currentUser = {};

  // Fetch current user session details
  fetch('/api/user')
    .then(res => {
      if (!res.ok) {
        throw new Error('Unauthorized');
      }
      return res.json();
    })
    .then(data => {
      currentUser = data.user;
      
      // Set personalized welcome greeting
      const greetingEl = document.querySelector('.sidebar__greeting');
      if (greetingEl && currentUser.fullName) {
        greetingEl.textContent = `Welcome, ${currentUser.fullName}!`;
      }
    })
    .catch(err => {
      // Redirect to login if unauthorized
      window.location.href = 'index.html';
    });

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

  // Logout → clear server session and go back to login page
  btnLogout.addEventListener('click', () => {
    fetch('/api/logout', { method: 'POST' })
      .then(() => {
        window.location.href = 'index.html';
      })
      .catch(() => {
        window.location.href = 'index.html';
      });
  });

  /* ---------- Sidebar menu item clicks ---------- */
  ['menu-profile', 'menu-room-settings', 'menu-settlements', 'menu-app-settings'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', () => closeAllPanels());
  });

  // Help & Support → navigate to dedicated page
  document.getElementById('menu-help').addEventListener('click', () => {
    closeAllPanels();
    window.location.href = 'help.html';
  });


  /* ---------- Room Options Modal ---------- */
  const cardRoom        = document.getElementById('card-room');
  const roomBackdrop    = document.getElementById('room-modal-backdrop');
  const roomModalClose  = document.getElementById('room-modal-close');

  function openRoomModal() {
    roomBackdrop.classList.add('open');
    roomModalClose.focus();
  }

  function closeRoomModal() {
    roomBackdrop.classList.remove('open');
    // Always reset to the options view when the modal is closed
    setTimeout(() => {
      showOptionsView();
    }, 300); // wait for the close animation to finish
  }

  // Open modal when "Create / Join Room" card is clicked
  cardRoom.addEventListener('click', openRoomModal);

  // Close via × button
  roomModalClose.addEventListener('click', closeRoomModal);

  // Close when clicking outside the modal card
  roomBackdrop.addEventListener('click', (e) => {
    if (e.target === roomBackdrop) closeRoomModal();
  });

  // Escape key closes modal too
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllPanels();
      closeRoomModal();
    }
  });

  // Create Room → placeholder (future implementation)
  document.getElementById('btn-create-room').addEventListener('click', () => {
    clearHints();
    closeRoomModal();
  });

  /* ---------- Join Room — view switching & validation ---------- */
  const viewOptions     = document.getElementById('room-view-options');
  const viewJoin        = document.getElementById('room-view-join');
  const roomCodeInput   = document.getElementById('room-code-input');
  const joinError       = document.getElementById('join-room-error');
  const btnBackToOpts   = document.getElementById('btn-back-to-options');

  /** Show the join-room input view. */
  function showJoinView() {
    viewOptions.classList.add('room-modal__view--hidden');
    viewJoin.classList.remove('room-modal__view--hidden');
    // Restart the slide-in animation
    viewJoin.style.animation = 'none';
    void viewJoin.offsetWidth; // reflow
    viewJoin.style.animation = '';
    roomCodeInput.focus();
  }

  /** Return to the options view and reset the input. */
  function showOptionsView() {
    viewJoin.classList.add('room-modal__view--hidden');
    viewOptions.classList.remove('room-modal__view--hidden');
    // Restart animation for options view too
    viewOptions.style.animation = 'none';
    void viewOptions.offsetWidth;
    viewOptions.style.animation = '';
    resetJoinInput();
  }

  /** Clear input value and error states. */
  function resetJoinInput() {
    roomCodeInput.value = '';
    roomCodeInput.classList.remove('input--invalid');
    joinError.textContent = '';
    joinError.classList.remove('visible');
  }

  /** Show an inline error on the input. */
  function showJoinError(msg) {
    roomCodeInput.classList.add('input--invalid');
    joinError.textContent = msg;
    joinError.classList.add('visible');
    // Remove the shake class so it can re-trigger
    setTimeout(() => roomCodeInput.classList.remove('input--invalid'), 350);
  }

  // "Join a Room" button → switch to input view
  document.getElementById('btn-join-room').addEventListener('click', () => {
    showJoinView();
  });

  // Back arrow → return to options view
  btnBackToOpts.addEventListener('click', showOptionsView);

  // Allow only uppercase letters and digits; auto-uppercase lowercase input
  roomCodeInput.addEventListener('input', () => {
    roomCodeInput.value = roomCodeInput.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 6);
    // Clear error as the user types
    if (joinError.classList.contains('visible')) {
      joinError.classList.remove('visible');
      joinError.textContent = '';
    }
  });

  // Enter key submits
  roomCodeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('btn-confirm-join').click();
  });

  // Confirm join button → validate then proceed
  document.getElementById('btn-confirm-join').addEventListener('click', () => {
    const code = roomCodeInput.value.trim();
    if (code.length !== 6) {
      showJoinError('Please enter a valid 6-digit room code.');
      roomCodeInput.focus();
      return;
    }
    // ✅ Valid code — hand off to future join logic
    clearHints();
    closeRoomModal();
    // TODO: call join-room API with `code`
  });


  /* ---------- Validation Hints (no room joined yet) ---------- */
  const hintTimers = {};

  /**
   * Shows the hint message below the given card and auto-hides it after 3s.
   * @param {string} hintId  — id of the <p class="card-hint"> element
   */
  function showHint(hintId) {
    // Clear any existing timer for this hint
    clearTimeout(hintTimers[hintId]);

    const hint = document.getElementById(hintId);
    hint.classList.add('visible');

    hintTimers[hintId] = setTimeout(() => {
      hint.classList.remove('visible');
    }, 3000);
  }

  /** Hides all hint messages immediately (called on successful room entry). */
  function clearHints() {
    ['hint-members', 'hint-expenses'].forEach((id) => {
      clearTimeout(hintTimers[id]);
      const hint = document.getElementById(id);
      if (hint) hint.classList.remove('visible');
    });
  }

  // Show hint when Add Members is clicked without a room
  document.getElementById('card-members').addEventListener('click', () => {
    showHint('hint-members');
  });

  // Show hint when Add Expenses is clicked without a room
  document.getElementById('card-expenses').addEventListener('click', () => {
    showHint('hint-expenses');
  });

})();
