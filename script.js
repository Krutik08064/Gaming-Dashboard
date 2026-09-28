/**
 * NEXUS GAMING DASHBOARD - INTERACTIVE JAVASCRIPT ENGINE
 * Pure Vanilla JavaScript (ES6+) with zero external dependencies.
 * Features:
 * - Live real-time clock & date
 * - Game search & category filtering
 * - Play button launch notifications with Web Audio sound synthesis
 * - Achievement detail modal viewer
 * - Dark & light mode switcher with persistent localStorage
 * - Responsive mobile drawer toggle & backdrop
 * - Notification dropdown & mark-read handler
 * - Active navigation indicator
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==========================================================================
     1. DOM SELECTORS
     ========================================================================== */
  const sidebar = document.getElementById('sidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const openSidebarBtn = document.getElementById('openSidebarBtn');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');
  const navLinks = document.querySelectorAll('.nav-link');

  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const htmlElement = document.documentElement;

  const clockTime = document.getElementById('clockTime');
  const clockDate = document.getElementById('clockDate');

  const gameSearchInput = document.getElementById('gameSearchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const gamesGrid = document.getElementById('gamesGrid');
  const gameCards = document.querySelectorAll('.game-card');
  const noGamesFound = document.getElementById('noGamesFound');
  const resetSearchBtn = document.getElementById('resetSearchBtn');
  const filterPills = document.querySelectorAll('.filter-pill');

  const playButtons = document.querySelectorAll('.play-game-btn');
  const quickLaunchBtn = document.getElementById('quickLaunchBtn');
  const browseStoreBtn = document.getElementById('browseStoreBtn');
  const toastContainer = document.getElementById('toastContainer');

  const notificationBtn = document.getElementById('notificationBtn');
  const notificationPanel = document.getElementById('notificationPanel');
  const notifBadge = document.getElementById('notifBadge');
  const markAllReadBtn = document.getElementById('markAllReadBtn');
  const notificationItems = document.querySelectorAll('.notification-item');

  const achievementCards = document.querySelectorAll('.achievement-card');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalActionBtn = document.getElementById('modalActionBtn');
  const modalBadgeIcon = document.getElementById('modalBadgeIcon');
  const modalTitle = document.getElementById('modalTitle');
  const modalGame = document.getElementById('modalGame');
  const modalDesc = document.getElementById('modalDesc');
  const modalStatus = document.getElementById('modalStatus');
  const modalXp = document.getElementById('modalXp');

  const settingsSection = document.getElementById('settings');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const ambientToggle = document.getElementById('ambientToggle');
  const soundToggle = document.getElementById('soundToggle');
  const refreshActivityBtn = document.getElementById('refreshActivityBtn');
  const ambientGlows = document.querySelectorAll('.ambient-glow');

  /* ==========================================================================
     2. AUDIO SYNTHESIZER (OPTIONAL SOUND FX)
     ========================================================================== */
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function playCyberSound(type = 'click') {
    if (!soundToggle || !soundToggle.checked) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'launch') {
        // Sci-Fi power up chirp
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'achievement') {
        // High dual-tone triumph chime
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else {
        // Quick subtle click
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch (e) {
      // Audio might be blocked by browser autoplay policy before user gesture
    }
  }

  /* ==========================================================================
     3. LIVE CLOCK & DATE ENGINE
     ========================================================================== */
  function updateLiveClock() {
    const now = new Date();
    
    // Format Time: HH:MM:SS
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    if (clockTime) clockTime.textContent = `${hours}:${minutes}:${seconds}`;

    // Format Date: e.g. "Mon, 28 Sep"
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    if (clockDate) clockDate.textContent = now.toLocaleDateString('en-US', options);
  }
  updateLiveClock();
  setInterval(updateLiveClock, 1000);

  /* ==========================================================================
     4. THEME TOGGLE (DARK / LIGHT MODE WITH LOCALSTORAGE)
     ========================================================================== */
  const savedTheme = localStorage.getItem('nexus_gaming_theme') || 'dark';
  htmlElement.setAttribute('data-theme', savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      htmlElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('nexus_gaming_theme', newTheme);
      playCyberSound('click');

      showToast(
        newTheme === 'dark' ? '🌙 Dark Mode Activated' : '☀️ Light Mode Activated',
        `Switched visual appearance to ${newTheme} theme.`
      );
    });
  }

  /* ==========================================================================
     5. MOBILE SIDEBAR DRAWER TOGGLE
     ========================================================================== */
  function openSidebar() {
    sidebar.classList.add('open');
    sidebarBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (openSidebarBtn) openSidebarBtn.addEventListener('click', openSidebar);
  if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);

  /* ==========================================================================
     6. SIDEBAR NAVIGATION ACTIVE SWITCHING & SECTION SCROLLING
     ========================================================================== */
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('data-target');
      
      // Update active state
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      playCyberSound('click');

      // Check if Settings was clicked
      if (targetId === 'settings') {
        e.preventDefault();
        if (settingsSection) {
          settingsSection.style.display = 'block';
          settingsSection.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        if (settingsSection && targetId !== 'settings') {
          settingsSection.style.display = 'none';
        }
      }

      // Close mobile sidebar if open
      if (window.innerWidth <= 992) {
        closeSidebar();
      }
    });
  });

  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', () => {
      if (settingsSection) settingsSection.style.display = 'none';
      const homeLink = document.querySelector('.nav-link[data-target="home"]');
      if (homeLink) {
        navLinks.forEach(l => l.classList.remove('active'));
        homeLink.classList.add('active');
      }
    });
  }

  /* ==========================================================================
     7. TOAST NOTIFICATION COMPONENT
     ========================================================================== */
  function showToast(title, message, icon = '🚀') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'alert');

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-body">
        <h4 class="toast-title">${title}</h4>
        <p class="toast-message">${message}</p>
      </div>
    `;

    toastContainer.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
      toast.remove();
    }, 4000);
  }

  /* ==========================================================================
     8. PLAY BUTTONS & QUICK LAUNCH HANDLERS
     ========================================================================== */
  playButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const gameName = button.getAttribute('data-game') || 'Game';
      playCyberSound('launch');

      // Visual button feedback
      const originalText = button.innerHTML;
      button.innerHTML = `<span>Connecting...</span>`;
      button.disabled = true;

      showToast(
        `Launching ${gameName}`,
        'Synchronizing cloud saves & loading game shaders...',
        '🎮'
      );

      setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
        showToast(
          `${gameName} Running!`,
          'Game session started in fullscreen mode. Have fun!',
          '⚡'
        );
      }, 1200);
    });
  });

  if (quickLaunchBtn) {
    quickLaunchBtn.addEventListener('click', () => {
      playCyberSound('launch');
      showToast(
        'Quick Launch: Cyber Strike',
        'Rejoining lobby with your squad. Ping: 18ms',
        '🎯'
      );
    });
  }

  if (browseStoreBtn) {
    browseStoreBtn.addEventListener('click', () => {
      playCyberSound('click');
      showToast(
        'Nexus Store Catalog',
        'Connecting to Nexus Game Store... New weekend discounts available!',
        '🛒'
      );
    });
  }

  // Details button mock
  const detailsBtns = document.querySelectorAll('.details-btn');
  detailsBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const gameName = btn.getAttribute('data-game');
      playCyberSound('click');
      showToast(
        `${gameName} Overview`,
        'Latest updates: Patch notes, DLCs and community leaderboards ready.',
        'ℹ️'
      );
    });
  });

  /* ==========================================================================
     9. SEARCH & CATEGORY FILTER ENGINE
     ========================================================================== */
  let activeCategory = 'all';

  function filterGames() {
    const query = gameSearchInput ? gameSearchInput.value.trim().toLowerCase() : '';
    let visibleCount = 0;

    // Toggle clear search button visibility
    if (searchClearBtn) {
      if (query.length > 0) {
        searchClearBtn.classList.add('active');
      } else {
        searchClearBtn.classList.remove('active');
      }
    }

    gameCards.forEach(card => {
      const title = (card.getAttribute('data-title') || '').toLowerCase();
      const genre = (card.getAttribute('data-genre') || '').toLowerCase();

      const matchesSearch = title.includes(query) || genre.includes(query);
      const matchesCategory = activeCategory === 'all' || genre.toLowerCase().includes(activeCategory.toLowerCase());

      if (matchesSearch && matchesCategory) {
        card.style.display = 'flex';
        card.style.animation = 'fadeIn 0.3s ease';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (noGamesFound) {
      if (visibleCount === 0) {
        noGamesFound.style.display = 'block';
      } else {
        noGamesFound.style.display = 'none';
      }
    }
  }

  if (gameSearchInput) {
    gameSearchInput.addEventListener('input', filterGames);
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      gameSearchInput.value = '';
      filterGames();
      gameSearchInput.focus();
    });
  }

  if (resetSearchBtn) {
    resetSearchBtn.addEventListener('click', () => {
      if (gameSearchInput) gameSearchInput.value = '';
      activeCategory = 'all';
      filterPills.forEach(p => p.classList.remove('active'));
      const allPill = document.querySelector('.filter-pill[data-filter="all"]');
      if (allPill) allPill.classList.add('active');
      filterGames();
    });
  }

  // Keyboard shortcut '/' to search
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== gameSearchInput) {
      e.preventDefault();
      if (gameSearchInput) {
        gameSearchInput.focus();
        gameSearchInput.select();
      }
    } else if (e.key === 'Escape') {
      closeModal();
      closeSidebar();
      if (notificationPanel) notificationPanel.classList.remove('open');
    }
  });

  // Filter Pills Handling
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.getAttribute('data-filter') || 'all';
      playCyberSound('click');
      filterGames();
    });
  });

  /* ==========================================================================
     10. ACHIEVEMENTS MODAL COMPONENT
     ========================================================================== */
  function openAchievementModal(card) {
    const title = card.getAttribute('data-title');
    const game = card.getAttribute('data-game');
    const desc = card.getAttribute('data-desc');
    const isUnlocked = card.classList.contains('unlocked');
    const emoji = card.querySelector('.trophy-emoji')?.textContent || '🏆';
    const xpText = card.querySelector('.achieve-xp')?.textContent || '+500 XP';

    modalBadgeIcon.textContent = emoji;
    modalTitle.textContent = title;
    modalGame.textContent = game;
    modalDesc.textContent = desc;
    modalStatus.textContent = isUnlocked ? 'Status: Unlocked 🌟' : 'Status: In Progress ⏳';
    modalStatus.style.color = isUnlocked ? 'var(--neon-green)' : 'var(--neon-purple)';
    modalXp.textContent = `${xpText} Reward`;

    modalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    playCyberSound('achievement');
  }

  function closeModal() {
    if (modalBackdrop) modalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  achievementCards.forEach(card => {
    card.addEventListener('click', () => openAchievementModal(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openAchievementModal(card);
      }
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalActionBtn) modalActionBtn.addEventListener('click', closeModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  /* ==========================================================================
     11. NOTIFICATION DROPDOWN & MANAGEMENT
     ========================================================================== */
  if (notificationBtn && notificationPanel) {
    notificationBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = notificationPanel.classList.toggle('open');
      notificationBtn.setAttribute('aria-expanded', isOpen);
      playCyberSound('click');
    });

    document.addEventListener('click', (e) => {
      if (!notificationPanel.contains(e.target) && !notificationBtn.contains(e.target)) {
        notificationPanel.classList.remove('open');
        notificationBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', () => {
      notificationItems.forEach(item => item.classList.remove('unread'));
      if (notifBadge) {
        notifBadge.style.display = 'none';
      }
      playCyberSound('click');
      showToast('Notifications Cleared', 'All incoming alerts marked as read.', '✅');
    });
  }

  /* ==========================================================================
     12. SETTINGS TOGGLES & INTERACTION
     ========================================================================== */
  if (ambientToggle) {
    ambientToggle.addEventListener('change', () => {
      const show = ambientToggle.checked;
      ambientGlows.forEach(glow => {
        glow.style.opacity = show ? '0.18' : '0';
      });
      showToast('Ambient Lighting', show ? 'Neon energy glow enabled' : 'Ambient glow disabled for performance');
    });
  }

  if (refreshActivityBtn) {
    refreshActivityBtn.addEventListener('click', () => {
      playCyberSound('click');
      refreshActivityBtn.style.transform = 'rotate(180deg)';
      setTimeout(() => {
        refreshActivityBtn.style.transform = 'rotate(0deg)';
        showToast('Activity Refreshed', 'Telemetry synced with Nexus servers.', '🔄');
      }, 300);
    });
  }

  // Profile Chip Click Feedback
  const profileChip = document.getElementById('profileChip');
  if (profileChip) {
    profileChip.addEventListener('click', () => {
      playCyberSound('click');
      showToast('Profile: VortexRider', 'Tier: Diamond Elite • Rank: #1,420 Global', '🛡️');
    });
  }

  console.log('%c NEXUS GAMING OS %c v2.4.0 Initialized Successfully ', 'background: #00f2fe; color: #000; font-weight: bold; border-radius: 3px 0 0 3px;', 'background: #a855f7; color: #fff; font-weight: bold; border-radius: 0 3px 3px 0;');
});
