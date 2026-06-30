/* ============================================================
   Nestrox — Dashboard Logic
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     Session Auth Guard (API-based)
     ============================================================ */
  let currentUser = {};
  let activeRoom = null;

  // Fetch current room details for the logged-in user
  function fetchCurrentRoom() {
    fetch('/api/rooms/current')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.room) {
          activeRoom = data.room;
          updateRoomUI(data.room);
        } else {
          activeRoom = null;
          updateRoomUI(null);
        }
      })
      .catch(err => {
        console.error('Error fetching current room:', err);
      });
  }

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

      // Load room state
      fetchCurrentRoom();
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


  /* ---------- Room Options Modal DOM References ---------- */
  const cardRoom        = document.getElementById('card-room');
  const roomBackdrop    = document.getElementById('room-modal-backdrop');
  const roomModalClose  = document.getElementById('room-modal-close');
  const roomModal       = document.getElementById('room-modal');

  // Room Views
  const viewOptions     = document.getElementById('room-view-options');
  const viewJoin        = document.getElementById('room-view-join');
  const viewCreate      = document.getElementById('room-view-create');
  const viewDetails     = document.getElementById('room-view-details');

  // Create Room View Elements
  const generatedCode   = document.getElementById('generated-room-code');
  const crNameInput     = document.getElementById('cr-room-name');
  const crNameHint      = document.getElementById('cr-name-hint');
  const crNameError     = document.getElementById('cr-name-error');
  const crDescInput     = document.getElementById('cr-room-desc');
  const crDescHint      = document.getElementById('cr-desc-hint');
  const crForm          = document.getElementById('create-room-form');

  // Room Details View Elements
  const detailsName     = document.getElementById('details-room-name');
  const detailsCode     = document.getElementById('details-room-code');
  const detailsMax      = document.getElementById('details-room-max');
  const detailsDesc     = document.getElementById('details-room-desc');
  const btnLeaveRoom    = document.getElementById('btn-leave-room');

  function openRoomModal() {
    roomBackdrop.classList.add('open');
    roomModalClose.focus();
    
    // Determine which view to show
    if (activeRoom) {
      showDetailsView(activeRoom);
    } else {
      showOptionsView();
    }
  }

  function closeRoomModal() {
    roomBackdrop.classList.remove('open');
    // Always reset to the options/details view when the modal is closed
    setTimeout(() => {
      if (activeRoom) {
        showDetailsView(activeRoom);
      } else {
        showOptionsView();
      }
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

  // Helpers for Room details
  function showDetailsView(room) {
    viewOptions.classList.add('room-modal__view--hidden');
    viewCreate.classList.add('room-modal__view--hidden');
    viewJoin.classList.add('room-modal__view--hidden');
    viewDetails.classList.remove('room-modal__view--hidden');
    
    roomModal.classList.remove('room-modal--wide');

    detailsName.textContent = room.name;
    detailsCode.textContent = room.code;
    detailsMax.textContent = `${room.roommates.length} / ${room.max_roommates}`;
    detailsDesc.textContent = room.description || 'No description provided.';
  }

  /** Generate a random 6-char uppercase alphanumeric code. */
  function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /** Show the Create Room form view. */
  function showCreateView() {
    viewOptions.classList.add('room-modal__view--hidden');
    viewCreate.classList.remove('room-modal__view--hidden');
    viewCreate.style.animation = 'none';
    void viewCreate.offsetWidth;
    viewCreate.style.animation = '';
    // Widen modal to fit the form
    roomModal.classList.add('room-modal--wide');
    // Fresh room code every time the view opens
    generatedCode.textContent = generateRoomCode();
    crNameInput.focus();
  }

  /** Reset and hide the Create Room form, return to options. */
  function hideCreateView() {
    viewCreate.classList.add('room-modal__view--hidden');
    viewOptions.classList.remove('room-modal__view--hidden');
    viewOptions.style.animation = 'none';
    void viewOptions.offsetWidth;
    viewOptions.style.animation = '';
    roomModal.classList.remove('room-modal--wide');
    resetCreateForm();
  }
  /** Reset all create-room form fields and error states. */
  function resetCreateForm() {
    crForm.reset();
    crNameHint.textContent = '0 / 12';
    crNameHint.className = 'cr-char-hint';
    crDescHint.textContent = '0 / 30';
    crDescHint.className = 'cr-char-hint';
    crNameError.textContent = '';
    crNameError.classList.remove('visible');
    crNameInput.classList.remove('input--invalid');
    generatedCode.textContent = '——————';
    // Reset custom dropdown to 4
    const defaultVal = 4;
    const triggerVal = document.getElementById('cr-select-trigger-value');
    if (triggerVal) {
      triggerVal.textContent = String(defaultVal);
    }
    const hiddenSelect = document.getElementById('cr-max-roommates');
    if (hiddenSelect) {
      hiddenSelect.value = defaultVal;
    }
    
    const dropdownOptions = document.querySelectorAll('.cr-select-option');
    dropdownOptions.forEach(opt => {
      if (opt.getAttribute('data-value') === String(defaultVal)) {
        opt.classList.add('cr-select-option--selected');
        opt.setAttribute('aria-selected', 'true');
      } else {
        opt.classList.remove('cr-select-option--selected');
        opt.removeAttribute('aria-selected');
      }
    });
  }

  /* ---------- Custom Dropdown Listbox Logic ---------- */
  const crDropdown = document.getElementById('cr-max-roommates-dropdown');
  const crTrigger  = document.getElementById('cr-select-trigger');
  const crHiddenSelect = document.getElementById('cr-max-roommates');
  const crTriggerValue = document.getElementById('cr-select-trigger-value');
  const crOptionsList = document.querySelectorAll('.cr-select-option');

  function toggleDropdown() {
    const isOpen = crDropdown.classList.contains('open');
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }

  function openDropdown() {
    crDropdown.classList.add('open');
    crTrigger.setAttribute('aria-expanded', 'true');
    // Scroll the selected option into view if possible
    const selectedOpt = crDropdown.querySelector('.cr-select-option--selected');
    if (selectedOpt) {
      selectedOpt.scrollIntoView({ block: 'nearest' });
    }
  }

  function closeDropdown() {
    crDropdown.classList.remove('open');
    crTrigger.setAttribute('aria-expanded', 'false');
    crTrigger.focus();
  }

  function selectOption(optionEl) {
    const val = optionEl.getAttribute('data-value');
    const txt = optionEl.textContent.trim();
    
    // Update trigger text and native hidden select
    crTriggerValue.textContent = txt;
    crHiddenSelect.value = val;
    
    // Update highlight class and accessibility attrs
    crOptionsList.forEach(opt => {
      opt.classList.remove('cr-select-option--selected');
      opt.removeAttribute('aria-selected');
    });
    optionEl.classList.add('cr-select-option--selected');
    optionEl.setAttribute('aria-selected', 'true');
    
    closeDropdown();
  }

  crTrigger.addEventListener('click', toggleDropdown);

  crOptionsList.forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      selectOption(opt);
    });
    
    // Support tabIndex for accessibility focus
    opt.setAttribute('tabindex', '-1');
  });

  // Click outside to close
  document.addEventListener('click', (e) => {
    if (crDropdown && !crDropdown.contains(e.target)) {
      crDropdown.classList.remove('open');
      crTrigger.setAttribute('aria-expanded', 'false');
    }
  });

  // Keyboard navigation
  crDropdown.addEventListener('keydown', (e) => {
    const isOpen = crDropdown.classList.contains('open');
    const optionsArr = Array.from(crOptionsList);
    const activeIndex = optionsArr.findIndex(opt => opt.classList.contains('cr-select-option--selected'));
    
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        openDropdown();
        return;
      }
      let nextIndex = activeIndex;
      if (e.key === 'ArrowDown') {
        nextIndex = (activeIndex + 1) % optionsArr.length;
      } else if (e.key === 'ArrowUp') {
        nextIndex = (activeIndex - 1 + optionsArr.length) % optionsArr.length;
      }
      
      optionsArr.forEach(opt => {
        opt.classList.remove('cr-select-option--selected');
        opt.removeAttribute('aria-selected');
      });
      optionsArr[nextIndex].classList.add('cr-select-option--selected');
      optionsArr[nextIndex].setAttribute('aria-selected', 'true');
      optionsArr[nextIndex].scrollIntoView({ block: 'nearest' });
      
      // Update value
      crTriggerValue.textContent = optionsArr[nextIndex].textContent.trim();
      crHiddenSelect.value = optionsArr[nextIndex].getAttribute('data-value');
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isOpen) {
        const currentSel = optionsArr[activeIndex];
        if (currentSel) {
          selectOption(currentSel);
        }
      } else {
        openDropdown();
      }
    } else if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault();
        closeDropdown();
      }
    }
  });

  /** Update a character counter hint element. */
  function updateCharHint(hint, current, max) {
    hint.textContent = `${current} / ${max}`;
    hint.className = 'cr-char-hint';
    if (current >= max)        hint.classList.add('cr-char-hint--full');
    else if (current >= max * 0.75) hint.classList.add('cr-char-hint--near');
  }

  // "Create a Room" button → open create form view
  document.getElementById('btn-create-room').addEventListener('click', () => {
    showCreateView();
  });

  // Back button inside create view → return to options
  document.getElementById('btn-back-from-create').addEventListener('click', hideCreateView);

  // Live character counters
  crNameInput.addEventListener('input', () => {
    updateCharHint(crNameHint, crNameInput.value.length, 12);
    // Clear error as user types
    if (crNameError.classList.contains('visible')) {
      crNameError.classList.remove('visible');
      crNameInput.classList.remove('input--invalid');
    }
  });

  crDescInput.addEventListener('input', () => {
    updateCharHint(crDescHint, crDescInput.value.length, 30);
  });

  // Form submission — validate then hand off
  crForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = crNameInput.value.trim();
    if (!name) {
      crNameError.textContent = 'Room name is required.';
      crNameError.classList.add('visible');
      crNameInput.classList.add('input--invalid');
      setTimeout(() => crNameInput.classList.remove('input--invalid'), 350);
      crNameInput.focus();
      return;
    }
    const roomData = {
      name,
      description : crDescInput.value.trim(),
      maxRoommates: parseInt(document.getElementById('cr-max-roommates').value, 10)
    };

    const submitBtn = document.getElementById('btn-confirm-create');
    submitBtn.disabled = true;

    fetch('/api/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(roomData)
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(data => { throw new Error(data.error || 'Failed to create room.'); });
      }
      return res.json();
    })
    .then(data => {
      submitBtn.disabled = false;
      if (data.success && data.room) {
        activeRoom = data.room;
        updateRoomUI(data.room);
        clearHints();
        closeRoomModal();
        resetCreateForm();
      }
    })
    .catch(err => {
      submitBtn.disabled = false;
      crNameError.textContent = err.message;
      crNameError.classList.add('visible');
      crNameInput.classList.add('input--invalid');
      setTimeout(() => crNameInput.classList.remove('input--invalid'), 350);
      crNameInput.focus();
    });
  });

  /* ---------- Join Room — view switching & validation ---------- */

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
    viewCreate.classList.add('room-modal__view--hidden');
    viewDetails.classList.add('room-modal__view--hidden');
    viewOptions.classList.remove('room-modal__view--hidden');
    // Restart animation for options view too
    viewOptions.style.animation = 'none';
    void viewOptions.offsetWidth;
    viewOptions.style.animation = '';
    // Restore default modal width
    roomModal.classList.remove('room-modal--wide');
    resetJoinInput();
    resetCreateForm();
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
      showJoinError('Please enter a valid 6-character room code.');
      roomCodeInput.focus();
      return;
    }

    const joinBtn = document.getElementById('btn-confirm-join');
    joinBtn.disabled = true;

    fetch('/api/rooms/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code })
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(data => { throw new Error(data.error || 'Failed to join room.'); });
      }
      return res.json();
    })
    .then(data => {
      joinBtn.disabled = false;
      if (data.success && data.room) {
        activeRoom = data.room;
        updateRoomUI(data.room);
        clearHints();
        closeRoomModal();
        resetJoinInput();
      }
    })
    .catch(err => {
      joinBtn.disabled = false;
      showJoinError(err.message);
      roomCodeInput.focus();
    });
  });

  // Leave Room button
  btnLeaveRoom.addEventListener('click', () => {
    if (!confirm('Are you sure you want to leave this room?')) {
      return;
    }

    btnLeaveRoom.disabled = true;

    fetch('/api/rooms/leave', { method: 'POST' })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.error || 'Failed to leave room.'); });
        }
        return res.json();
      })
      .then(data => {
        btnLeaveRoom.disabled = false;
        activeRoom = null;
        updateRoomUI(null);
        closeRoomModal();
        window.location.href = 'dashboard.html';
      })
      .catch(err => {
        btnLeaveRoom.disabled = false;
        alert(err.message);
      });
  });

  // Function to update main page UI based on active room
  function updateRoomUI(room) {
    const cardTitle = document.querySelector('#card-room .card__title');
    const cardPlus = document.querySelector('#card-room .card__plus');
    const hintMembers = document.getElementById('hint-members');
    const hintExpenses = document.getElementById('hint-expenses');

    if (room) {
      cardTitle.textContent = room.name;
      cardPlus.textContent = room.code;
      cardPlus.style.fontSize = '1rem';
      cardPlus.style.fontWeight = '700';
      cardPlus.style.color = '#7c3aed';
      cardPlus.style.transform = 'none';
      cardPlus.style.background = 'rgba(124, 58, 237, 0.08)';
      cardPlus.style.padding = '4px 10px';
      cardPlus.style.borderRadius = '6px';

      if (hintMembers) hintMembers.style.display = 'none';
      if (hintExpenses) hintExpenses.style.display = 'none';
    } else {
      cardTitle.textContent = 'Create / Join Room';
      cardPlus.textContent = '+';
      cardPlus.style.fontSize = '';
      cardPlus.style.fontWeight = '';
      cardPlus.style.color = '';
      cardPlus.style.transform = '';
      cardPlus.style.background = '';
      cardPlus.style.padding = '';
      cardPlus.style.borderRadius = '';

      if (hintMembers) hintMembers.style.display = 'block';
      if (hintExpenses) hintExpenses.style.display = 'block';
    }
  }

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
    if (!activeRoom) {
      showHint('hint-members');
    }
  });

  // Show hint when Add Expenses is clicked without a room
  document.getElementById('card-expenses').addEventListener('click', () => {
    if (!activeRoom) {
      showHint('hint-expenses');
    }
  });

})();
