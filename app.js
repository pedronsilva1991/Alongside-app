/* ============================================================
   Alongside — Patient Treatment Support App
   app.js (all behaviour lives in this file)

   Four jobs:
   1. Navigation — show one screen at a time, with a Back history
   2. Checklists — tick items and save them
   3. Settings — accessibility toggles that restyle the app
   4. Call modal — the simulated "Call Hospital" overlay
   ============================================================ */

/* ---- 0. Load anything we saved last time ---- */
let saved = {};

try {
  saved = JSON.parse(localStorage.getItem('alongside') || '{}');
} catch (error) {
  saved = {};
}

const state = {
  checks: saved.checks || {},

  settings: saved.settings || {
    large: false,
    dark: false,
    contrast: false
  },

  history: []
};

function save() {
  localStorage.setItem(
    'alongside',
    JSON.stringify({
      checks: state.checks,
      settings: state.settings
    })
  );
}

/* ---- 1. Navigation ---- */
const START_SCREENS = ['welcome', 'disclaimer'];
let current = 'welcome';

function showScreen(id, remember) {
  /*
   * Remember where we were so the Back button works.
   * Do not add the welcome or disclaimer screens to the history.
   */
  if (remember && !START_SCREENS.includes(current)) {
    state.history.push(current);
  }

  current = id;

  /* Show only the requested screen */
  document.querySelectorAll('.screen').forEach(function (screen) {
    screen.classList.toggle('active', screen.id === id);
  });

  /*
   * Hide the header and emergency bar on the opening screens.
   */
  const isStart = START_SCREENS.includes(id);

  const appHeader = document.getElementById('appHeader');
  const backBtn = document.getElementById('backBtn');
  const emergencyBar = document.getElementById('emergencyBar');

  if (appHeader) {
    appHeader.classList.toggle('hidden', isStart);
  }

  if (backBtn) {
    backBtn.classList.toggle('hidden', id === 'home');
  }

  if (emergencyBar) {
    emergencyBar.classList.toggle(
      'hidden',
      isStart || id === 'emergency'
    );
  }

  window.scrollTo(0, 0);
}

/*
 * Any element with data-go="screenId" navigates to that screen
 * when it is clicked.
 */
document.addEventListener('click', function (event) {
  const goElement = event.target.closest('[data-go]');

  if (goElement) {
    showScreen(goElement.dataset.go, true);
  }
});

/* Back button returns to the previous screen */
const backButton = document.getElementById('backBtn');

if (backButton) {
  backButton.addEventListener('click', function () {
    showScreen(state.history.pop() || 'home', false);
  });
}

/* The logo returns to the Welcome screen */
const logoButton = document.getElementById('logoBtn');

if (logoButton) {
  logoButton.addEventListener('click', function () {
    state.history = [];
    showScreen('welcome', false);
  });
}

/* ---- 2. Checklists ---- */
function refreshChecks() {
  document.querySelectorAll('.check').forEach(function (button) {
    const listId = button.dataset.list;
    const itemIndex = Number(button.dataset.i);
    const list = state.checks[listId] || {};
    const isDone = Boolean(list[itemIndex]);

    button.classList.toggle('done', isDone);

    /*
     * Update accessibility information so screen readers can tell
     * whether an item has been selected.
     */
    button.setAttribute('aria-pressed', String(isDone));
  });
}

document.addEventListener('click', function (event) {
  const button = event.target.closest('.check');

  if (!button) {
    return;
  }

  const listId = button.dataset.list;
  const itemIndex = Number(button.dataset.i);

  if (!listId || Number.isNaN(itemIndex)) {
    return;
  }

  if (!state.checks[listId]) {
    state.checks[listId] = {};
  }

  /*
   * Flip the checklist item's current value.
   */
  state.checks[listId][itemIndex] =
    !state.checks[listId][itemIndex];

  save();
  refreshChecks();
});

/* ---- 3. Accessibility settings ---- */
function applySettings() {
  /*
   * CSS does the visual work using:
   * html.large
   * html.dark
   * html.contrast
   */
  ['large', 'dark', 'contrast'].forEach(function (key) {
    const isEnabled = Boolean(state.settings[key]);

    document.documentElement.classList.toggle(key, isEnabled);

    const row = document.querySelector(
      '[data-setting="' + key + '"]'
    );

    if (row) {
      row.classList.toggle('on', isEnabled);
      row.setAttribute('aria-pressed', String(isEnabled));
    }
  });
}

document.addEventListener('click', function (event) {
  const row = event.target.closest('[data-setting]');

  if (!row) {
    return;
  }

  const key = row.dataset.setting;

  if (!Object.prototype.hasOwnProperty.call(state.settings, key)) {
    return;
  }

  state.settings[key] = !state.settings[key];

  save();
  applySettings();
});

/* ---- 4. Simulated call ---- */
const callButton = document.getElementById('callBtn');
const endCallButton = document.getElementById('endCallBtn');
const callModal = document.getElementById('callModal');

if (callButton && callModal) {
  callButton.addEventListener('click', function () {
    callModal.classList.remove('hidden');
    callModal.setAttribute('aria-hidden', 'false');
  });
}

if (endCallButton && callModal) {
  endCallButton.addEventListener('click', function () {
    callModal.classList.add('hidden');
    callModal.setAttribute('aria-hidden', 'true');
  });
}

/*
 * Allow the user to close the call modal using the Escape key.
 */
document.addEventListener('keydown', function (event) {
  if (
    event.key === 'Escape' &&
    callModal &&
    !callModal.classList.contains('hidden')
  ) {
    callModal.classList.add('hidden');
    callModal.setAttribute('aria-hidden', 'true');
  }
});

/* ---- 5. Start the app ---- */
applySettings();
refreshChecks();
showScreen('welcome', false);