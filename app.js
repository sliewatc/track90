import { PLAN_CONFIG, PHASES, NUTRITION, WORKOUTS, FULL_PLAN_MARKDOWN } from './data.js';
import {
  roundToNearest,
  isActiveExerciseBarbell,
  getExerciseWeightStep,
  computePlanDayInfo,
  getMacroTargets,
  getEffectiveExerciseSpec,
  computeRampUpSets,
  computeBarbellPlatesPerSide,
  evaluateDoubleProgression,
  computeRollingAverage,
  evaluateBiweeklyAdjustment,
  getPerfKey,
  getLastPerfEntry,
  estimate1RM,
  computeExerciseTargetHint,
  computeNextSessionDefaults,
  computeWorkoutContextBrief,
  getExerciseHistoryTrail,
  getPriorSwapContext,
  getExercisePrescriptionRationale,
  evaluatePlanAdherence,
  recomputeSessionSummary,
  rebuildLastPerformance,
  getEffectiveWorkouts,
  createPlanVersionSnapshot,
  buildPlanVersionsExport,
  validateBackupState,
  normalizeRestoredState,
  createDefaultRestTimerState,
  normalizeRestTimerState,
  computeRestTimerTick,
  adjustRestTimerState,
  toggleRestTimerPauseState
} from './engine.js';

const STORAGE_KEY = 'recomp_90d_tracker_v1';

const ICONS = {
  check: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  timer: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6"/><path d="m22 6-3-3"/><path d="M12 5V2"/></svg>',
  swap: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 2 21 6 17 10"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 22 3 18 7 14"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
  flame: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
  bolt: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  chevronLeft: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
  chevronRight: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
  chevronDown: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
  note: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  history: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>',
  info: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  close: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  arrowRight: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  sliders: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>',
  volumeOn: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',
  volumeOff: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/></svg>'
};

function icon(name) {
  return ICONS[name] || '';
}

function localTodayIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createInitialState() {
  const today = localTodayIso();
  const info = computePlanDayInfo(today, PLAN_CONFIG.startDate);
  return {
    version: 4,
    theme: 'dark',
    startDate: PLAN_CONFIG.startDate,
    phaseMode: 'auto',
    bonusWk10Manual: null,
    weeklySplitMode: 5,
    hungerTightSwing: false,
    autoStartRestTimer: true,
    restAlertMode: 'chime',
    keepAwake: true,
    trainFocusMode: true,
    calorieAdjustments: { liftingDeltaKcal: 0, restDeltaKcal: 0, stepsFloor: 8000 },
    bankedKcal: 0,
    customWorkouts: null,
    activePlanVersionId: 'v1',
    planVersions: [
      createPlanVersionSnapshot({
        versionNumber: 1,
        workouts: WORKOUTS,
        effectiveDate: PLAN_CONFIG.startDate,
        planDayInfo: { dayNum: 1, weekNum: 1 },
        phase: 'phase1',
        note: 'Initial 90-day baseline plan',
        nutritionConfig: { weeklySplitMode: 5, hungerTightSwing: false }
      })
    ],
    activeTab: 'today',
    lastOpenedDate: today,
    selectedDate: today,
    activeWorkoutId: 'upperA',
    dailyLogs: {},
    swapsBySlot: {},
    exerciseNotes: {},
    lastPerformance: {},
    draftWorkouts: {},
    activeRestTimer: createDefaultRestTimerState(),
    workoutHistory: [],
    weightLogs: [{ date: PLAN_CONFIG.startDate, weight: PLAN_CONFIG.profile.startWeight }],
    waistLogs: [],
    photoLogs: [],
    lastSuggestedDay: info.dayNum
  };
}

function loadState() {
  const base = createInitialState();
  let raw = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw);
    const merged = normalizeRestoredState(parsed, base);
    const today = localTodayIso();
    if (merged.lastOpenedDate !== today) {
      merged.selectedDate = today;
      merged.lastOpenedDate = today;
    }
    return merged;
  } catch {
    if (raw) {
      try {
        localStorage.setItem(`${STORAGE_KEY}_corrupt_backup`, raw);
      } catch {
        // Ignore quota errors
      }
    }
    return base;
  }
}

let state = loadState();
let deferredInstallPrompt = null;
let pendingWeightInput = null;
let pendingWaistInput = null;
let expandedHistoryId = null;
let pendingUndoFn = null;
let lastSavedBanner = null;
let planEditorDraft = null;
let showFullPlanDoc = false;
let justCheckedTarget = null;
let selectedChartIdx = null;
let openWhyByEx = {};

let sharedAudioCtx = null;
let chimeAudioEl = null;
let chimeAudioUnlocked = false;
let chimeWavUrl = null;
let silentWavUrl = null;
let audioSessionResetTimer = null;
let wakeLockSentinel = null;

let timer = normalizeRestTimerState(state.activeRestTimer);
let timerIntervalId = null;

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    showToast('Storage full: export a JSON backup.');
  }
}

let supportsDisplayTransitionCache;
function canTransitionDisplay() {
  if (supportsDisplayTransitionCache !== undefined) return supportsDisplayTransitionCache;
  if (!window.CSS?.supports?.('transition-behavior', 'allow-discrete') || !document.body) {
    return false;
  }
  const probe = document.createElement('div');
  probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
  document.body.appendChild(probe);
  getComputedStyle(probe).display;
  probe.style.display = 'none';
  supportsDisplayTransitionCache = getComputedStyle(probe).display === 'block';
  probe.remove();
  return supportsDisplayTransitionCache;
}

function showAnimatedEl(el) {
  if (!el) return;
  el.removeAttribute('data-closing');
  el.classList.remove('hidden');
}

async function hideAnimatedEl(el) {
  if (!el || el.classList.contains('hidden') || el.hasAttribute('data-closing')) return;
  if (canTransitionDisplay()) {
    el.classList.add('hidden');
    return;
  }
  el.setAttribute('data-closing', '');
  const animations = typeof el.getAnimations === 'function' ? el.getAnimations({ subtree: true }) : [];
  if (animations.length > 0) {
    await Promise.race([
      Promise.allSettled(animations.map((a) => a.finished)),
      new Promise((r) => setTimeout(r, 350))
    ]);
  }
  if (el.hasAttribute('data-closing')) {
    el.removeAttribute('data-closing');
    el.classList.add('hidden');
  }
}

function showToast(msg, undoFn = null) {
  const el = document.getElementById('toast');
  if (!el) return;
  pendingUndoFn = typeof undoFn === 'function' ? undoFn : null;
  el.innerHTML = pendingUndoFn
    ? `<span>${escapeHtml(msg)}</span><button type="button" class="toast-undo-btn" id="toast-undo-btn">Undo</button>`
    : `<span>${escapeHtml(msg)}</span>`;
  showAnimatedEl(el);
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    hideAnimatedEl(el);
    pendingUndoFn = null;
  }, pendingUndoFn ? 6500 : 2600);
}

function getWorkouts() {
  return getEffectiveWorkouts(WORKOUTS, state.customWorkouts);
}

function downloadJsonFile(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function saveNewPlanVersion(nextWorkouts, note = '') {
  const { todayInfo, phase } = getEffectivePhase();
  const nextNum = (state.planVersions || []).reduce((max, v) => Math.max(max, Number(v.versionNumber) || 0), 0) + 1;
  const effective = getEffectiveWorkouts(WORKOUTS, nextWorkouts);
  const snapshot = createPlanVersionSnapshot({
    versionNumber: nextNum,
    workouts: effective,
    effectiveDate: localTodayIso(),
    planDayInfo: todayInfo,
    phase,
    note,
    nutritionConfig: {
      weeklySplitMode: state.weeklySplitMode,
      hungerTightSwing: state.hungerTightSwing,
      calorieAdjustments: { ...(state.calorieAdjustments || {}) }
    }
  });
  state.customWorkouts = effective;
  state.planVersions = [...(state.planVersions || []), snapshot];
  state.activePlanVersionId = snapshot.versionId;
  return snapshot;
}

function getEffectivePhase() {
  const todayInfo = computePlanDayInfo(localTodayIso(), state.startDate);
  const phase = state.phaseMode === 'auto' ? todayInfo.suggestedPhase : state.phaseMode;
  const bonusWk10Sets = state.bonusWk10Manual !== null
    ? state.bonusWk10Manual
    : (phase === 'phase2' && todayInfo.suggestedBonusSets);
  return { todayInfo, phase, bonusWk10Sets };
}

function ensureDailyLog(dateStr) {
  if (!state.dailyLogs[dateStr]) {
    state.dailyLogs[dateStr] = {
      dayType: 'rest',
      meals: {},
      habits: {},
      steps: '',
      sleep: ''
    };
  }
  return state.dailyLogs[dateStr];
}

function buildDefaultSetsForExercise(ex, activeName, workout, phase, bonusWk10Sets, totalSetsOverride = null) {
  const prev = getLastPerfEntry(state.lastPerformance, ex.id, activeName, ex.name);
  const spec = getEffectiveExerciseSpec(ex, {
    phase,
    bonusWk10Sets,
    isOptionalPumpDay: Boolean(workout.isOptionalPumpDay),
    prevWeight: prev?.sets?.[0]?.weight ?? (activeName === ex.name ? ex.defaultWeight : '')
  });
  const count = totalSetsOverride ?? spec.sets;
  return computeNextSessionDefaults(ex, prev, count, {
    phase,
    isDefaultSlot: activeName === ex.name,
    isOptionalPumpDay: Boolean(workout.isOptionalPumpDay),
    deloadSuggestedWeight: spec.deloadSuggestedWeight,
    activeName
  });
}

function ensureWorkoutDraft(workoutId) {
  const workout = getWorkouts()[workoutId];
  const { phase, bonusWk10Sets } = getEffectivePhase();
  if (!state.draftWorkouts[workoutId]) {
    state.draftWorkouts[workoutId] = {
      startedAt: null,
      prehabDone: {},
      prehabSkipped: false,
      rampDone: {},
      rampOpen: {},
      conditioningDone: false,
      conditioningSwapped: false,
      activeExId: workout.exercises[0]?.id || null,
      collapsedExIds: {},
      activeSetIdxByEx: {},
      extraSetsByEx: {},
      sets: {}
    };
  }
  const draft = state.draftWorkouts[workoutId];
  if (!draft.rampDone) draft.rampDone = {};
  if (!draft.rampOpen) draft.rampOpen = {};
  if (!draft.collapsedExIds) draft.collapsedExIds = {};
  if (!draft.activeSetIdxByEx) draft.activeSetIdxByEx = {};
  if (!draft.extraSetsByEx) draft.extraSetsByEx = {};

  for (const ex of workout.exercises) {
    const activeName = state.swapsBySlot[ex.id] || ex.name;
    const extra = draft.extraSetsByEx[ex.id] || 0;
    const spec = getEffectiveExerciseSpec(ex, {
      phase,
      bonusWk10Sets,
      isOptionalPumpDay: Boolean(workout.isOptionalPumpDay)
    });
    const targetCount = spec.sets + extra;
    const targetSets = buildDefaultSetsForExercise(ex, activeName, workout, phase, bonusWk10Sets, targetCount);
    const existing = draft.sets[ex.id] || [];
    let lastDoneIdx = -1;
    for (let i = existing.length - 1; i >= 0; i--) {
      if (existing[i]?.done) {
        lastDoneIdx = i;
        break;
      }
    }
    const finalLen = Math.max(targetSets.length, lastDoneIdx + 1);
    const resized = [];
    for (let i = 0; i < finalLen; i++) {
      resized.push(existing[i] || targetSets[i] || targetSets[targetSets.length - 1]);
    }
    draft.sets[ex.id] = resized;
    if (ex.rampUp && draft.rampOpen[ex.id] === undefined) {
      draft.rampOpen[ex.id] = !resized.some((s) => s.done);
    }
    if (draft.activeSetIdxByEx[ex.id] === undefined || draft.activeSetIdxByEx[ex.id] >= resized.length) {
      const firstPending = resized.findIndex((s) => !s.done);
      draft.activeSetIdxByEx[ex.id] = firstPending >= 0 ? firstPending : 0;
    }
  }
  if (draft.activeExId && !workout.exercises.some((e) => e.id === draft.activeExId)) {
    const firstPendingEx = workout.exercises.find((e) => (draft.sets[e.id] || []).some((s) => !s.done));
    draft.activeExId = firstPendingEx?.id || workout.exercises[0]?.id || null;
  }
  return draft;
}

function getNextSuggestedWorkoutId() {
  const seq = state.weeklySplitMode === 5
    ? ['upperA', 'lowerA', 'upperB', 'lowerB', 'day5']
    : ['upperA', 'lowerA', 'upperB', 'lowerB'];
  if (state.workoutHistory.length === 0) return 'upperA';
  const last = state.workoutHistory[state.workoutHistory.length - 1];
  const idx = seq.indexOf(last.workoutId);
  if (idx === -1) return 'upperA';
  return seq[(idx + 1) % seq.length];
}

function advanceFocusAfterSetLogged(workoutId, exId, loggedSetIdx) {
  const workout = getWorkouts()[workoutId];
  const draft = ensureWorkoutDraft(workoutId);
  const currentEx = workout.exercises.find((e) => e.id === exId);

  const ownNext = draft.sets[exId].findIndex((s, i) => i > loggedSetIdx && !s.done);
  if (ownNext >= 0) {
    draft.activeSetIdxByEx[exId] = ownNext;
  } else {
    const anyPending = draft.sets[exId].findIndex((s) => !s.done);
    draft.activeSetIdxByEx[exId] = anyPending >= 0 ? anyPending : loggedSetIdx;
  }

  let supersetMovedToPartner = false;
  let partnerDisplayName = '';

  if (currentEx?.superset) {
    const group = currentEx.superset[0];
    const partner = workout.exercises.find((e) => e.id !== exId && e.superset && e.superset.startsWith(group));
    if (partner) {
      const partnerSets = draft.sets[partner.id] || [];
      const partnerSameOrNext = partnerSets.findIndex((s, i) => i >= loggedSetIdx && !s.done);
      const partnerAny = partnerSameOrNext >= 0 ? partnerSameOrNext : partnerSets.findIndex((s) => !s.done);
      if (partnerAny >= 0) {
        draft.activeExId = partner.id;
        draft.activeSetIdxByEx[partner.id] = partnerAny;
        // If partner still has that matching set pending (whether user started with *1 or *2), skip rest and go straight to partner
        if (loggedSetIdx < partnerSets.length && !partnerSets[loggedSetIdx]?.done) {
          supersetMovedToPartner = true;
          partnerDisplayName = state.swapsBySlot[partner.id] || partner.name;
        }
        return { supersetMovedToPartner, partnerDisplayName };
      }
    }
  }

  if (draft.sets[exId].some((s) => !s.done)) {
    return { supersetMovedToPartner: false, partnerDisplayName: '' };
  }

  const nextIncomplete = workout.exercises.find((e) => (draft.sets[e.id] || []).some((s) => !s.done));
  if (nextIncomplete) {
    draft.activeExId = nextIncomplete.id;
    const firstPending = draft.sets[nextIncomplete.id].findIndex((s) => !s.done);
    draft.activeSetIdxByEx[nextIncomplete.id] = firstPending >= 0 ? firstPending : 0;
  } else {
    draft.activeExId = null;
  }
  return { supersetMovedToPartner: false, partnerDisplayName: '' };
}

// ---------- Wake Lock, iOS Music-Safe Audio & Persistent Rest Timer ----------
function supportsVibration() {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

function isChimeEnabled() {
  return state.restAlertMode === 'chime' || state.restAlertMode === 'chime_only';
}

function isVibeEnabled() {
  return supportsVibration() && (state.restAlertMode === 'chime' || state.restAlertMode === 'vibe');
}

function setAudioSessionType(type) {
  try {
    if ('audioSession' in navigator && navigator.audioSession) {
      navigator.audioSession.type = type;
    }
  } catch {
    // Ignore unsupported audioSession types
  }
}

function encodeMonoWavBlobUrl(samples, sampleRate = 22050) {
  const numSamples = samples.length;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);
  const writeStr = (offset, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, numSamples * 2, true);
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
}

function getChimeWavUrl() {
  if (chimeWavUrl) return chimeWavUrl;
  const sampleRate = 22050;
  const durationSec = 0.85;
  const totalSamples = Math.floor(sampleRate * durationSec);
  const samples = new Float32Array(totalSamples);
  // Crisp, pleasant two-note gym bell (G5 -> C6) with smooth attack and harmonic clarity to cut through music
  const notes = [
    { start: 0.0, dur: 0.36, freq: 783.99, amp: 0.56 },
    { start: 0.18, dur: 0.62, freq: 1046.5, amp: 0.68 }
  ];
  for (const n of notes) {
    const startIdx = Math.floor(n.start * sampleRate);
    const endIdx = Math.min(totalSamples, Math.floor((n.start + n.dur) * sampleRate));
    for (let i = startIdx; i < endIdx; i++) {
      const t = (i - startIdx) / sampleRate;
      const attack = Math.min(1, t / 0.008);
      const decay = Math.exp(-t * 6.2);
      const env = attack * decay;
      const fundamental = Math.sin(2 * Math.PI * n.freq * t);
      const second = 0.28 * Math.sin(2 * Math.PI * n.freq * 2 * t) * Math.exp(-t * 8);
      const third = 0.1 * Math.sin(2 * Math.PI * n.freq * 3 * t) * Math.exp(-t * 12);
      samples[i] += n.amp * env * (fundamental + second + third);
    }
  }
  // Normalize cleanly to -1.5 dB peak with zero clipping
  let peak = 0;
  for (let i = 0; i < totalSamples; i++) {
    const a = Math.abs(samples[i]);
    if (a > peak) peak = a;
  }
  if (peak > 0.001) {
    const scale = 0.84 / peak;
    for (let i = 0; i < totalSamples; i++) samples[i] *= scale;
  }
  chimeWavUrl = encodeMonoWavBlobUrl(samples, sampleRate);
  return chimeWavUrl;
}

function getSilentWavUrl() {
  if (silentWavUrl) return silentWavUrl;
  const samples = new Float32Array(Math.floor(22050 * 0.04));
  silentWavUrl = encodeMonoWavBlobUrl(samples, 22050);
  return silentWavUrl;
}

async function syncWakeLock() {
  if (!('wakeLock' in navigator)) return;
  const shouldKeepAwake = state.keepAwake
    && (state.activeTab === 'train' || (timer.active && !timer.paused))
    && document.visibilityState === 'visible';
  if (shouldKeepAwake && !wakeLockSentinel) {
    try {
      wakeLockSentinel = await navigator.wakeLock.request('screen');
      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
      });
    } catch {
      // Ignore
    }
  } else if (!shouldKeepAwake && wakeLockSentinel) {
    try {
      await wakeLockSentinel.release();
    } catch {
      // Ignore
    }
    wakeLockSentinel = null;
  }
}

function unlockAudio() {
  try {
    setAudioSessionType('ambient');
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) {
      if (!sharedAudioCtx) sharedAudioCtx = new Ctx();
      if (sharedAudioCtx.state === 'suspended') {
        sharedAudioCtx.resume().catch(() => {});
      }
    }
    if (!chimeAudioEl) {
      chimeAudioEl = new Audio();
      chimeAudioEl.playsInline = true;
      chimeAudioEl.preload = 'auto';
    }
    if (!chimeAudioUnlocked) {
      // Play a 40ms silent WAV under 'ambient' session during user gesture so iOS Safari unlocks
      // unmuted <audio> playback without pausing or ducking Spotify / Apple Music.
      chimeAudioEl.src = getSilentWavUrl();
      chimeAudioEl.volume = 0.01;
      const p = chimeAudioEl.play();
      if (p && typeof p.then === 'function') {
        p.then(() => {
          chimeAudioEl.pause();
          chimeAudioEl.src = getChimeWavUrl();
          chimeAudioEl.volume = 1;
          chimeAudioEl.load();
          chimeAudioUnlocked = true;
        }).catch(() => {
          chimeAudioEl.src = getChimeWavUrl();
          chimeAudioEl.volume = 1;
        });
      }
    }
  } catch {
    // Ignore
  }
}

async function playWebAudioChime(volume = 1.0) {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  if (!sharedAudioCtx) sharedAudioCtx = new Ctx();
  if (sharedAudioCtx.state === 'suspended') {
    await sharedAudioCtx.resume();
  }
  const ctx = sharedAudioCtx;
  const baseVol = Math.max(0.1, Math.min(1, volume)) * 0.52;
  [783.99, 1046.5].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const harm = ctx.createOscillator();
    const gain = ctx.createGain();
    const harmGain = ctx.createGain();
    osc.type = 'sine';
    harm.type = 'sine';
    osc.frequency.value = freq;
    harm.frequency.value = freq * 2;
    const t0 = ctx.currentTime + i * 0.18;
    const dur = i === 0 ? 0.32 : 0.55;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(baseVol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    harmGain.gain.setValueAtTime(0.0001, t0);
    harmGain.gain.linearRampToValueAtTime(baseVol * 0.28, t0 + 0.012);
    harmGain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur * 0.7);
    osc.connect(gain);
    harm.connect(harmGain);
    gain.connect(ctx.destination);
    harmGain.connect(ctx.destination);
    osc.start(t0);
    harm.start(t0);
    osc.stop(t0 + dur + 0.04);
    harm.stop(t0 + dur + 0.04);
  });
}

function scheduleAudioSessionRestore() {
  clearTimeout(audioSessionResetTimer);
  audioSessionResetTimer = setTimeout(() => {
    setAudioSessionType('ambient');
  }, 1150);
}

async function playTimerDoneFeedback({ forceChime = false, volume = 1.0, skipVibe = false } = {}) {
  if (!skipVibe && isVibeEnabled()) {
    try {
      navigator.vibrate([160, 80, 160, 80, 240]);
    } catch {
      // Ignore
    }
  }
  if (!forceChime && !isChimeEnabled()) return;

  // 'transient' briefly ducks background music (Spotify / Apple Music) while the chime plays
  // instead of pausing it, then restores full music volume once reset to 'ambient'.
  setAudioSessionType('transient');
  scheduleAudioSessionRestore();

  try {
    if (!chimeAudioEl) {
      chimeAudioEl = new Audio(getChimeWavUrl());
      chimeAudioEl.playsInline = true;
      chimeAudioEl.preload = 'auto';
    } else if (chimeAudioEl.src !== getChimeWavUrl()) {
      chimeAudioEl.src = getChimeWavUrl();
    }
    chimeAudioEl.muted = false;
    chimeAudioEl.volume = Math.max(0.1, Math.min(1, volume));
    chimeAudioEl.currentTime = 0;
    chimeAudioEl.onended = () => {
      clearTimeout(audioSessionResetTimer);
      setAudioSessionType('ambient');
    };
    await chimeAudioEl.play();
    chimeAudioUnlocked = true;
    return;
  } catch {
    // Fall back to Web Audio API synth
  }

  try {
    await playWebAudioChime(volume);
  } catch {
    // Ignore autoplay errors when blocked
  }
}

function persistRestTimer() {
  state.activeRestTimer = { ...timer };
  saveState();
}

function clearTimerInterval() {
  if (timerIntervalId !== null) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }
}

function ensureTimerInterval() {
  if (timer.active && !timer.paused) {
    if (timerIntervalId === null) {
      timerIntervalId = setInterval(syncTimerTick, 500);
    }
  } else {
    clearTimerInterval();
  }
}

function syncTimerTick() {
  if (!timer.active || timer.paused) {
    clearTimerInterval();
    return;
  }
  const { state: nextTimer, justCompleted, staleCompletion } = computeRestTimerTick(timer, Date.now());
  const changed = nextTimer.remainingSec !== timer.remainingSec
    || nextTimer.paused !== timer.paused
    || nextTimer.completed !== timer.completed;
  timer = nextTimer;
  if (justCompleted) {
    clearTimerInterval();
    persistRestTimer();
    syncWakeLock();
    if (!staleCompletion) {
      playTimerDoneFeedback();
      showToast(`Rest complete: ${timer.label}`);
    }
  }
  if (changed || justCompleted) {
    renderRestDock();
  }
}

function startRestTimer(seconds, label) {
  unlockAudio();
  const totalSec = Math.max(10, Math.round(Number(seconds) || 90));
  timer = {
    active: true,
    paused: false,
    completed: false,
    remainingSec: totalSec,
    totalSec,
    endAtMs: Date.now() + totalSec * 1000,
    label: String(label || 'Rest')
  };
  persistRestTimer();
  ensureTimerInterval();
  syncWakeLock();
  renderRestDock();
}

function adjustRestTimer(delta) {
  unlockAudio();
  const { state: nextTimer, justCompleted } = adjustRestTimerState(timer, delta, Date.now());
  timer = nextTimer;
  persistRestTimer();
  ensureTimerInterval();
  syncWakeLock();
  if (justCompleted) {
    playTimerDoneFeedback();
    showToast(`Rest complete: ${timer.label}`);
  }
  renderRestDock();
}

function toggleRestTimerPause() {
  if (!timer.active) return;
  unlockAudio();
  timer = toggleRestTimerPauseState(timer, Date.now());
  persistRestTimer();
  ensureTimerInterval();
  syncWakeLock();
  renderRestDock();
}

function stopRestTimer() {
  clearTimerInterval();
  timer = createDefaultRestTimerState();
  persistRestTimer();
  syncWakeLock();
  renderRestDock();
}

function formatMMSS(sec) {
  const s = Math.max(0, Math.floor(sec));
  const m = String(Math.floor(s / 60)).padStart(2, '0');
  const rem = String(s % 60).padStart(2, '0');
  return `${m}:${rem}`;
}

function getRestAlertButtonDisplay() {
  if (!supportsVibration()) {
    const on = isChimeEnabled();
    return {
      on,
      iconName: on ? 'volumeOn' : 'volumeOff',
      label: on ? 'Chime On' : 'Muted'
    };
  }
  const map = {
    chime: { on: true, iconName: 'volumeOn', label: 'Chime+Vibe' },
    chime_only: { on: true, iconName: 'volumeOn', label: 'Chime' },
    vibe: { on: true, iconName: 'volumeOff', label: 'Vibe' },
    mute: { on: false, iconName: 'volumeOff', label: 'Muted' }
  };
  return map[state.restAlertMode] || map.chime;
}

function renderRestDock() {
  const dock = document.getElementById('rest-dock');
  if (!dock) return;
  if (!timer.active) {
    hideAnimatedEl(dock);
    document.body.classList.remove('has-rest-dock');
    return;
  }
  const isDone = timer.remainingSec <= 0;
  showAnimatedEl(dock);
  dock.classList.toggle('is-done', isDone);
  dock.classList.toggle('is-paused', timer.paused && !isDone);
  document.body.classList.add('has-rest-dock');

  const prefix = isDone ? 'Rest Complete' : timer.paused ? 'Paused' : 'Rest';
  document.getElementById('rest-ex-name').textContent = `${prefix} · ${timer.label}`;
  document.getElementById('rest-countdown').textContent = isDone ? 'GO!' : formatMMSS(timer.remainingSec);

  const toggleBtn = document.getElementById('rest-toggle');
  if (toggleBtn) {
    toggleBtn.textContent = isDone ? 'Restart' : timer.paused ? 'Resume' : 'Pause';
    toggleBtn.className = `btn btn-sm ${isDone ? 'btn-primary' : 'btn-amber'}`;
  }
  const minusBtn = document.getElementById('rest-minus');
  if (minusBtn) minusBtn.disabled = isDone;

  const alertBtn = document.getElementById('rest-alert-mode');
  if (alertBtn) {
    const disp = getRestAlertButtonDisplay();
    alertBtn.innerHTML = `${icon(disp.iconName)}<span>${disp.label}</span>`;
    alertBtn.className = `btn btn-sm rest-chime-btn ${disp.on ? 'is-on' : 'is-off'}`;
    alertBtn.setAttribute('aria-pressed', String(disp.on));
  }

  const bar = document.getElementById('rest-progress-bar');
  if (bar) {
    const ratio = isDone ? 1 : (timer.totalSec > 0 ? Math.max(0, Math.min(1, timer.remainingSec / timer.totalSec)) : 0);
    bar.style.transform = `scaleX(${ratio.toFixed(4)})`;
    bar.style.background = isDone ? 'var(--success)' : 'var(--amber)';
  }
}

// ---------- Header & Navigation ----------
const THEMES = [
  { id: 'dark', label: 'Black · Lime', bg: '#0c0c0e', accent: '#b8f227' },
  { id: 'slate', label: 'Charcoal · Blue', bg: '#232329', accent: '#8ab4f8' },
  { id: 'espresso', label: 'Brown · Gold', bg: '#181310', accent: '#fbbf24' },
  { id: 'light', label: 'White · Green', bg: '#f4f3ef', accent: '#15803d' },
  { id: 'ice', label: 'White · Blue', bg: '#f8fafc', accent: '#2563eb' },
  { id: 'terracotta', label: 'White · Orange', bg: '#f9f8f6', accent: '#c2410c' },
  { id: 'blush', label: 'White · Pink', bg: '#fdf7f9', accent: '#c81e63' },
  { id: 'pastel', label: 'Pastel · Sky · Berry · Mint · Gold', bg: '#f4f9ff', accent: '#e11d74', multi: ['#f4f9ff', '#e11d74', '#0f766e', '#fde047'] }
];

function normalizeThemeId(id) {
  if (id === 'jetski') return 'slate';
  return THEMES.some((t) => t.id === id) ? id : 'dark';
}

function themeSwatchSvg(themeOrBg, accent, size = 24) {
  if (themeOrBg && Array.isArray(themeOrBg.multi)) {
    const [c1, c2, c3, c4] = themeOrBg.multi;
    return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" aria-hidden="true" style="flex-shrink:0;border-radius:6px;border:1px solid var(--border);display:inline-block;vertical-align:middle;"><rect x="0" y="0" width="10" height="10" fill="${c1}"/><rect x="10" y="0" width="10" height="10" fill="${c2}"/><rect x="0" y="10" width="10" height="10" fill="${c3}"/><rect x="10" y="10" width="10" height="10" fill="${c4}"/></svg>`;
  }
  const bg = typeof themeOrBg === 'object' ? themeOrBg.bg : themeOrBg;
  const ac = typeof themeOrBg === 'object' ? themeOrBg.accent : accent;
  return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" aria-hidden="true" style="flex-shrink:0;border-radius:6px;border:1px solid var(--border);display:inline-block;vertical-align:middle;"><rect x="0" y="0" width="10" height="20" fill="${bg}"/><rect x="10" y="0" width="10" height="20" fill="${ac}"/></svg>`;
}

const CUTE_MASCOT_SVG = '<span class="cute-badge" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 28 28" fill="none"><ellipse cx="10" cy="7" rx="2.6" ry="5.5" transform="rotate(-10 10 7)" fill="#ffffff" stroke="#e11d74" stroke-width="1.5"/><ellipse cx="18" cy="7" rx="2.6" ry="5.5" transform="rotate(10 18 7)" fill="#ffffff" stroke="#e11d74" stroke-width="1.5"/><ellipse cx="10.2" cy="7.3" rx="1.1" ry="3.2" transform="rotate(-10 10.2 7.3)" fill="#fbcfe8"/><ellipse cx="17.8" cy="7.3" rx="1.1" ry="3.2" transform="rotate(10 17.8 7.3)" fill="#fbcfe8"/><circle cx="14" cy="15.5" r="6.5" fill="#ffffff" stroke="#0d9488" stroke-width="1.6"/><circle cx="11.8" cy="14.8" r="0.9" fill="#1f2430"/><circle cx="16.2" cy="14.8" r="0.9" fill="#1f2430"/><ellipse cx="14" cy="16.4" rx="1.1" ry="0.7" fill="#e11d74"/><path d="M12.4 18c.8.8 2.4.8 3.2 0" stroke="#e11d74" stroke-width="1.3" stroke-linecap="round"/><rect x="3" y="21" width="3.5" height="5" rx="1.5" fill="#0d9488"/><rect x="21.5" y="21" width="3.5" height="5" rx="1.5" fill="#0d9488"/><rect x="6.5" y="22.5" width="15" height="2" rx="1" fill="#f59e0b"/></svg></span>';

const CHEER_BUNNY_SVG = '<span class="cute-badge" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><ellipse cx="9" cy="6.5" rx="2.2" ry="4.5" transform="rotate(-8 9 6.5)" fill="#ffffff" stroke="#0d9488" stroke-width="1.4"/><ellipse cx="15" cy="6.5" rx="2.2" ry="4.5" transform="rotate(8 15 6.5)" fill="#ffffff" stroke="#0d9488" stroke-width="1.4"/><circle cx="12" cy="14.5" r="5.5" fill="#ffffff" stroke="#e11d74" stroke-width="1.5"/><circle cx="10.2" cy="14" r="0.8" fill="#1f2430"/><circle cx="13.8" cy="14" r="0.8" fill="#1f2430"/><path d="M10.6 16.4c.7.7 2.1.7 2.8 0" stroke="#e11d74" stroke-width="1.3" stroke-linecap="round"/><path d="M20.5 4.5l.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5z" fill="#f59e0b"/></svg></span>';

const CHEVRON_DOWN_SVG = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';

function renderThemeMenu() {
  const menu = document.getElementById('theme-menu');
  if (!menu) return;
  menu.innerHTML = THEMES.map((t) => {
    const selected = state.theme === t.id;
    return `
      <button type="button" class="theme-option" role="option" aria-selected="${selected}" aria-label="${escapeHtml(t.label)}" title="${escapeHtml(t.label)}" data-theme-option="${t.id}">
        ${themeSwatchSvg(t, null, 30)}
      </button>
    `;
  }).join('');
}

function setThemeMenuOpen(open) {
  const menu = document.getElementById('theme-menu');
  const btn = document.getElementById('theme-btn');
  if (!menu || !btn) return;
  if (open) showAnimatedEl(menu);
  else hideAnimatedEl(menu);
  btn.setAttribute('aria-expanded', String(open));
}

function applyTheme() {
  state.theme = normalizeThemeId(state.theme);
  document.documentElement.setAttribute('data-theme', state.theme);
  const meta = document.getElementById('meta-theme-color');
  const active = THEMES.find((t) => t.id === state.theme) || THEMES[0];
  if (meta) meta.setAttribute('content', active.bg);
  const themeBtn = document.getElementById('theme-btn');
  if (themeBtn) {
    themeBtn.innerHTML = `${themeSwatchSvg(active, null, 22)}${CHEVRON_DOWN_SVG}`;
    themeBtn.title = `Color scheme: ${active.label}`;
  }
  const titleEl = document.querySelector('.brand-title');
  if (titleEl) {
    titleEl.innerHTML = state.theme === 'pastel'
      ? `90-Day Recomp Tracker${CUTE_MASCOT_SVG}`
      : '90-Day Recomp Tracker';
  }
  renderThemeMenu();
}

function renderHeader() {
  const { todayInfo, phase } = getEffectivePhase();
  const phaseInfo = PHASES[phase];
  const headerMeta = document.getElementById('header-meta');
  headerMeta.innerHTML = `
    <span class="tabular">Day ${todayInfo.dayNum}/90 · Wk ${todayInfo.weekNum}</span>
    ${state.phaseMode !== 'auto' ? '<span class="tag tag-warn">Manual</span>' : ''}
  `;

  const phaseBtn = document.getElementById('phase-pill-btn');
  phaseBtn.textContent = phaseInfo.label;
  phaseBtn.className = `btn btn-sm ${phase === 'deload' ? 'tag-info' : phase === 'phase2' ? 'tag-accent' : ''}`;

  document.querySelectorAll('.nav-tab').forEach((btn) => {
    const active = btn.dataset.tab === state.activeTab;
    if (btn.classList.contains('seg-btn')) {
      btn.setAttribute('aria-selected', String(active));
    } else {
      if (active) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    }
  });
}

// ---------- Modals ----------
function openModal(title, html) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = html;
  const backdrop = document.getElementById('modal-backdrop');
  showAnimatedEl(backdrop);
  const sheet = backdrop.querySelector('.modal-sheet');
  if (sheet) sheet.scrollTop = 0;
}

function closeModal() {
  hideAnimatedEl(document.getElementById('modal-backdrop'));
}

function openPhaseModal() {
  const { todayInfo, phase, bonusWk10Sets } = getEffectivePhase();
  const options = [
    { id: 'auto', title: `Auto by Calendar (${PHASES[todayInfo.suggestedPhase].label})`, sub: `Day ${todayInfo.dayNum} · Week ${todayInfo.weekNum}` },
    { id: 'phase1', title: 'Phase 1 (Weeks 1–6)', sub: PHASES.phase1.summary },
    { id: 'deload', title: 'Week 7 Mandatory Deload', sub: PHASES.deload.summary },
    { id: 'phase2', title: 'Phase 2 (Weeks 8–13)', sub: PHASES.phase2.summary }
  ];
  openModal('Training Phase & Volume Mode', `
    <div class="check-list">
      ${options.map((o) => `
        <button type="button" class="check-row ${state.phaseMode === o.id ? 'done' : ''}" data-action="set-phase" data-phase="${o.id}">
          <div>
            <div style="font-weight:700;font-size:0.875rem;">${escapeHtml(o.title)}</div>
            <div class="muted-sm">${escapeHtml(o.sub)}</div>
          </div>
          <span class="check-box">${state.phaseMode === o.id ? icon('check') : ''}</span>
        </button>
      `).join('')}
    </div>
    <div class="divider"></div>
    <button type="button" class="check-row ${bonusWk10Sets ? 'done' : ''}" data-action="toggle-wk10-bonus">
      <div>
        <div style="font-weight:700;font-size:0.875rem;">Weeks 10–13 Bonus +1 Set (Delts &amp; Arms)</div>
        <div class="muted-sm">Adds +1 working set on lateral raises, rear delts, biceps &amp; triceps in Phase 2</div>
      </div>
      <span class="check-box">${bonusWk10Sets ? icon('check') : ''}</span>
    </button>
    <div class="muted-sm" style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border-subtle);">Active effective phase: <strong>${escapeHtml(PHASES[phase].label)}</strong></div>
  `);
}

function openSwapModal(workoutId, exId) {
  const ex = getWorkouts()[workoutId].exercises.find((e) => e.id === exId);
  if (!ex) return;
  const activeName = state.swapsBySlot[exId] || ex.name;
  openModal('1-Tap Exercise Swap', `
    <p class="muted-sm" style="margin:0;">Slot default: <strong>${escapeHtml(ex.name)}</strong> (${ex.sets} × ${ex.repMin}–${ex.repMax}). Each swap remembers its own working weight.</p>
    <div class="check-list">
      ${ex.swaps.map((opt) => {
        const optPerf = getLastPerfEntry(state.lastPerformance, exId, opt, ex.name);
        const optSub = optPerf?.sets?.length
          ? `Last: ${optPerf.sets.map((s) => `${s.weight || 'BW'}×${s.reps}`).join(', ')}`
          : (opt === ex.name && ex.defaultWeight ? `Starting ref: ~${ex.defaultWeight} lbs` : 'No prior log yet');
        return `
          <button type="button" class="check-row ${activeName === opt ? 'done' : ''}" data-action="pick-swap" data-ex="${exId}" data-swap="${escapeHtml(opt)}">
            <div>
              <div style="font-weight:600;font-size:0.875rem;">${escapeHtml(opt)}</div>
              <div class="muted-sm">${escapeHtml(optSub)}</div>
            </div>
            <span class="check-box">${activeName === opt ? icon('check') : ''}</span>
          </button>
        `;
      }).join('')}
    </div>
    <div class="divider"></div>
    <div class="control-group">
      <div class="control-label-row"><span>Custom Swap (added to this slot)</span></div>
      <div class="row-between" style="gap:8px;">
        <input id="custom-swap-input" type="text" class="text-input" placeholder="e.g., Pendulum Squat" />
        <button type="button" class="btn btn-primary" style="flex-shrink:0;min-width:64px;" data-action="add-custom-swap" data-ex="${exId}">Use</button>
      </div>
    </div>
  `);
}

function renderPlanEditorModalBody() {
  if (!planEditorDraft) return '';
  const workout = getWorkouts()[planEditorDraft.workoutId];
  return `
    <p class="muted-sm" style="margin:0;">Customize exercises, sets, reps, rest, or supersets for <strong>${escapeHtml(workout.dayLabel)}</strong>. Saving creates a new versioned plan snapshot.</p>
    <div class="control-group">
      <label class="num-label" for="plan-version-note">Version Change Note (for your model analysis)</label>
      <input id="plan-version-note" type="text" class="text-input" placeholder="e.g., Week 3: Swapped Squat to Hack Squat, +1 lateral raise set" value="${escapeHtml(planEditorDraft.note)}" data-action="editor-note" />
    </div>
    <div class="check-list">
      ${planEditorDraft.exercises.map((ex, idx) => `
        <div class="panel-inset">
          <div class="row-between" style="gap:8px;">
            <span class="tag">#${idx + 1}</span>
            <div class="row-wrap">
              <button type="button" class="btn btn-sm" data-action="editor-move-ex" data-idx="${idx}" data-dir="-1" ${idx === 0 ? 'disabled' : ''}>Up</button>
              <button type="button" class="btn btn-sm" data-action="editor-move-ex" data-idx="${idx}" data-dir="1" ${idx === planEditorDraft.exercises.length - 1 ? 'disabled' : ''}>Down</button>
              <button type="button" class="btn btn-sm btn-ghost" aria-label="Remove exercise" data-action="editor-remove-ex" data-idx="${idx}" ${planEditorDraft.exercises.length <= 1 ? 'disabled' : ''}>${icon('close')}</button>
            </div>
          </div>

          <input type="text" aria-label="Exercise name" class="text-input" value="${escapeHtml(ex.name)}" data-action="editor-field" data-idx="${idx}" data-field="name" />

          <div class="form-grid-3">
            <div class="num-input-wrap">
              <label class="num-label">Sets</label>
              <input type="number" min="1" max="10" inputmode="numeric" class="num-input" value="${ex.sets}" data-action="editor-field" data-idx="${idx}" data-field="sets" />
            </div>
            <div class="num-input-wrap">
              <label class="num-label">Rep Min</label>
              <input type="number" min="1" max="50" inputmode="numeric" class="num-input" value="${ex.repMin}" data-action="editor-field" data-idx="${idx}" data-field="repMin" />
            </div>
            <div class="num-input-wrap">
              <label class="num-label">Rep Max</label>
              <input type="number" min="1" max="50" inputmode="numeric" class="num-input" value="${ex.repMax}" data-action="editor-field" data-idx="${idx}" data-field="repMax" />
            </div>
          </div>

          <div class="form-grid-3">
            <div class="num-input-wrap">
              <label class="num-label">Rest (sec)</label>
              <input type="number" step="15" min="15" max="300" inputmode="numeric" class="num-input" value="${ex.restSec}" data-action="editor-field" data-idx="${idx}" data-field="restSec" />
            </div>
            <div class="num-input-wrap">
              <label class="num-label">Type</label>
              <select class="select-input" data-action="editor-select" data-idx="${idx}" data-field="isCompound">
                <option value="true" ${ex.isCompound ? 'selected' : ''}>Compound (+5)</option>
                <option value="false" ${!ex.isCompound ? 'selected' : ''}>Isolation (+2.5)</option>
              </select>
            </div>
            <div class="num-input-wrap">
              <label class="num-label">Superset</label>
              <select class="select-input" data-action="editor-select" data-idx="${idx}" data-field="superset">
                <option value="" ${!ex.superset ? 'selected' : ''}>None</option>
                <option value="A1" ${ex.superset === 'A1' ? 'selected' : ''}>A1</option>
                <option value="A2" ${ex.superset === 'A2' ? 'selected' : ''}>A2</option>
                <option value="B1" ${ex.superset === 'B1' ? 'selected' : ''}>B1</option>
                <option value="B2" ${ex.superset === 'B2' ? 'selected' : ''}>B2</option>
              </select>
            </div>
          </div>

          <div class="row-between" style="gap:8px;flex-wrap:wrap;">
            <button type="button" class="btn btn-sm ${ex.leftFirst ? 'tag-info' : ''}" data-action="editor-toggle-left" data-idx="${idx}">
              ${ex.leftFirst ? `${icon('check')} Left Arm First` : 'Left Arm First: Off'}
            </button>
            <input type="text" aria-label="Form cue or note" class="text-input" style="flex:1;min-width:160px;" placeholder="Form cue / swap note" value="${escapeHtml(ex.note || '')}" data-action="editor-field" data-idx="${idx}" data-field="note" />
          </div>
        </div>
      `).join('')}
    </div>
    <div class="row-between" style="gap:8px;flex-wrap:wrap;">
      <button type="button" class="btn" data-action="editor-add-ex">+ Add Exercise</button>
      <button type="button" class="btn btn-primary" data-action="editor-save-plan">Save as Plan v${(state.planVersions || []).length + 1}</button>
    </div>
  `;
}

function openPlanEditorModal(workoutId) {
  const workout = getWorkouts()[workoutId];
  if (!workout) return;
  planEditorDraft = {
    workoutId,
    note: '',
    exercises: structuredClone(workout.exercises)
  };
  openModal(`Edit ${workout.shortName}`, renderPlanEditorModalBody());
}

function openWorkoutSettingsModal() {
  const hasVibe = supportsVibration();
  const chimeOn = isChimeEnabled();
  const alertOptions = hasVibe
    ? [
        { id: 'chime', label: 'Chime + Vibration', sub: 'Plays chime over music + vibrates' },
        { id: 'chime_only', label: 'Chime Only', sub: 'Ducks music briefly for chime without vibrating' },
        { id: 'vibe', label: 'Vibration Only', sub: 'Silent audio — vibrates when rest ends' },
        { id: 'mute', label: 'Muted (Visual Only)', sub: 'Shows GO! on screen without sound or vibration' }
      ]
    : [
        { id: 'chime', label: 'Chime On (Music-Safe)', sub: 'Plays a crisp chime that ducks music briefly without pausing it', selected: chimeOn },
        { id: 'mute', label: 'Muted (Visual Only)', sub: 'No sound — dock highlights GO! when rest ends', selected: !chimeOn }
      ];
  openModal('Workout Preferences', `
    <div class="check-list">
      <button type="button" class="check-row ${state.autoStartRestTimer ? 'done' : ''}" data-action="toggle-auto-timer">
        <div>
          <div style="font-weight:700;font-size:0.875rem;">Auto-Start Rest Timer</div>
          <div class="muted-sm">Automatically starts countdown after logging a new set</div>
        </div>
        <span class="check-box">${state.autoStartRestTimer ? icon('check') : ''}</span>
      </button>
      ${'wakeLock' in navigator ? `
        <button type="button" class="check-row ${state.keepAwake ? 'done' : ''}" data-action="toggle-wake-lock">
          <div>
            <div style="font-weight:700;font-size:0.875rem;">Keep Screen Awake</div>
            <div class="muted-sm">Prevents auto-lock on Train tab &amp; while rest timer is running</div>
          </div>
          <span class="check-box">${state.keepAwake ? icon('check') : ''}</span>
        </button>
      ` : ''}
    </div>
    <div class="divider"></div>
    <div class="control-group">
      <div class="control-label-row">
        <span>Rest Timer Chime</span>
        <button type="button" class="btn btn-sm" style="min-height:30px;padding:4px 10px;" data-action="test-chime">${icon('volumeOn')} <span>Test Chime</span></button>
      </div>
      <div class="check-list">
        ${alertOptions.map((o) => {
          const isSelected = hasVibe ? state.restAlertMode === o.id : Boolean(o.selected);
          return `
            <button type="button" class="check-row ${isSelected ? 'done' : ''}" data-action="set-alert-mode-pref" data-mode="${o.id}">
              <div>
                <div style="font-weight:600;font-size:0.875rem;">${escapeHtml(o.label)}</div>
                <div class="muted-sm">${escapeHtml(o.sub)}</div>
              </div>
              <span class="check-box">${isSelected ? icon('check') : ''}</span>
            </button>
          `;
        }).join('')}
      </div>
      ${!hasVibe ? `<p class="muted-sm" style="margin:4px 0 0;">iOS note: Keep Screen Awake keeps the chime firing between sets over Spotify/Apple Music. Because iOS pauses static web timers when locked or in another app, the countdown catches up automatically when you return.</p>` : ''}
    </div>
  `);
}

function openHolidayModal() {
  openModal('Holiday & Restaurant Playbook', `
    <div class="panel-inset">
      <div class="row-between" style="flex-wrap:wrap;gap:8px;">
        <div>
          <div class="kpi-label">Current Banked Buffer</div>
          <div class="kpi-value tabular">+${state.bankedKcal} kcal</div>
        </div>
        <div class="row-wrap">
          <button type="button" class="btn btn-sm btn-primary" data-action="bank-kcal" data-delta="150">+150</button>
          <button type="button" class="btn btn-sm btn-primary" data-action="bank-kcal" data-delta="200">+200</button>
          <button type="button" class="btn btn-sm" data-action="bank-kcal" data-delta="reset">Reset</button>
        </div>
      </div>
      <div class="kpi-note">Target buffer: +450 to +600 kcal across 2–3 pre-event days</div>
    </div>
    <div class="list-divided">
      ${NUTRITION.holidayRules.map((r) => `
        <div class="list-item" style="font-size:0.875rem;">${escapeHtml(r)}</div>
      `).join('')}
    </div>
  `);
}

function formatHumanDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function renderBarbellPlateChips(plates) {
  if (!plates) return '';
  if (plates.length === 0) {
    return '<div class="plate-chips-row"><span class="plate-label">Empty 45 lb barbell</span></div>';
  }
  return `
    <div class="plate-chips-row">
      <span class="plate-label">Per side:</span>
      ${plates.map((p) => {
        const cls = p === 45 ? 'plate-45' : p === 25 ? 'plate-25' : '';
        return `<span class="plate-chip tabular ${cls}">${p}</span>`;
      }).join('')}
    </div>
  `;
}

function openQuickWeighInModal(dateStr = state.selectedDate) {
  const existing = state.weightLogs.find((w) => w.date === dateStr);
  const series = computeRollingAverage(state.weightLogs, 7);
  const latest = series[series.length - 1] || { weight: PLAN_CONFIG.profile.startWeight };
  const initialVal = existing ? Number(existing.weight) : Number(latest.weight);
  pendingWeightInput = Number.isFinite(initialVal) ? initialVal : 185;
  openModal(`Morning Weigh-In · ${formatHumanDate(dateStr)}`, `
    <div class="panel-inset">
      <div class="control-label-row">
        <span>Scale Weight (lbs)</span>
        <input id="quick-weight-date" type="date" aria-label="Weight log date" class="text-input" style="width:auto;min-height:34px;padding:4px 8px;" value="${escapeHtml(dateStr)}" />
      </div>
      <div class="stepper-row">
        <button type="button" class="tap-chip" data-action="nudge-quick-metric" data-metric="quick-weight" data-delta="-0.5">-0.5</button>
        <button type="button" class="tap-chip" data-action="nudge-quick-metric" data-metric="quick-weight" data-delta="-0.2">-0.2</button>
        <input id="quick-weight-val" type="number" step="0.1" inputmode="decimal" aria-label="Weight in pounds" class="num-input" value="${Number(pendingWeightInput).toFixed(1)}" />
        <button type="button" class="tap-chip" data-action="nudge-quick-metric" data-metric="quick-weight" data-delta="0.2">+0.2</button>
        <button type="button" class="tap-chip" data-action="nudge-quick-metric" data-metric="quick-weight" data-delta="0.5">+0.5</button>
      </div>
      <button type="button" class="btn btn-primary btn-block" data-action="save-quick-weight">Save Weigh-In</button>
    </div>
    <p class="muted-sm" style="margin:0;">Weigh before eating or drinking. Your 7-day rolling average updates automatically.</p>
  `);
}

function openExerciseNoteModal(exId, activeName) {
  const currentNote = state.exerciseNotes?.[exId] || '';
  openModal(`Setup Note · ${activeName}`, `
    <div class="control-group">
      <label class="num-label" for="exercise-note-input">Pin / Seat / Grip / Joint Note (saved across sessions)</label>
      <textarea id="exercise-note-input" rows="3" class="text-input" style="min-height:84px;resize:vertical;font-weight:500;" placeholder="e.g., Bench notch #3, cable pin #7, keep right shoulder packed">${escapeHtml(currentNote)}</textarea>
    </div>
    <div class="row-wrap">
      <button type="button" class="btn btn-primary" style="flex:1;" data-action="save-exercise-note" data-ex="${escapeHtml(exId)}">Save Note</button>
      ${currentNote ? `<button type="button" class="btn btn-danger" data-action="clear-exercise-note" data-ex="${escapeHtml(exId)}">Clear</button>` : ''}
    </div>
  `);
}

function openExerciseHistoryModal(exId, activeName, defaultName) {
  const perfKey = getPerfKey(exId, activeName, defaultName);
  const trail = getExerciseHistoryTrail(state.workoutHistory, perfKey, 8).reverse();
  const bestW = trail.length ? Math.max(...trail.map((t) => t.maxW)) : 0;
  const bestE1 = trail.length ? Math.max(...trail.map((t) => t.bestE1rm)) : 0;
  const deltaE1 = trail.length >= 2 ? Number((trail[0].bestE1rm - trail[trail.length - 1].bestE1rm).toFixed(1)) : null;

  openModal(`History · ${activeName}`, trail.length === 0
    ? `<p class="muted-sm" style="margin:0;">No saved sessions logged for <strong>${escapeHtml(activeName)}</strong> yet. Finish &amp; Save a workout to build your lift history.</p>`
    : `
      <div class="kpi-strip kpi-strip-2">
        <div class="kpi-cell">
          <div class="kpi-label">Best Top Weight</div>
          <div class="kpi-value tabular">${bestW > 0 ? `${bestW} lbs` : 'BW'}</div>
          <div class="kpi-note">${trail.length} logged session${trail.length === 1 ? '' : 's'}</div>
        </div>
        <div class="kpi-cell">
          <div class="kpi-label">Best Est. 1RM</div>
          <div class="kpi-value tabular text-info">${bestE1 > 0 ? `${bestE1} lbs` : '—'}</div>
          <div class="kpi-note">${deltaE1 !== null ? `${deltaE1 >= 0 ? '+' : ''}${deltaE1} lbs vs first` : 'Baseline logged'}</div>
        </div>
      </div>
      <div class="list-divided">
        ${trail.map((entry) => `
          <div class="list-item">
            <div class="row-between" style="flex-wrap:wrap;gap:6px;">
              <strong style="font-size:0.875rem;">${escapeHtml(formatHumanDate(entry.date))}</strong>
              <span class="tag tag-info tabular">${entry.bestE1rm > 0 ? `e1RM ~${entry.bestE1rm} lb` : `${entry.totalReps} reps`}</span>
            </div>
            <div class="muted-sm tabular" style="margin-top:4px;">
              ${entry.sets.map((s, idx) => `S${idx + 1}: ${s.weight || 'BW'}×${s.reps}${s.rir !== undefined ? ` @${s.rir}` : ''}`).join(' · ')}
            </div>
          </div>
        `).join('')}
      </div>
    `);
}

function openRestPresetsModal(label = '') {
  const activeLabel = label || timer.label || 'Manual Rest';
  const presets = [
    { sec: 45, label: '0:45' },
    { sec: 60, label: '1:00' },
    { sec: 90, label: '1:30' },
    { sec: 120, label: '2:00' },
    { sec: 150, label: '2:30' },
    { sec: 180, label: '3:00' }
  ];
  openModal('Quick Rest Timer', `
    <p class="muted-sm" style="margin:0;">Tap a preset to start or switch your rest countdown immediately.</p>
    <div class="form-grid-3">
      ${presets.map((p) => `
        <button type="button" class="tap-chip tabular" data-action="pick-rest-preset" data-sec="${p.sec}" data-label="${escapeHtml(activeLabel)}">${p.label}</button>
      `).join('')}
    </div>
  `);
}

function ensureTodayLiftingDay() {
  const today = localTodayIso();
  const daily = ensureDailyLog(today);
  if (daily.dayType !== 'lifting') {
    daily.dayType = 'lifting';
    return true;
  }
  return false;
}

function renderConsistencyStrip(selectedDate) {
  const today = localTodayIso();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(`${today}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const letter = d.toLocaleDateString('en-US', { weekday: 'narrow', timeZone: 'UTC' });
    const entry = state.dailyLogs[iso];
    const hasWorkout = state.workoutHistory.some((h) => h.date === iso);
    const hasProtein = Boolean(entry && NUTRITION.meals.every((m) => entry.meals?.[m.id]));
    const hasWeight = state.weightLogs.some((w) => w.date === iso);
    days.push({ iso, letter, dayNum: d.getUTCDate(), hasWorkout, hasProtein, hasWeight, isSelected: iso === selectedDate });
  }
  return `
    <div class="week-strip" role="group" aria-label="Last 7 days consistency">
      ${days.map((day) => `
        <button type="button" class="week-day-pill ${day.isSelected ? 'is-selected' : ''}" data-action="select-strip-date" data-date="${day.iso}" aria-label="${formatHumanDate(day.iso)}">
          <span class="week-day-label">${day.letter}</span>
          <span class="week-day-dots" aria-hidden="true">
            <span class="week-dot ${day.hasWorkout ? 'dot-workout' : ''}"></span>
            <span class="week-dot ${day.hasProtein ? 'dot-protein' : ''}"></span>
            <span class="week-dot ${day.hasWeight ? 'dot-weight' : ''}"></span>
          </span>
        </button>
      `).join('')}
    </div>
    <div class="week-legend">
      <span class="week-legend-item"><span class="week-dot dot-workout"></span>Lift</span>
      <span class="week-legend-item"><span class="week-dot dot-protein"></span>4/4 Protein</span>
      <span class="week-legend-item"><span class="week-dot dot-weight"></span>Weigh-In</span>
    </div>
  `;
}

// ---------- Views ----------
function isBiweeklyCheckDue(todayIso) {
  const { todayInfo } = getEffectivePhase();
  if (todayInfo.dayNum < 14) return false;
  const lastWaistDate = state.waistLogs.length
    ? [...state.waistLogs].sort((a, b) => a.date.localeCompare(b.date)).slice(-1)[0].date
    : null;
  const lastPhotoDate = state.photoLogs.length
    ? [...state.photoLogs].sort().slice(-1)[0]
    : null;
  const daysSince = (dStr) => (dStr ? Math.floor((new Date(`${todayIso}T00:00:00Z`) - new Date(`${dStr}T00:00:00Z`)) / 86400000) : 999);
  return daysSince(lastWaistDate) >= 14 || daysSince(lastPhotoDate) >= 14;
}

function renderTodayView() {
  const { phase } = getEffectivePhase();
  const today = localTodayIso();
  const dateStr = state.selectedDate;
  const selectedDayInfo = computePlanDayInfo(dateStr, state.startDate);
  const isNotToday = dateStr !== today;
  const log = ensureDailyLog(dateStr);
  const macros = getMacroTargets(log.dayType, phase, state.hungerTightSwing, state.calorieAdjustments);
  const mealsDone = NUTRITION.meals.filter((m) => log.meals[m.id]).length;
  const habitsDone = NUTRITION.habits.filter((h) => log.habits[h.id]).length;
  const workoutsMap = getWorkouts();
  const nextWorkoutId = getNextSuggestedWorkoutId();
  const nextWorkout = workoutsMap[nextWorkoutId];
  const activeDraftEntry = Object.entries(state.draftWorkouts).find(([wId, d]) => d?.startedAt && workoutsMap[wId]);
  const hasActiveDraft = Boolean(activeDraftEntry);
  const activeDraftWorkout = activeDraftEntry ? workoutsMap[activeDraftEntry[0]] : null;
  const displayWorkout = activeDraftWorkout || nextWorkout;
  const displayWorkoutId = activeDraftEntry ? activeDraftEntry[0] : nextWorkoutId;
  const todaySessions = state.workoutHistory.filter((h) => h.date === dateStr);
  const todayWeightEntry = state.weightLogs.find((w) => w.date === dateStr);
  const lastSession = state.workoutHistory.length ? state.workoutHistory[state.workoutHistory.length - 1] : null;
  const biweeklyDue = isBiweeklyCheckDue(today);

  const weighInStatusHtml = todayWeightEntry
    ? `<span class="tag tag-success">${icon('check')} ${todayWeightEntry.weight} lbs</span><button type="button" class="btn btn-sm" data-action="open-quick-weighin">Edit</button>`
    : log.weighInSkipped
      ? `<span class="tag">Skipped</span><button type="button" class="btn btn-sm" data-action="toggle-skip-weighin">Undo</button>`
      : `<button type="button" class="btn btn-sm btn-primary" data-action="open-quick-weighin">Log Weight</button><button type="button" class="btn btn-sm" data-action="toggle-skip-weighin">Skip</button>`;

  const workoutStatusHtml = todaySessions.length > 0
    ? `<span class="tag tag-success">${icon('check')} ${escapeHtml(workoutsMap[todaySessions[todaySessions.length - 1].workoutId]?.shortName || 'Logged')}</span><button type="button" class="btn btn-sm" data-action="go-train" data-workout="${displayWorkoutId}">Open Train</button>`
    : activeDraftWorkout
      ? `<button type="button" class="btn btn-sm btn-primary" data-action="go-train" data-workout="${activeDraftEntry[0]}">Resume ${escapeHtml(activeDraftWorkout.shortName)}</button>`
      : `<button type="button" class="btn btn-sm btn-primary" data-action="go-train" data-workout="${nextWorkoutId}">Start ${escapeHtml(nextWorkout.shortName)}</button>`;

  const workoutSummaryText = todaySessions.length > 0
    ? `Trained today: ${escapeHtml(todaySessions[todaySessions.length - 1].workoutName)} (${todaySessions[todaySessions.length - 1].totalSetsDone} sets)`
    : activeDraftWorkout
      ? `In progress: ${escapeHtml(activeDraftWorkout.dayLabel)}`
      : `Today's lift: ${escapeHtml(nextWorkout.dayLabel)} (${escapeHtml(nextWorkout.estMinutes)})`;

  return `
    <section class="card">
      <div class="card-header card-header-inline">
        <div style="min-width:0;">
          <h2 class="card-title">${isNotToday ? 'Day Summary' : 'Today at a Glance'} · Day ${selectedDayInfo.dayNum}/90${state.theme === 'pastel' ? CHEER_BUNNY_SVG : ''}</h2>
          <p class="card-meta">${escapeHtml(PHASES[phase].label)} · ${escapeHtml(formatHumanDate(dateStr))}${isNotToday ? ' (Viewing another day)' : ''}</p>
        </div>
        <span class="tag ${mealsDone === 4 && (todayWeightEntry || log.weighInSkipped) ? 'tag-success' : ''}">${mealsDone}/4 · ${habitsDone}/${NUTRITION.habits.length}</span>
      </div>

      <div class="list-divided">
        <div class="list-item">
          <div class="row-between" style="flex-wrap:wrap;gap:8px;">
            <div>
              <div style="font-weight:700;font-size:0.9375rem;">Morning Weigh-In</div>
              <div class="muted-sm">${todayWeightEntry ? `Logged ${todayWeightEntry.weight} lbs for ${formatHumanDate(dateStr)}` : log.weighInSkipped ? 'Skipped for today' : 'Weigh yourself before eating or drinking'}</div>
            </div>
            <div class="row-wrap">${weighInStatusHtml}</div>
          </div>
        </div>

        <div class="list-item">
          <div class="row-between" style="flex-wrap:wrap;gap:8px;">
            <div>
              <div style="font-weight:700;font-size:0.9375rem;">${workoutSummaryText}</div>
              <div class="muted-sm">${escapeHtml(displayWorkout.focus)}${lastSession ? ` · Rolling after ${escapeHtml(workoutsMap[lastSession.workoutId]?.shortName || lastSession.workoutName)}` : ''}</div>
            </div>
            <div class="row-wrap">${workoutStatusHtml}</div>
          </div>
        </div>

        <div class="list-item">
          <div class="row-between" style="flex-wrap:wrap;gap:8px;">
            <div>
              <div style="font-weight:700;font-size:0.9375rem;">Fuel &amp; Daily Non-Negotiables</div>
              <div class="muted-sm">${macros.kcal} kcal (<span class="text-info" style="font-weight:600;">${macros.protein} P</span>) · 8–10k steps · 7–8h sleep · 5g creatine${log.dayType === 'lifting' ? ' · No caffeine >2 PM' : ''}</div>
            </div>
            ${biweeklyDue ? `<button type="button" class="btn btn-sm tag-warn" data-action="go-progress">Waist/Photo Due</button>` : ''}
          </div>
        </div>
      </div>

      <div class="divider" style="margin:12px 0;"></div>
      ${renderConsistencyStrip(dateStr)}
    </section>

    ${lastSavedBanner ? `
      <section class="card" style="border-color: var(--success);">
        <div class="row-between">
          <div>
            <h2 class="card-title text-success">Session Saved: ${escapeHtml(lastSavedBanner.workoutName)}</h2>
            <p class="card-meta">${lastSavedBanner.totalSetsDone} sets${lastSavedBanner.durationMin ? ` · ${lastSavedBanner.durationMin} min` : ''}${lastSavedBanner.conditioningNote ? ` · ${escapeHtml(lastSavedBanner.conditioningNote)}` : ''}</p>
          </div>
          <button type="button" class="btn btn-sm btn-icon btn-ghost" aria-label="Dismiss session summary" data-action="dismiss-saved-banner">${icon('close')}</button>
        </div>
        ${lastSavedBanner.progressions?.length
          ? `<div class="tag tag-info" style="margin-top:8px;white-space:normal;">${icon('flame')} <span>Unlocked next session: ${lastSavedBanner.progressions.map(escapeHtml).join(' · ')}</span></div>`
          : ''}
      </section>
    ` : ''}

    <section class="card">
      <div class="date-nav-bar">
        <div class="date-pill-group">
          <button type="button" class="btn btn-sm btn-icon" style="width:36px;height:36px;" aria-label="Previous day" data-action="shift-date" data-days="-1">${icon('chevronLeft')}</button>
          <div class="date-display-wrap">
            <span>${escapeHtml(formatHumanDate(dateStr))}</span>
            <input type="date" aria-label="Selected date" class="date-native-overlay" value="${dateStr}" data-action="pick-date" />
          </div>
          <button type="button" class="btn btn-sm btn-icon" style="width:36px;height:36px;" aria-label="Next day" data-action="shift-date" data-days="1">${icon('chevronRight')}</button>
          ${isNotToday ? `<button type="button" class="btn btn-sm btn-amber" data-action="jump-today">Today</button>` : ''}
        </div>
        <div class="segmented" role="tablist" aria-label="Day nutrition mode">
          <button type="button" class="seg-btn seg-btn-primary" aria-selected="${log.dayType === 'lifting'}" data-action="set-day-type" data-type="lifting">Lifting</button>
          <button type="button" class="seg-btn seg-btn-primary" aria-selected="${log.dayType === 'rest'}" data-action="set-day-type" data-type="rest">Rest</button>
        </div>
      </div>

      <div class="kpi-strip" style="margin-top:12px;">
        <div class="kpi-cell">
          <div class="kpi-label">Calorie Target</div>
          <div class="kpi-value tabular">${macros.kcal}</div>
          <div class="kpi-note">${escapeHtml(macros.label)}</div>
        </div>
        <div class="kpi-cell">
          <div class="kpi-label">Protein Floor</div>
          <div class="kpi-value tabular text-info">${macros.protein}</div>
          <div class="kpi-note">${mealsDone}/4 boluses checked</div>
        </div>
        <div class="kpi-cell">
          <div class="kpi-label">Carbs / Fats</div>
          <div class="kpi-value tabular">${macros.carbs} C</div>
          <div class="kpi-note">${macros.fats} Fats</div>
        </div>
        <div class="kpi-cell">
          <div class="kpi-label">Holiday Bank</div>
          <div class="kpi-value tabular">+${state.bankedKcal}</div>
          <div class="kpi-note"><button type="button" class="btn btn-sm btn-ghost" style="padding:0;min-height:auto;color:var(--info);" data-action="open-holiday">3-Plate &amp; Bank</button></div>
        </div>
      </div>

      ${phase !== 'deload' ? `
        <div class="row-between" style="margin-top:12px;flex-wrap:wrap;gap:8px;">
          <span class="muted-sm">
            ${log.dayType === 'lifting'
              ? 'Evening Lift (5–8 PM): Put <strong>60–70% of carbs</strong> in Meal 3 &amp; skip caffeine after 2 PM.'
              : 'Rest Day Rule: Hold protein at 180–185g &amp; hit 8k–10k steps.'}
          </span>
          <button type="button" class="btn btn-sm" data-action="toggle-hunger-swing">
            ${state.hungerTightSwing ? 'Tighter Swing (2450/2200)' : 'Standard Swing (2525/2075)'}
          </button>
        </div>
      ` : `
        <div class="tag tag-info" style="margin-top:12px;white-space:normal;">Week 7 Deload: Eat at maintenance (~2,650–2,750 kcal) via extra carbs.</div>
      `}
    </section>

    <div class="grid-2">
      <section class="card">
        <div class="card-header card-header-inline">
          <div style="min-width:0;">
            <h2 class="card-title">4-Meal Protein Bolus (${mealsDone}/4)</h2>
            <p class="card-meta">Spaced 3–4h apart · Meal 4 is Pre-Sleep Anchor</p>
          </div>
          <span class="tag ${mealsDone === 4 ? 'tag-success' : ''}">${mealsDone === 4 ? '180–185g Hit' : `${mealsDone}/4`}</span>
        </div>
        <div class="check-list">
          ${NUTRITION.meals.map((m) => {
            const done = Boolean(log.meals[m.id]);
            const justChecked = done && justCheckedTarget === `meal:${m.id}`;
            return `
              <button type="button" class="check-row ${done ? 'done' : ''} ${justChecked ? 'just-checked' : ''}" data-action="toggle-meal" data-id="${m.id}">
                <div>
                  <div style="font-weight:700;font-size:0.9375rem;">${escapeHtml(m.title)} · <span class="text-info">${escapeHtml(m.target)}</span></div>
                  <div class="muted-sm">${escapeHtml(m.timing)} · ${escapeHtml(m.detail)}</div>
                </div>
                <span class="check-box">${done ? icon('check') : ''}</span>
              </button>
            `;
          }).join('')}
        </div>
      </section>

      <section class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Daily Habits &amp; Support (${habitsDone}/${NUTRITION.habits.length})</h2>
            <p class="card-meta">1-tap check-ins for recovery &amp; adherence</p>
          </div>
        </div>
        <div class="check-list">
          ${NUTRITION.habits.map((h) => {
            const done = Boolean(log.habits[h.id]);
            const justChecked = done && justCheckedTarget === `habit:${h.id}`;
            return `
              <button type="button" class="check-row ${done ? 'done' : ''} ${justChecked ? 'just-checked' : ''}" data-action="toggle-habit" data-id="${h.id}">
                <div>
                  <div style="font-weight:600;font-size:0.9375rem;">${escapeHtml(h.label)}</div>
                  <div class="muted-sm">${escapeHtml(h.meta)}</div>
                </div>
                <span class="check-box">${done ? icon('check') : ''}</span>
              </button>
            `;
          }).join('')}
        </div>

        <div class="divider" style="margin:12px 0;"></div>
        <div class="control-group">
          <div class="control-label-row">
            <span>Steps</span>
            <input type="number" inputmode="numeric" aria-label="Custom steps" placeholder="Custom" class="text-input" style="width:96px;min-height:32px;padding:4px 8px;" value="${escapeHtml(log.steps)}" data-action="update-daily-num" data-field="steps" />
          </div>
          <div class="tap-chips-row">
            ${['8000', '9000', '10000', '12000'].map((val) => `
              <button type="button" class="tap-chip ${String(log.steps) === val ? 'is-active' : ''}" data-action="quick-daily" data-field="steps" data-val="${val}">${Number(val) / 1000}k</button>
            `).join('')}
          </div>
        </div>

        <div class="control-group" style="margin-top:12px;">
          <div class="control-label-row">
            <span>Sleep (hrs)</span>
            <input type="number" step="0.5" inputmode="decimal" aria-label="Custom sleep hours" placeholder="Custom" class="text-input" style="width:96px;min-height:32px;padding:4px 8px;" value="${escapeHtml(log.sleep)}" data-action="update-daily-num" data-field="sleep" />
          </div>
          <div class="tap-chips-row">
            ${['6.5', '7', '7.5', '8', '8.5'].map((val) => `
              <button type="button" class="tap-chip ${String(log.sleep) === val ? 'is-active' : ''}" data-action="quick-daily" data-field="sleep" data-val="${val}">${val}h</button>
            `).join('')}
          </div>
        </div>
      </section>
    </div>
  `;
}

function getExpandedExerciseIds(workout, draft) {
  const set = new Set();
  if (!workout || !draft) return set;
  if (!state.trainFocusMode) {
    const collapsed = draft.collapsedExIds || {};
    for (const ex of workout.exercises) {
      if (!collapsed[ex.id]) set.add(ex.id);
    }
    return set;
  }
  const activeEx = draft.activeExId ? workout.exercises.find((e) => e.id === draft.activeExId) : null;
  const activeSupersetGroup = activeEx?.superset ? activeEx.superset[0] : null;
  for (const ex of workout.exercises) {
    if (ex.id === draft.activeExId) set.add(ex.id);
    else if (activeSupersetGroup && ex.superset && ex.superset.startsWith(activeSupersetGroup)) set.add(ex.id);
  }
  return set;
}

function renderTrainView({ overrideExpandedIds = null } = {}) {
  const workoutsMap = getWorkouts();
  const workoutId = state.activeWorkoutId;
  const workout = workoutsMap[workoutId];
  const { phase, bonusWk10Sets } = getEffectivePhase();
  const draft = ensureWorkoutDraft(workoutId);

  const elapsedSec = draft.startedAt ? Math.floor((Date.now() - draft.startedAt) / 1000) : 0;
  const over50 = elapsedSec >= 3000;

  let totalSets = 0;
  let doneSets = 0;
  let completedExCount = 0;
  for (const ex of workout.exercises) {
    const s = draft.sets[ex.id] || [];
    totalSets += s.length;
    const exDone = s.filter((x) => x.done).length;
    doneSets += exDone;
    if (s.length > 0 && exDone === s.length) completedExCount++;
  }
  const progressRatio = totalSets > 0 ? doneSets / totalSets : 0;
  const allWorkingSetsDone = totalSets > 0 && doneSets === totalSets;

  const expandedIds = overrideExpandedIds || getExpandedExerciseIds(workout, draft);
  const isExpanded = (ex) => expandedIds.has(ex.id);

  const blocks = [];
  for (let i = 0; i < workout.exercises.length; i++) {
    const ex = workout.exercises[i];
    if (ex.superset && ex.superset.endsWith('1') && workout.exercises[i + 1]?.superset?.startsWith(ex.superset[0])) {
      blocks.push({ type: 'superset', group: ex.superset[0], items: [ex, workout.exercises[i + 1]] });
      i++;
    } else {
      blocks.push({ type: 'single', items: [ex] });
    }
  }

  const orderedBlocks = blocks;

  const renderExerciseCard = (ex) => {
    const activeName = state.swapsBySlot[ex.id] || ex.name;
    const isSwapped = activeName !== ex.name;
    const prev = getLastPerfEntry(state.lastPerformance, ex.id, activeName, ex.name);
    const spec = getEffectiveExerciseSpec(ex, {
      phase,
      bonusWk10Sets,
      isOptionalPumpDay: Boolean(workout.isOptionalPumpDay),
      prevWeight: prev?.sets?.[0]?.weight ?? (activeName === ex.name ? ex.defaultWeight : '')
    });
    const setRows = draft.sets[ex.id] || [];
    const exDoneCount = setRows.filter((s) => s.done).length;
    const allExDone = exDoneCount === setRows.length && setRows.length > 0;
    const progression = phase !== 'deload' ? evaluateDoubleProgression(setRows, ex, activeName) : null;
    const expanded = isExpanded(ex);
    const doneSummary = allExDone
      ? setRows.filter((s) => s.done).map((s) => `${s.weight || 'BW'}×${s.reps}`).join(', ')
      : '';
    const headerSubText = allExDone
      ? `Completed (${doneSummary})${progression ? ` · +${progression.increment} lb ready` : ''}`
      : `${exDoneCount}/${setRows.length} sets · ${ex.repMin === ex.repMax ? ex.repMin : `${ex.repMin}–${ex.repMax}`} reps · Rest ${ex.restLabel}`;

    const selIdx = Math.min(setRows.length - 1, Math.max(0, draft.activeSetIdxByEx[ex.id] ?? 0));
    const selSet = setRows[selIdx] || { weight: '', reps: String(ex.repMin), rir: '1.5', done: false };
    const isFinalSet = selIdx === setRows.length - 1;
    const wNum = Number(selSet.weight) || 0;
    const rNum = Number(selSet.reps) || ex.repMin;
    const rirNum = Number(selSet.rir);
    const effectiveBarbell = isActiveExerciseBarbell(ex, activeName);
    const weightStep = getExerciseWeightStep(ex, activeName);
    const smallStep = effectiveBarbell ? 5 : 2.5;
    const largeStep = effectiveBarbell ? 10 : 5;
    const repOptions = [];
    for (let r = ex.repMin; r <= ex.repMax; r++) repOptions.push(r);
    const rirOptions = ['0', '1', '1.5', '2', '3'];
    const isActiveFocus = ex.id === draft.activeExId;
    const isRestPauseFinisher = Boolean(spec.activeIntensifier && /rest-pause/i.test(spec.activeIntensifier));

    const showBarbellPlates = effectiveBarbell;
    const platesPerSide = showBarbellPlates ? computeBarbellPlatesPerSide(wNum) : null;
    const savedSetupNote = String(state.exerciseNotes?.[ex.id] || '').trim();
    const perfKey = getPerfKey(ex.id, activeName, ex.name);
    const historyCount = getExerciseHistoryTrail(state.workoutHistory, perfKey, 20).length;
    const whyOpen = Boolean(openWhyByEx[ex.id]);
    const hasDifferentUpcomingWeight = selIdx < setRows.length - 1 &&
      setRows.slice(selIdx + 1).some((s) => !s.done && String(s.weight ?? '') !== String(selSet.weight ?? ''));

    const rampOpen = Boolean(draft.rampOpen[ex.id]);
    const rampSets = ex.rampUp ? computeRampUpSets(wNum || ex.defaultWeight || 135, effectiveBarbell) : [];
    const targetHint = computeExerciseTargetHint(ex, prev, { phase, isOptionalPumpDay: Boolean(workout.isOptionalPumpDay), activeName });

    const prevSetsText = prev?.sets?.length
      ? prev.sets.map((s) => `${s.weight || 'BW'}×${s.reps}`).join(', ')
      : (activeName === ex.name && ex.defaultWeight ? `Ref ~${ex.defaultWeight} lbs` : 'No prior log');
    const prevAvgRir = prev?.sets?.length
      ? (prev.sets.reduce((sum, s) => sum + (Number(s.rir) || 0), 0) / prev.sets.length).toFixed(1).replace(/\.0$/, '')
      : null;
    const priorSwap = !isSwapped ? getPriorSwapContext(state.workoutHistory, workoutId, ex.id, ex.name) : null;
    const repTotalChips = repOptions.length + 2;

    return `
      <article class="exercise-card ${expanded ? 'is-expanded' : 'is-collapsed'} ${isActiveFocus ? 'is-active' : ''} ${allExDone ? 'is-done' : ''}" data-ex-card="${ex.id}">
        <button type="button" class="exercise-toggle" data-action="focus-exercise" data-ex="${ex.id}" aria-expanded="${expanded}" aria-controls="ex-body-${ex.id}">
          <div class="exercise-head-main">
            <div class="exercise-title-row">
              ${ex.superset ? `<span class="tag tag-warn">${ex.superset}</span>` : ''}
              <span>${escapeHtml(activeName)}</span>
            </div>
            <div class="muted-sm exercise-sub">${escapeHtml(headerSubText)}</div>
          </div>
          <div class="exercise-head-status">
            ${allExDone
              ? `<span class="tag tag-success">${icon('check')} Done</span>`
              : `<span class="tag tabular">${exDoneCount}/${setRows.length}</span>`}
            <span class="exercise-chevron" aria-hidden="true">${icon('chevronDown')}</span>
          </div>
        </button>

        <div class="exercise-collapse" id="ex-body-${ex.id}" ${expanded ? '' : 'inert'}>
          <div class="exercise-collapse-inner">
            <div class="exercise-actions-row">
              <div class="row-wrap" style="gap:6px;">
                ${ex.leftFirst ? '<span class="tag tag-info">Left Arm First</span>' : ''}
                <span class="tag">${effectiveBarbell ? `Barbell (+${weightStep} lb)` : ex.isCompound ? `Compound (+${weightStep} lb)` : `Isolation (+${weightStep} lb)`}</span>
                ${spec.phaseNote ? `<span class="tag tag-info">${escapeHtml(spec.phaseNote)}</span>` : ''}
                ${spec.activeIntensifier ? `<span class="tag tag-warn">${icon('bolt')} ${escapeHtml(spec.activeIntensifier)}</span>` : ''}
              </div>
              <div class="row-wrap" style="justify-content:flex-end;gap:6px;">
                ${ex.rampUp ? `<button type="button" class="btn btn-sm" data-action="toggle-ramp-inline" data-ex="${ex.id}">${rampOpen ? 'Hide Ramp' : 'Ramp'}</button>` : ''}
                <button type="button" class="btn btn-sm ${savedSetupNote ? 'btn-info-active' : ''}" data-action="open-exercise-note" data-ex="${ex.id}" data-name="${escapeHtml(activeName)}" title="Pin, seat &amp; setup note">${icon('note')} <span>Note</span></button>
                <button type="button" class="btn btn-sm" data-action="open-exercise-history" data-ex="${ex.id}" data-name="${escapeHtml(activeName)}" data-default="${escapeHtml(ex.name)}" title="Past sessions for this lift">${icon('history')}${historyCount > 0 ? `<span class="tabular">${historyCount}</span>` : ''}</button>
                <button type="button" class="btn btn-sm" data-action="open-swap" data-ex="${ex.id}">${icon('swap')} <span>${isSwapped ? 'Swapped' : 'Swap'}</span></button>
              </div>
            </div>

        ${savedSetupNote ? `
          <div class="setup-note-strip">
            <div><strong>Setup:</strong> ${escapeHtml(savedSetupNote)}</div>
            <button type="button" class="btn btn-sm btn-ghost" style="min-height:28px;padding:2px 8px;" data-action="open-exercise-note" data-ex="${ex.id}" data-name="${escapeHtml(activeName)}">Edit</button>
          </div>
        ` : ''}

        <!-- Live Mid-Set Target HUD -->
        <div class="kpi-strip kpi-strip-2">
          <div class="kpi-cell">
            <div class="kpi-label">Last Session ${prev?.date ? `(${prev.date.slice(5)})` : ''}</div>
            <div class="kpi-value tabular" style="font-size:0.95rem;">${escapeHtml(prevSetsText)}</div>
            <div class="kpi-note">${prevAvgRir !== null ? `Avg ${prevAvgRir} RIR` : 'First session baseline'}</div>
          </div>
          <div class="kpi-cell">
            <div class="kpi-label">Today's Goal</div>
            <div class="kpi-value tabular" style="font-size:0.95rem;color:${targetHint.mode === 'progress' ? 'var(--primary)' : 'var(--info)'};">${escapeHtml(targetHint.headline)}</div>
            <div class="kpi-note">${escapeHtml(targetHint.detail)}</div>
          </div>
        </div>

        ${(() => {
          const whyText = getExercisePrescriptionRationale(ex, { phase, isOptionalPumpDay: Boolean(workout.isOptionalPumpDay) });
          const adherence = evaluatePlanAdherence({
            exercise: ex,
            setsLog: setRows,
            activeName,
            defaultName: ex.name,
            phase,
            isOptionalPumpDay: Boolean(workout.isOptionalPumpDay),
            expectedSets: spec.sets,
            prevEntry: prev
          });
          const hasWarningBadges = Boolean(priorSwap) || adherence.reasons.length > 0;
          return `
            <div class="exercise-notes">
              <div class="cue-row">
                <div class="cue-text">${ex.note ? `<strong>Cue:</strong> ${escapeHtml(ex.note)}` : `<strong>Focus:</strong> ${escapeHtml(whyText)}`}</div>
                ${ex.note ? `<button type="button" class="btn btn-ghost why-toggle-btn" data-action="toggle-why-inline" data-ex="${ex.id}" aria-expanded="${whyOpen}">${icon('info')} <span>${whyOpen ? 'Hide' : 'Why'}</span></button>` : ''}
              </div>
              ${ex.note && whyOpen ? `<div class="muted-sm"><strong>Why:</strong> ${escapeHtml(whyText)}</div>` : ''}
              ${hasWarningBadges || (whyOpen && exDoneCount > 0) ? `
                <div class="row-wrap" style="gap:6px;">
                  ${priorSwap ? `<span class="tag tag-warn">Prior Swap: ${escapeHtml(priorSwap.swappedName)} (${escapeHtml(priorSwap.date.slice(5))}${priorSwap.setsText ? ` · ${escapeHtml(priorSwap.setsText)}` : ''})</span>` : ''}
                  ${adherence.reasons.length > 0
                    ? `<span class="tag tag-warn">Plan Deviation: ${escapeHtml(adherence.reasons.join(' · '))}</span>`
                    : (exDoneCount > 0 ? `<span class="tag tag-success">On Plan</span>` : '')}
                </div>
              ` : ''}
            </div>
          `;
        })()}

        ${ex.rampUp && rampOpen ? `
          <div class="panel-inset">
            <div class="control-label-row">
              <span>5-Min Ramp-Up (based on ${wNum || ex.defaultWeight || 135} lbs)</span>
              <span>60–90s rest</span>
            </div>
            <div class="tap-chips-row">
              ${rampSets.map((rs, rIdx) => {
                const rKey = `${ex.id}_${rIdx}`;
                const rDone = Boolean(draft.rampDone[rKey]);
                return `
                  <button type="button" class="tap-chip ${rDone ? 'is-active' : ''}" style="flex:1 1 45%;justify-content:space-between;padding:8px 12px;" data-action="toggle-ramp-set" data-key="${rKey}">
                    <span>${escapeHtml(rs.pct)}</span>
                    <span class="tabular">${rs.weight}×${rs.reps}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        ${progression ? `
          <div class="tag tag-success" style="white-space:normal;padding:8px 12px;">
            ${icon('flame')} <span>${escapeHtml(progression.message)}</span>
          </div>
        ` : ''}

        <!-- Set Selector Strip + Add/Remove Set -->
        <div class="set-pills-strip" role="tablist" aria-label="Sets for ${escapeHtml(activeName)}">
          ${setRows.map((s, idx) => {
            const prevForSet = prev?.sets?.[idx];
            const pillSub = s.done
              ? `: ${s.weight || 'BW'}×${s.reps}`
              : (prevForSet ? ` · ${prevForSet.weight || 'BW'}×${prevForSet.reps}` : '');
            return `
              <button type="button" class="set-tab-pill ${idx === selIdx ? 'is-selected' : ''} ${s.done ? 'is-done' : ''}"
                data-action="select-set" data-ex="${ex.id}" data-idx="${idx}">
                ${s.done ? icon('check') : ''}
                <span class="tabular">S${idx + 1}${pillSub}</span>
              </button>
            `;
          }).join('')}
          <button type="button" class="set-tab-pill" data-action="add-extra-set" data-ex="${ex.id}" title="Add an extra working set">+ Set</button>
          ${(draft.extraSetsByEx?.[ex.id] || 0) > 0 ? `<button type="button" class="set-tab-pill" data-action="remove-extra-set" data-ex="${ex.id}" title="Remove last extra set">- Set</button>` : ''}
        </div>

        <!-- Zero-Typing Active Set Thumb Deck -->
        <div class="logger-section">
          ${isFinalSet && spec.activeIntensifier ? `
            <div class="tag tag-warn" style="white-space:normal;padding:8px 12px;">
              ${icon('bolt')} <span><strong>Final Set Finisher:</strong> ${escapeHtml(spec.activeIntensifier)}</span>
            </div>
          ` : ''}

          <div class="control-group">
            <div class="control-label-row">
              <span>Set ${selIdx + 1} Weight (lbs)</span>
              ${hasDifferentUpcomingWeight ? `<button type="button" class="btn btn-sm btn-ghost" style="min-height:28px;padding:2px 8px;color:var(--info);" data-action="copy-weight-rest" data-ex="${ex.id}" data-idx="${selIdx}">Copy to remaining</button>` : ''}
            </div>
            <div class="stepper-row">
              <button type="button" class="tap-chip" data-action="nudge-weight" data-ex="${ex.id}" data-idx="${selIdx}" data-delta="-${largeStep}">-${largeStep}</button>
              <button type="button" class="tap-chip" data-action="nudge-weight" data-ex="${ex.id}" data-idx="${selIdx}" data-delta="-${smallStep}">-${smallStep}</button>
              <input type="number" step="${smallStep}" inputmode="decimal" aria-label="Set ${selIdx + 1} weight" class="num-input"
                value="${escapeHtml(selSet.weight)}" placeholder="BW"
                data-action="edit-set" data-ex="${ex.id}" data-idx="${selIdx}" data-field="weight" />
              <button type="button" class="tap-chip" data-action="nudge-weight" data-ex="${ex.id}" data-idx="${selIdx}" data-delta="${smallStep}">+${smallStep}</button>
              <button type="button" class="tap-chip" data-action="nudge-weight" data-ex="${ex.id}" data-idx="${selIdx}" data-delta="${largeStep}">+${largeStep}</button>
            </div>
            ${showBarbellPlates ? `<div data-plate-for="${ex.id}_${selIdx}">${renderBarbellPlateChips(platesPerSide)}</div>` : ''}
          </div>

          <div class="control-group">
            <div class="control-label-row">
              <span>${ex.leftFirst ? 'Left-Arm Reps (Stop Right at same)' : `Reps (Target ${ex.repMin === ex.repMax ? ex.repMax : `${ex.repMin}–${ex.repMax}`})`}</span>
              <span class="tabular">${rNum} reps</span>
            </div>
            <div class="rep-chips-grid ${repTotalChips <= 6 ? 'cols-compact' : 'cols-4'}">
              <button type="button" class="tap-chip" data-action="nudge-reps" data-ex="${ex.id}" data-idx="${selIdx}" data-delta="-1" aria-label="Decrease reps">-1</button>
              ${repOptions.map((r) => `
                <button type="button" class="tap-chip ${rNum === r ? 'is-active' : ''}" data-action="pick-reps" data-ex="${ex.id}" data-idx="${selIdx}" data-val="${r}">${r}</button>
              `).join('')}
              <button type="button" class="tap-chip" data-action="nudge-reps" data-ex="${ex.id}" data-idx="${selIdx}" data-delta="1" aria-label="Increase reps">+1</button>
            </div>
          </div>

          <div class="control-group">
            <div class="control-label-row">
              <span>RIR (Reps in Reserve)</span>
              <span class="tabular">${workout.isOptionalPumpDay ? 'Cap at 2 RIR' : `${selSet.rir || '1.5'} RIR`}</span>
            </div>
            <div class="tap-chips-row">
              ${rirOptions.map((val) => `
                <button type="button" class="tap-chip tap-chip-rir ${String(selSet.rir) === val || (Number.isFinite(rirNum) && rirNum === Number(val)) ? 'is-active' : ''} ${workout.isOptionalPumpDay && val === '2' ? 'is-cap' : ''}"
                  data-action="pick-rir" data-ex="${ex.id}" data-idx="${selIdx}" data-val="${val}">${val}</button>
              `).join('')}
            </div>
          </div>

          <div class="row-wrap" style="gap:8px;">
            <button type="button" class="btn btn-primary btn-block" style="flex:1;"
              data-action="log-active-set" data-ex="${ex.id}" data-idx="${selIdx}" data-rest="${ex.restSec}" data-label="${escapeHtml(activeName)}">
              ${icon('check')}
              <span data-log-label-for="${ex.id}_${selIdx}">
                ${selSet.done
                  ? `Re-Log Set ${selIdx + 1} (${selSet.weight || 'BW'} × ${rNum})`
                  : `Log Set ${selIdx + 1}${ex.leftFirst ? ' (L→R)' : ''} · ${selSet.weight || 'BW'} × ${rNum}`}
              </span>
            </button>
            ${isFinalSet && isRestPauseFinisher ? `<button type="button" class="btn btn-amber" data-action="start-rest" data-sec="15" data-label="Rest-Pause (${escapeHtml(activeName)})">15s RP</button>` : ''}
            ${selSet.done ? `<button type="button" class="btn" data-action="undo-set" data-ex="${ex.id}" data-idx="${selIdx}">Undo</button>` : ''}
            <button type="button" class="btn" aria-label="Start rest timer manually" data-action="start-rest" data-sec="${ex.restSec}" data-label="${escapeHtml(activeName)}">${icon('timer')}</button>
          </div>
        </div>
          </div>
        </div>
      </article>
    `;
  };

  const prehabBothDone = draft.prehabDone.ext && draft.prehabDone.pullapart;
  const prehabSkipped = Boolean(draft.prehabSkipped) && !prehabBothDone;
  const prehabCollapsed = prehabBothDone || prehabSkipped;
  const estRemainingMin = Math.max(0, Math.round((totalSets - doneSets) * 2.1));
  const { todayInfo } = getEffectivePhase();
  const workoutBrief = computeWorkoutContextBrief({
    workout,
    workoutHistory: state.workoutHistory,
    lastPerformance: state.lastPerformance,
    swapsBySlot: state.swapsBySlot,
    phase,
    weekNum: todayInfo.weekNum
  });

  const renderBlock = (b) => b.type === 'superset'
    ? `
      <div class="superset-group">
        <div class="superset-banner">
          <span>Superset ${b.group}1 / ${b.group}2 · ${b.group}1 → ${b.group}2 → 60s rest</span>
          <span>60s rest</span>
        </div>
        ${b.items.map(renderExerciseCard).join('')}
      </div>
    `
    : renderExerciseCard(b.items[0]);

  const allBlocksHtml = orderedBlocks.map(renderBlock).join('');

  return `
    ${lastSavedBanner ? `
      <section class="card" style="border-color: var(--success);">
        <div class="row-between">
          <div>
            <h2 class="card-title text-success">Session Saved: ${escapeHtml(lastSavedBanner.workoutName)}</h2>
            <p class="card-meta">${lastSavedBanner.totalSetsDone} sets${lastSavedBanner.durationMin ? ` · ${lastSavedBanner.durationMin} min` : ''}${lastSavedBanner.conditioningNote ? ` · ${escapeHtml(lastSavedBanner.conditioningNote)}` : ''}</p>
          </div>
          <button type="button" class="btn btn-sm btn-icon btn-ghost" aria-label="Dismiss session summary" data-action="dismiss-saved-banner">${icon('close')}</button>
        </div>
        ${lastSavedBanner.progressions?.length
          ? `<div class="tag tag-info" style="margin-top:8px;white-space:normal;">${icon('flame')} <span>Unlocked next session: ${lastSavedBanner.progressions.map(escapeHtml).join(' · ')}</span></div>`
          : ''}
      </section>
    ` : ''}

    <section class="card">
      <div class="segmented segmented-5" role="tablist" aria-label="Workout day selector">
        ${Object.values(workoutsMap).map((w) => `
          <button type="button" class="seg-btn seg-btn-primary" aria-selected="${w.id === workoutId}" data-action="select-workout" data-workout="${w.id}">
            ${escapeHtml(w.shortName)}
          </button>
        `).join('')}
      </div>

      <div class="row-between" style="margin-top:12px;gap:8px;align-items:flex-start;">
        <div style="min-width:0;">
          <h2 class="card-title">${escapeHtml(workout.dayLabel)}</h2>
          <p class="card-meta">${escapeHtml(workout.focus)} · ${escapeHtml(workout.estMinutes)}</p>
        </div>
        <div class="row-wrap" style="flex-wrap:nowrap;flex-shrink:0;gap:6px;">
          <button type="button" class="btn btn-sm btn-icon" style="width:36px;height:36px;" aria-label="Quick rest timer presets" title="Quick Rest Timer" data-action="open-rest-presets">
            ${icon('timer')}
          </button>
          <button type="button" class="btn btn-sm" data-action="open-plan-editor" data-workout="${workoutId}">Edit Plan</button>
          <button type="button" class="btn btn-sm btn-icon" style="width:36px;height:36px;" aria-label="Workout settings" title="Workout Settings" data-action="open-workout-settings">
            ${icon('sliders')}
          </button>
        </div>
      </div>

      <div class="panel-inset" style="margin-top:12px;">
        <div class="control-label-row">
          <span>Session #${workoutBrief.runNumber} · ${escapeHtml(PHASES[phase].label)} (Wk ${todayInfo.weekNum})</span>
        </div>
        <div class="muted-sm">${escapeHtml(workoutBrief.lastSummary)}</div>
        <div class="text-info" style="font-size:0.875rem;font-weight:600;">${escapeHtml(workoutBrief.todayGoal)}</div>
      </div>

      <div class="row-between" style="margin-top:12px;gap:12px;flex-wrap:wrap;">
        <div style="flex:1;min-width:160px;">
          <div class="row-between muted-sm" style="margin-bottom:4px;">
            <span class="tabular" style="white-space:nowrap;">${doneSets}/${totalSets} sets${totalSets > doneSets ? ` · ~${estRemainingMin}m` : ''}</span>
            <span class="tabular ${over50 ? 'tag tag-warn' : ''}" id="session-clock">
              ${draft.startedAt ? `${formatMMSS(elapsedSec)} / 60:00` : 'Ready'}
            </span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="transform: scaleX(${progressRatio.toFixed(4)});"></div>
          </div>
        </div>
        <div class="row-wrap">
          ${!draft.startedAt
            ? `<button type="button" class="btn btn-sm btn-primary" data-action="start-session">Start Clock</button>`
            : `<button type="button" class="btn btn-sm" data-action="reset-session">Reset</button>`}
          ${doneSets > 0 ? `<button type="button" class="btn btn-sm btn-primary" data-action="finish-workout">Finish &amp; Save</button>` : ''}
        </div>
      </div>
    </section>

    ${workout.hasShoulderPrehab ? `
      <section class="card">
        <div class="row-between" style="margin-bottom:${prehabCollapsed ? '0' : '8px'};align-items:flex-start;">
          <div style="min-width:0;">
            <h3 class="card-title">Step 1: 2-Min Shoulder Prehab</h3>
            <p class="card-meta">${prehabBothDone ? 'Rotator cuff warmed up and ready to press.' : prehabSkipped ? 'Skipped for this session.' : 'Complete before Upper pressing'}</p>
          </div>
          <div class="row-wrap" style="justify-content:flex-end;flex-shrink:0;">
            ${prehabBothDone
              ? `<span class="tag tag-success">${icon('check')} Complete</span>`
              : prehabSkipped
                ? `<span class="tag">Skipped</span><button type="button" class="btn btn-sm" data-action="toggle-skip-prehab">Undo</button>`
                : `<span class="tag tag-info">Right Cuff Guard</span><button type="button" class="btn btn-sm" data-action="toggle-skip-prehab">Skip</button>`}
          </div>
        </div>
        ${prehabCollapsed ? '' : `
          <div class="grid-2" style="gap:8px;">
            <button type="button" class="check-row ${draft.prehabDone.ext ? 'done' : ''} ${draft.prehabDone.ext && justCheckedTarget === 'prehab:ext' ? 'just-checked' : ''}" data-action="toggle-prehab" data-key="ext">
              <span style="font-size:0.875rem;font-weight:600;">1–2 × 12–15/side External Rotations</span>
              <span class="check-box">${draft.prehabDone.ext ? icon('check') : ''}</span>
            </button>
            <button type="button" class="check-row ${draft.prehabDone.pullapart ? 'done' : ''} ${draft.prehabDone.pullapart && justCheckedTarget === 'prehab:pullapart' ? 'just-checked' : ''}" data-action="toggle-prehab" data-key="pullapart">
              <span style="font-size:0.875rem;font-weight:600;">15 Band Pull-Aparts</span>
              <span class="check-box">${draft.prehabDone.pullapart ? icon('check') : ''}</span>
            </button>
          </div>
        `}
      </section>
    ` : ''}

    <div class="exercise-list-bar">
      <span class="queue-heading">Exercises (${completedExCount}/${workout.exercises.length})</span>
      <button type="button" class="btn btn-sm btn-ghost" data-action="toggle-focus-mode" id="focus-mode-btn">${state.trainFocusMode ? 'Show all' : 'Focus active'}</button>
    </div>

    ${allBlocksHtml}

    ${workout.conditioning ? `
      <section class="card">
        <div class="row-between" style="margin-bottom:8px;flex-wrap:wrap;gap:8px;">
          <div>
            <h3 class="card-title">${escapeHtml(workout.conditioning.title)}</h3>
            <p class="card-meta">${escapeHtml(workout.conditioning.detail)}</p>
          </div>
          <button type="button" class="btn btn-sm" data-action="toggle-cond-swap">
            ${icon('swap')} <span>${draft.conditioningSwapped ? 'Using Split Squats' : 'Swap to Split Squats'}</span>
          </button>
        </div>
        <button type="button" class="check-row ${draft.conditioningDone ? 'done' : ''} ${draft.conditioningDone && justCheckedTarget === 'cond' ? 'just-checked' : ''}" data-action="toggle-cond-done">
          <span style="font-size:0.875rem;font-weight:600;">
            ${draft.conditioningSwapped ? '2 × 8–10/leg DB Bulgarian Split Squats' : '15 min Incline Walk (10% @ 3.2 mph)'}
          </span>
          <span class="check-box">${draft.conditioningDone ? icon('check') : ''}</span>
        </button>
      </section>
    ` : ''}

    ${doneSets > 0 ? `
      <section class="card">
        <div class="row-between" style="flex-wrap:wrap;gap:12px;">
          <div>
            <h3 class="card-title">${allWorkingSetsDone ? 'All Working Sets Complete' : 'Session Progress'}</h3>
            <p class="card-meta">${doneSets} of ${totalSets} sets logged${workout.conditioning && !draft.conditioningDone ? ' · Conditioning finisher remaining' : ''}</p>
          </div>
          <button type="button" class="btn btn-primary" data-action="finish-workout">
            ${icon('check')} <span>Finish &amp; Save Workout</span>
          </button>
        </div>
      </section>
    ` : ''}
  `;
}

function renderWeightSvgChart(series) {
  if (!series || series.length === 0) {
    return '<div class="muted-sm">No weight entries logged yet.</div>';
  }
  const w = 360;
  const h = 185;
  const padL = 34;
  const padR = 14;
  const padT = 16;
  const padB = 28;
  const cw = w - padL - padR;
  const ch = h - padT - padB;

  const weights = series.flatMap((p) => [p.weight, p.rollingAvg]);
  const minW = Math.floor(Math.min(...weights, PLAN_CONFIG.profile.targetWeightMin) - 2);
  const maxW = Math.ceil(Math.max(...weights, PLAN_CONFIG.profile.startWeight) + 2);
  const span = Math.max(4, maxW - minW);

  const xFor = (idx) => (series.length === 1 ? padL + cw / 2 : padL + (idx / (series.length - 1)) * cw);
  const yFor = (val) => padT + ch - ((val - minW) / span) * ch;

  const targetTopY = yFor(PLAN_CONFIG.profile.targetWeightMax);
  const targetBotY = yFor(PLAN_CONFIG.profile.targetWeightMin);

  const rawPoints = series.map((p, i) => `${xFor(i).toFixed(1)},${yFor(p.weight).toFixed(1)}`).join(' ');
  const avgPoints = series.map((p, i) => `${xFor(i).toFixed(1)},${yFor(p.rollingAvg).toFixed(1)}`).join(' ');
  const baseLineY = (padT + ch).toFixed(1);
  const avgAreaPath = series.length > 1
    ? `M ${xFor(0).toFixed(1)},${baseLineY} L ${series.map((p, i) => `${xFor(i).toFixed(1)},${yFor(p.rollingAvg).toFixed(1)}`).join(' L ')} L ${xFor(series.length - 1).toFixed(1)},${baseLineY} Z`
    : '';

  const yTicks = [minW, Math.round((minW + maxW) / 2), maxW];
  const activeIdx = selectedChartIdx !== null && selectedChartIdx >= 0 && selectedChartIdx < series.length
    ? selectedChartIdx
    : series.length - 1;
  const activePt = series[activeIdx];
  const activeDelta = Number((activePt.rollingAvg - PLAN_CONFIG.profile.startWeight).toFixed(1));

  return `
    <div class="chart-readout">
      <strong class="tabular">${escapeHtml(formatHumanDate(activePt.date))}</strong>
      <span class="tabular">Scale: <strong>${activePt.weight} lb</strong> · <span class="text-info">7d Avg: <strong>${activePt.rollingAvg} lb</strong> (${activeDelta > 0 ? '+' : ''}${activeDelta})</span></span>
    </div>
    <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;display:block;" role="img" aria-label="Scale weight and 7-day rolling average chart">
      <rect x="${padL}" y="${targetTopY}" width="${cw}" height="${Math.max(4, targetBotY - targetTopY)}" fill="var(--info-soft)" />
      <text x="${padL + 6}" y="${targetTopY + 13}" font-size="11" font-weight="600" fill="var(--info)">90d Target: 173–177 lbs</text>

      ${yTicks.map((t) => {
        const y = yFor(t);
        return `
          <line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="var(--border-subtle)" stroke-dasharray="3 3" />
          <text x="${padL - 5}" y="${y + 4}" text-anchor="end" font-size="11" fill="var(--text-muted)">${t}</text>
        `;
      }).join('')}

      ${avgAreaPath ? `<path d="${avgAreaPath}" fill="var(--info)" opacity="0.12" />` : ''}
      ${series.length > 1 ? `<polyline fill="none" stroke="var(--text-dim)" stroke-width="1.5" stroke-dasharray="3 3" points="${rawPoints}" />` : ''}
      ${series.length > 1 ? `<polyline fill="none" stroke="var(--info)" stroke-width="2.2" points="${avgPoints}" />` : ''}

      ${series.map((p, i) => {
        const isSel = i === activeIdx;
        const cx = xFor(i).toFixed(1);
        const cyAvg = yFor(p.rollingAvg).toFixed(1);
        const cyRaw = yFor(p.weight).toFixed(1);
        return `
          ${isSel ? `<line x1="${cx}" y1="${padT}" x2="${cx}" y2="${padT + ch}" stroke="var(--info)" stroke-opacity="0.35" stroke-dasharray="2 2" />` : ''}
          <circle cx="${cx}" cy="${cyRaw}" r="${isSel ? '4' : '3'}" fill="var(--text-muted)" />
          <circle cx="${cx}" cy="${cyAvg}" r="${isSel ? '5.5' : '3.8'}" fill="var(--info)" stroke="${isSel ? 'var(--surface)' : 'none'}" stroke-width="2" />
          <circle class="chart-hit" cx="${cx}" cy="${cyAvg}" r="14" fill="transparent" data-action="select-chart-point" data-idx="${i}">
            <title>${p.date}: ${p.weight} lbs (7d avg ${p.rollingAvg})</title>
          </circle>
        `;
      }).join('')}

      <text x="${padL}" y="${h - 8}" font-size="11" fill="var(--text-muted)">${series[0].date.slice(5)}</text>
      ${series.length > 1 ? `<text x="${w - padR}" y="${h - 8}" text-anchor="end" font-size="11" fill="var(--text-muted)">${series[series.length - 1].date.slice(5)}</text>` : ''}
    </svg>
    ${series.length < 3
      ? `<div class="muted-sm" style="margin-top:8px;">Log ${3 - series.length} more morning weigh-in${3 - series.length === 1 ? '' : 's'} to draw your 7-day rolling trend line.</div>`
      : '<div class="muted-sm" style="margin-top:6px;">Tap any dot on the chart to inspect that day\'s scale weight &amp; 7-day average.</div>'}
  `;
}

function getBestBig3() {
  const best = {
    bench: PLAN_CONFIG.strengthTargets.bench.baseline,
    squat: PLAN_CONFIG.strengthTargets.squat.baseline,
    deadlift: PLAN_CONFIG.strengthTargets.deadlift.baseline,
    pullups: PLAN_CONFIG.strengthTargets.pullups.baseline
  };
  const e1rm = {
    bench: estimate1RM(best.bench, 5, 1.5),
    squat: estimate1RM(best.squat, 5, 1.5),
    deadlift: estimate1RM(best.deadlift, 5, 1.5),
    pullups: null
  };
  for (const h of state.workoutHistory) {
    if (h.big3Max?.bench > best.bench) best.bench = h.big3Max.bench;
    if (h.big3Max?.squat > best.squat) best.squat = h.big3Max.squat;
    if (h.big3Max?.deadlift > best.deadlift) best.deadlift = h.big3Max.deadlift;
    if (h.big3Max?.pullups > best.pullups) best.pullups = h.big3Max.pullups;
    for (const ex of (h.exercises || [])) {
      if (ex.big3Key && !ex.isRepMaxGoal && ex.isDefaultSlot) {
        for (const s of (ex.sets || [])) {
          const est = estimate1RM(s.weight, s.reps, s.rir);
          if (est > (e1rm[ex.big3Key] || 0)) e1rm[ex.big3Key] = est;
        }
      }
    }
  }
  return { best, e1rm };
}

function get7DayAdherence() {
  const today = localTodayIso();
  let proteinDays = 0;
  let stepDays = 0;
  let loggedDays = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(`${today}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    const entry = state.dailyLogs[key];
    if (!entry) continue;
    loggedDays += 1;
    if (NUTRITION.meals.every((m) => entry.meals?.[m.id])) proteinDays += 1;
    if (entry.habits?.steps || Number(entry.steps) >= 8000) stepDays += 1;
  }
  return { proteinDays, stepDays, loggedDays };
}

function renderProgressView() {
  const { todayInfo } = getEffectivePhase();
  const series = computeRollingAverage(state.weightLogs, 7);
  const latest = series[series.length - 1] || { weight: 185, rollingAvg: 185 };
  const deltaBaseline = Number((latest.rollingAvg - PLAN_CONFIG.profile.startWeight).toFixed(1));
  const sortedWaists = [...state.waistLogs].sort((a, b) => a.date.localeCompare(b.date));
  const latestWaist = sortedWaists.length ? sortedWaists[sortedWaists.length - 1] : null;
  if (pendingWeightInput === null || pendingWeightInput === '' || !Number.isFinite(Number(pendingWeightInput))) {
    pendingWeightInput = latest.weight;
  }
  if (pendingWaistInput === null || pendingWaistInput === '' || !Number.isFinite(Number(pendingWaistInput))) {
    pendingWaistInput = latestWaist ? latestWaist.waist : 34.0;
  }
  const formattedWaistVal = Number(pendingWaistInput).toFixed(2).replace(/0$/, '');

  const adjustment = evaluateBiweeklyAdjustment({
    weightLogs: state.weightLogs,
    waistLogs: state.waistLogs,
    workoutHistory: state.workoutHistory,
    currentDay: todayInfo.dayNum
  });
  const { best: bestBig3, e1rm: bestE1rm } = getBestBig3();
  const adherence = get7DayAdherence();

  const statusTagClass = adjustment.status === 'on_track'
    ? 'tag-success'
    : adjustment.status === 'creatine_caveat'
      ? 'tag-info'
      : adjustment.status === 'need_data'
        ? ''
        : 'tag-warn';

  return `
    ${lastSavedBanner ? `
      <section class="card" style="border-color: var(--success);">
        <div class="row-between">
          <div>
            <h2 class="card-title text-success">Session Saved: ${escapeHtml(lastSavedBanner.workoutName)}</h2>
            <p class="card-meta">${lastSavedBanner.totalSetsDone} sets${lastSavedBanner.durationMin ? ` · ${lastSavedBanner.durationMin} min` : ''}${lastSavedBanner.conditioningNote ? ` · ${escapeHtml(lastSavedBanner.conditioningNote)}` : ''}</p>
          </div>
          <button type="button" class="btn btn-sm btn-icon btn-ghost" aria-label="Dismiss session summary" data-action="dismiss-saved-banner">${icon('close')}</button>
        </div>
        ${lastSavedBanner.progressions?.length
          ? `<div class="tag tag-info" style="margin-top:8px;white-space:normal;">${icon('flame')} <span>Unlocked next session: ${lastSavedBanner.progressions.map(escapeHtml).join(' · ')}</span></div>`
          : ''}
      </section>
    ` : ''}

    <section class="card">
      <div class="card-header card-header-inline">
        <div style="min-width:0;">
          <h2 class="card-title">Quick Morning Weigh-In &amp; Waist</h2>
          <p class="card-meta">Nudge from last entry with 1 tap</p>
        </div>
        <button type="button" class="btn btn-sm ${state.photoLogs.includes(localTodayIso()) ? 'tag-success' : ''}" data-action="log-photo">
          ${state.photoLogs.includes(localTodayIso()) ? `${icon('check')} Photos` : '+ Photos'}
        </button>
      </div>

      <div class="grid-2" style="gap:12px;">
        <div class="panel-inset">
          <div class="control-label-row">
            <span>Scale Weight (lbs)</span>
            <input id="weight-date-input" type="date" aria-label="Weight log date" class="text-input" style="width:auto;min-height:32px;padding:4px 8px;" value="${localTodayIso()}" />
          </div>
          <div class="stepper-row">
            <button type="button" class="tap-chip" data-action="nudge-quick-metric" data-metric="weight" data-delta="-0.5">-0.5</button>
            <button type="button" class="tap-chip" data-action="nudge-quick-metric" data-metric="weight" data-delta="-0.2">-0.2</button>
            <input id="weight-val-input" type="number" step="0.1" inputmode="decimal" aria-label="Weight in pounds" class="num-input" value="${Number(pendingWeightInput).toFixed(1)}" />
            <button type="button" class="tap-chip" data-action="nudge-quick-metric" data-metric="weight" data-delta="0.2">+0.2</button>
            <button type="button" class="tap-chip" data-action="nudge-quick-metric" data-metric="weight" data-delta="0.5">+0.5</button>
          </div>
          <button type="button" class="btn btn-primary" data-action="add-weight">Save Weigh-In</button>
        </div>

        <div class="panel-inset">
          <div class="control-label-row">
            <span>Biweekly Waist (inches)</span>
            <input id="waist-date-input" type="date" aria-label="Waist log date" class="text-input" style="width:auto;min-height:32px;padding:4px 8px;" value="${localTodayIso()}" />
          </div>
          <div class="stepper-row">
            <button type="button" class="tap-chip" data-action="nudge-quick-metric" data-metric="waist" data-delta="-0.5">-0.5</button>
            <button type="button" class="tap-chip" data-action="nudge-quick-metric" data-metric="waist" data-delta="-0.25">-0.25</button>
            <input id="waist-val-input" type="number" step="0.05" inputmode="decimal" aria-label="Waist in inches" class="num-input" value="${formattedWaistVal}" />
            <button type="button" class="tap-chip" data-action="nudge-quick-metric" data-metric="waist" data-delta="0.25">+0.25</button>
            <button type="button" class="tap-chip" data-action="nudge-quick-metric" data-metric="waist" data-delta="0.5">+0.5</button>
          </div>
          <button type="button" class="btn" data-action="add-waist">Save Waist</button>
        </div>
      </div>

      <div class="kpi-strip" style="margin-top:12px;">
        <div class="kpi-cell">
          <div class="kpi-label">7-Day Protein Goal</div>
          <div class="kpi-value tabular">${adherence.proteinDays}/7 days</div>
          <div class="kpi-note">4/4 boluses checked</div>
        </div>
        <div class="kpi-cell">
          <div class="kpi-label">7-Day Steps Goal</div>
          <div class="kpi-value tabular">${adherence.stepDays}/7 days</div>
          <div class="kpi-note">8,000+ steps/day</div>
        </div>
        <div class="kpi-cell">
          <div class="kpi-label">Logged Sessions</div>
          <div class="kpi-value tabular">${state.workoutHistory.length}</div>
          <div class="kpi-note">Total completed</div>
        </div>
        <div class="kpi-cell">
          <div class="kpi-label">Progress Photos</div>
          <div class="kpi-value tabular">${state.photoLogs.length}</div>
          <div class="kpi-note">${state.photoLogs.length ? `Last: ${state.photoLogs[state.photoLogs.length - 1]}` : 'Biweekly morning'}</div>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="row-between" style="flex-wrap:wrap;gap:8px;margin-bottom:8px;">
        <div>
          <h2 class="card-title">Biweekly Adjustment Engine</h2>
          <p class="card-meta">${escapeHtml(adjustment.title)}</p>
        </div>
        <span class="tag ${statusTagClass}">${adjustment.status.replace('_', ' ').toUpperCase()}</span>
      </div>
      <div class="panel-inset" style="font-size:0.875rem;">
        <div>${escapeHtml(adjustment.recommendation)}</div>
        <div class="row-wrap" style="margin-top:4px;">
          ${adjustment.status === 'add_food' ? `<button type="button" class="btn btn-sm btn-primary" data-action="apply-adjustment" data-mode="add_food">Apply +150 kcal Lifting Days</button>` : ''}
          ${adjustment.status === 'cut_food' ? `
            <button type="button" class="btn btn-sm btn-primary" data-action="apply-adjustment" data-mode="cut_rest">Apply -150 kcal Rest Days</button>
            <button type="button" class="btn btn-sm" data-action="apply-adjustment" data-mode="add_steps">Apply +1,500 Steps</button>
          ` : ''}
          ${(state.calorieAdjustments?.liftingDeltaKcal || state.calorieAdjustments?.restDeltaKcal || (state.calorieAdjustments?.stepsFloor || 8000) > 8000)
            ? `<button type="button" class="btn btn-sm" data-action="apply-adjustment" data-mode="reset">Reset Adjustments</button>`
            : ''}
        </div>
      </div>
    </section>

    <section class="card">
      <div class="card-header">
        <div>
          <h2 class="card-title">Scale Weight &amp; 7-Day Rolling Average</h2>
          <p class="card-meta">Target: 173–177 lbs by Feb 22, 2027</p>
        </div>
        <div class="row-wrap">
          <span class="tag">Latest: ${latest.weight} lb</span>
          <span class="tag tag-info">7d Avg: ${latest.rollingAvg} lb (${deltaBaseline > 0 ? '+' : ''}${deltaBaseline})</span>
          ${latestWaist ? `<span class="tag tag-info">Waist: ${latestWaist.waist}"</span>` : ''}
        </div>
      </div>
      ${renderWeightSvgChart(series)}

      ${series.length > 1 || sortedWaists.length > 0 || state.photoLogs.length > 0 ? `
        <div class="divider" style="margin:12px 0;"></div>
        <div class="control-label-row" style="margin-bottom:8px;">
          <span>Recent Weigh-Ins, Waist &amp; Photos</span>
          <span>Tap × to remove (with Undo)</span>
        </div>
        <div class="row-wrap">
          ${[...series].reverse().slice(0, 8).map((w) => `
            <button type="button" class="btn btn-sm" data-action="delete-weight" data-date="${w.date}" title="Remove weigh-in" ${series.length <= 1 ? 'disabled' : ''}>
              <span class="tabular">${w.date.slice(5)}: ${w.weight} lb</span>
              ${series.length > 1 ? icon('close') : ''}
            </button>
          `).join('')}
          ${[...sortedWaists].reverse().slice(0, 6).map((wz) => `
            <button type="button" class="btn btn-sm tag-info" data-action="delete-waist" data-date="${wz.date}" title="Remove waist log">
              <span class="tabular">${wz.date.slice(5)}: ${wz.waist}"</span>
              ${icon('close')}
            </button>
          `).join('')}
          ${[...state.photoLogs].sort((a, b) => b.localeCompare(a)).slice(0, 4).map((d) => `
            <button type="button" class="btn btn-sm" data-action="delete-photo" data-date="${d}" title="Remove photo check-in">
              <span class="tabular">Photos ${d.slice(5)}</span>
              ${icon('close')}
            </button>
          `).join('')}
        </div>
      ` : ''}
    </section>

    <section class="card">
      <div class="card-header">
        <div>
          <h2 class="card-title">Big 3 Strength Progress (Working Sets)</h2>
          <p class="card-meta">Baseline → Current Best Logged → 90-Day Target</p>
        </div>
      </div>
      <div class="check-list">
        ${Object.values(PLAN_CONFIG.strengthTargets).map((t) => {
          const curr = bestBig3[t.key];
          const maxGoal = t.stretch || t.targetMax;
          const spanGoal = Math.max(1, maxGoal - t.baseline);
          const pct = Math.min(100, Math.max(0, Math.round(((curr - t.baseline) / spanGoal) * 100)));
          const ratio = pct / 100;
          const minTickPct = Math.min(96, Math.max(4, Math.round(((t.targetMin - t.baseline) / spanGoal) * 100)));
          return `
            <div class="logger-section">
              <div class="row-between" style="margin-bottom:6px;flex-wrap:wrap;gap:4px;">
                <span style="font-weight:700;font-size:0.9375rem;">${escapeHtml(t.label)} (${escapeHtml(t.repLabel)})</span>
                <span class="tabular" style="font-size:0.8125rem;">
                  <strong>${curr} ${escapeHtml(t.unit || 'lbs')}</strong> <span class="muted-sm">/ Target ${t.targetMin}–${t.targetMax}${t.stretch ? ` (${t.stretch} stretch)` : ''}</span>
                </span>
              </div>
              <div class="bar-track bar-track-goal">
                <div class="bar-fill" style="transform: scaleX(${ratio.toFixed(4)});background:${pct >= 100 ? 'var(--success)' : 'var(--info)'};"></div>
                <div class="bar-target-tick" style="left:${minTickPct}%;" title="Minimum 90-day target (${t.targetMin})"></div>
              </div>
              <div class="row-between muted-sm" style="margin-top:4px;">
                <span>Start: ${t.baseline} ${escapeHtml(t.unit || 'lbs')}${bestE1rm[t.key] ? ` · Best e1RM ~${bestE1rm[t.key]} lbs` : ''}</span>
                <span class="tabular">${pct}% toward goal</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </section>

    <section class="card">
      <div class="card-header">
        <div>
          <h2 class="card-title">Workout Logbook (${state.workoutHistory.length} Sessions)</h2>
          <p class="card-meta">Tap a session to inspect or delete individual sets</p>
        </div>
      </div>
      ${state.workoutHistory.length === 0
        ? '<p class="muted-sm">No completed sessions saved yet. Open Train and log your first workout.</p>'
        : `<div class="list-divided">
            ${[...state.workoutHistory].reverse().slice(0, 15).map((h) => {
              const isOpen = expandedHistoryId === h.id;
              return `
                <div class="list-item">
                  <div class="row-between">
                    <button type="button" class="btn btn-ghost" style="padding:0;min-height:auto;justify-content:flex-start;text-align:left;flex:1;" data-action="toggle-history-expand" data-id="${escapeHtml(h.id)}">
                      <div>
                        <div style="font-weight:700;font-size:0.875rem;">${escapeHtml(h.workoutName)}</div>
                        <div class="muted-sm">${escapeHtml(h.date)} · ${escapeHtml(PHASES[h.phase]?.label || h.phase)} · ${h.durationMin ? `${h.durationMin} min` : 'Logged'}${h.conditioningNote ? ` · ${escapeHtml(h.conditioningNote)}` : ''}</div>
                      </div>
                    </button>
                    <div class="row-wrap">
                      <button type="button" class="btn btn-sm" data-action="toggle-history-expand" data-id="${escapeHtml(h.id)}">${isOpen ? 'Hide' : `${h.totalSetsDone} sets`}</button>
                      <button type="button" class="btn btn-sm btn-icon btn-ghost" aria-label="Delete session" data-action="delete-history" data-id="${escapeHtml(h.id)}">${icon('close')}</button>
                    </div>
                  </div>
                  ${h.progressions?.length ? `<div class="muted-sm text-info" style="margin-top:4px;font-weight:600;">Ready to progress: ${h.progressions.map(escapeHtml).join(' · ')}</div>` : ''}
                  ${h.adherenceSummary ? `<div class="muted-sm" style="margin-top:4px;color:${h.adherenceSummary.deviatedCount > 0 ? 'var(--amber)' : 'var(--text-muted)'};">${h.adherenceSummary.deviatedCount > 0 ? `Modified (${h.adherenceSummary.deviatedCount}): ${h.adherenceSummary.deviations.map(escapeHtml).join(' · ')}` : 'Adherence: On Plan'}</div>` : ''}
                  ${isOpen ? `
                    <div class="panel-inset" style="margin-top:12px;">
                      ${Array.isArray(h.exercises) && h.exercises.length > 0
                        ? h.exercises.map((exEntry, exIdx) => `
                            <div class="control-group">
                              <div class="control-label-row">
                                <span>${escapeHtml(exEntry.name)}</span>
                                <span class="tabular">${exEntry.sets.length} sets</span>
                              </div>
                              <div class="tap-chips-row">
                                ${exEntry.sets.map((s, sIdx) => `
                                  <span class="history-set-chip">
                                    <button type="button" class="btn btn-ghost" style="padding:2px 4px;min-height:28px;font-size:inherit;"
                                      data-action="open-edit-history-set" data-id="${escapeHtml(h.id)}" data-exidx="${exIdx}" data-setidx="${sIdx}" title="Edit saved set">#${sIdx + 1}: ${s.weight || 'BW'}×${s.reps} @ ${s.rir}</button>
                                    <button type="button" class="history-set-del" aria-label="Delete set ${sIdx + 1} of ${escapeHtml(exEntry.name)}"
                                      data-action="delete-history-set" data-id="${escapeHtml(h.id)}" data-exidx="${exIdx}" data-setidx="${sIdx}">${icon('close')}</button>
                                  </span>
                                `).join('')}
                              </div>
                            </div>
                          `).join('')
                        : '<div class="muted-sm">Legacy session summary only (no per-set breakdown stored).</div>'}
                      ${Array.isArray(h.exercises) && h.exercises.length > 0 && getWorkouts()[h.workoutId] ? `
                        <div class="row-between" style="margin-top:8px;">
                          <span class="muted-sm">Saved by mistake? Reopen to keep logging.</span>
                          <button type="button" class="btn btn-sm" data-action="reopen-history-session" data-id="${escapeHtml(h.id)}">Reopen in Train</button>
                        </div>
                      ` : ''}
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>`
      }
    </section>
  `;
}

function renderMarkdownHtml(md) {
  const inline = (txt) => escapeHtml(txt)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');

  const lines = String(md || '').split('\n');
  let html = '';
  let inList = false;
  const closeList = () => {
    if (inList) {
      html += '</ul>';
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      closeList();
      continue;
    }
    if (line.startsWith('# ')) {
      closeList();
      html += `<h3 style="margin:8px 0 4px;font-size:1rem;font-weight:700;">${inline(line.slice(2))}</h3>`;
    } else if (line.startsWith('## ')) {
      closeList();
      html += `<h4 style="margin:12px 0 4px;font-size:0.875rem;font-weight:700;color:var(--info);">${inline(line.slice(3))}</h4>`;
    } else if (line.startsWith('- ')) {
      if (!inList) {
        html += '<ul style="margin:4px 0 8px;padding-left:18px;display:flex;flex-direction:column;gap:4px;">';
        inList = true;
      }
      html += `<li class="muted-sm" style="color:var(--text);">${inline(line.slice(2))}</li>`;
    } else {
      closeList();
      html += `<p class="muted-sm" style="margin:4px 0;">${inline(line)}</p>`;
    }
  }
  closeList();
  return html;
}

function renderPlanDiffItems() {
  const diffs = [];
  if (state.customWorkouts) {
    diffs.push(`Custom workout template active (${escapeHtml(state.activePlanVersionId || 'v2')})`);
  }
  const activeSwaps = Object.entries(state.swapsBySlot || {}).filter(([exId, name]) => {
    const baseEx = Object.values(WORKOUTS).flatMap((w) => w.exercises).find((e) => e.id === exId);
    return baseEx && baseEx.name !== name;
  });
  for (const [exId, name] of activeSwaps) {
    const baseEx = Object.values(WORKOUTS).flatMap((w) => w.exercises).find((e) => e.id === exId);
    diffs.push(`Swap: ${baseEx.name} -> ${name}`);
  }
  const adj = state.calorieAdjustments || {};
  if (adj.liftingDeltaKcal) diffs.push(`Lifting kcal adjustment: ${adj.liftingDeltaKcal > 0 ? '+' : ''}${adj.liftingDeltaKcal} kcal`);
  if (adj.restDeltaKcal) diffs.push(`Rest kcal adjustment: ${adj.restDeltaKcal > 0 ? '+' : ''}${adj.restDeltaKcal} kcal`);
  if ((adj.stepsFloor || 8000) > 8000) diffs.push(`Steps floor raised to ${adj.stepsFloor.toLocaleString()}/day`);
  if (state.hungerTightSwing) diffs.push('Tighter hunger-swing mode active (2,450 / 2,200 kcal)');
  if (state.phaseMode !== 'auto') diffs.push(`Manual phase override: ${PHASES[state.phaseMode]?.label || state.phaseMode}`);
  return diffs;
}

function renderPlanView() {
  const is5 = state.weeklySplitMode === 5;
  const planDiffs = renderPlanDiffItems();
  const volRows = [
    { muscle: 'Back (Width & Thickness)', sets: is5 ? 15 : 12 },
    { muscle: 'Chest (Flat & Upper)', sets: is5 ? 12 : 9 },
    { muscle: 'Side Delts', sets: is5 ? 10 : 6 },
    { muscle: 'Rear Delts', sets: is5 ? 9 : 6 },
    { muscle: 'Biceps & Triceps (each)', sets: is5 ? 9 : 6 },
    { muscle: 'Quads & Hamstrings (each)', sets: 9 }
  ];

  return `
    ${lastSavedBanner ? `
      <section class="card" style="border-color: var(--success);">
        <div class="row-between">
          <div>
            <h2 class="card-title text-success">Session Saved: ${escapeHtml(lastSavedBanner.workoutName)}</h2>
            <p class="card-meta">${lastSavedBanner.totalSetsDone} sets${lastSavedBanner.durationMin ? ` · ${lastSavedBanner.durationMin} min` : ''}${lastSavedBanner.conditioningNote ? ` · ${escapeHtml(lastSavedBanner.conditioningNote)}` : ''}</p>
          </div>
          <button type="button" class="btn btn-sm btn-icon btn-ghost" aria-label="Dismiss session summary" data-action="dismiss-saved-banner">${icon('close')}</button>
        </div>
        ${lastSavedBanner.progressions?.length
          ? `<div class="tag tag-info" style="margin-top:8px;white-space:normal;">${icon('flame')} <span>Unlocked next session: ${lastSavedBanner.progressions.map(escapeHtml).join(' · ')}</span></div>`
          : ''}
      </section>
    ` : ''}

    <section class="card">
      <div class="card-header">
        <div>
          <h2 class="card-title">90-Day Roadmap &amp; Weekly Volume</h2>
          <p class="card-meta">${is5 ? '5-Day Mode (~99 sets/wk · ~2,400 kcal avg)' : '4-Day Base (~80 sets/wk · ~2,330 kcal avg)'}</p>
        </div>
        <div class="segmented">
          <button type="button" class="seg-btn seg-btn-primary" aria-selected="${!is5}" data-action="set-split-mode" data-mode="4">4-Day Base</button>
          <button type="button" class="seg-btn seg-btn-primary" aria-selected="${is5}" data-action="set-split-mode" data-mode="5">5-Day (+Aesthetic)</button>
        </div>
      </div>

      <div class="kpi-strip kpi-strip-3" style="margin-bottom:12px;">
        ${volRows.map((v) => `
          <div class="kpi-cell">
            <div class="kpi-label">${escapeHtml(v.muscle)}</div>
            <div class="kpi-value tabular">${v.sets} <span class="muted-sm">sets/wk</span></div>
          </div>
        `).join('')}
      </div>

      <div class="list-divided">
        ${Object.values(PHASES).map((p) => `
          <div class="list-item">
            <div style="font-weight:700;font-size:0.875rem;">${escapeHtml(p.label)} · <span class="muted-sm">${escapeHtml(p.range)}</span></div>
            <div class="muted-sm" style="margin-top:4px;">${escapeHtml(p.summary)}</div>
          </div>
        `).join('')}
      </div>
    </section>

    <section class="card">
      <div class="card-header">
        <div>
          <h2 class="card-title">High-Protein Takeout Playbook</h2>
          <p class="card-meta">Double lean meat · sauces on side · extra rice on evening lift days</p>
        </div>
      </div>
      <div class="list-divided">
        ${NUTRITION.takeoutPlaybook.map((t) => `
          <div class="list-item">
            <div class="row-between" style="flex-wrap:wrap;gap:4px;">
              <strong style="font-size:0.9375rem;">${escapeHtml(t.name)}</strong>
              <span class="tag tag-info tabular">${escapeHtml(t.kcal)} kcal · ${escapeHtml(t.protein)}</span>
            </div>
            <div class="muted-sm" style="margin-top:4px;">${escapeHtml(t.notes)}</div>
          </div>
        `).join('')}
      </div>
    </section>

    <section class="card">
      <div class="card-header">
        <div>
          <h2 class="card-title">Sample High-Protein Recomp Meals</h2>
          <p class="card-meta">Quick high-satiety options hitting 38–52g protein</p>
        </div>
      </div>
      <div class="list-divided">
        ${NUTRITION.sampleMeals.map((m) => `
          <div class="list-item">
            <div class="row-between" style="flex-wrap:wrap;gap:4px;">
              <strong style="font-size:0.9375rem;">${escapeHtml(m.name)}</strong>
              <span class="tag tag-info tabular">${m.kcal} kcal · ${m.protein}g P · ${escapeHtml(m.prep)}</span>
            </div>
            <div class="muted-sm" style="margin-top:4px;">${escapeHtml(m.notes)}</div>
          </div>
        `).join('')}
      </div>
    </section>

    <section class="card">
      <div class="card-header">
        <div>
          <h2 class="card-title">Execution Guardrails</h2>
          <p class="card-meta">Joint protection, symmetry &amp; commercial-gym rules</p>
        </div>
      </div>
      <div class="list-divided">
        <div class="list-item"><strong>Left Arm First:</strong> Always start unilateral DB/cable lifts with your left arm and cap your right arm at the same reps.</div>
        <div class="list-item"><strong>No Skullcrushers:</strong> Elbow-friendly tricep pushdowns &amp; overhead extensions only.</div>
        <div class="list-item"><strong>2-Min Shoulder Prehab:</strong> External rotations + band pull-aparts before every Upper session.</div>
        <div class="list-item"><strong>Busy Week (3 Days):</strong> Run the 4-day base on a rolling schedule (Upper A → Lower A → Upper B, then Lower B Monday).</div>
      </div>
    </section>

    <section class="card">
      <div class="card-header">
        <div>
          <h2 class="card-title">Customize Workouts &amp; Plan Versions</h2>
          <p class="card-meta">Active: ${escapeHtml(state.activePlanVersionId || 'v1')} · Every edit saves a separate versioned JSON snapshot for model analysis</p>
        </div>
        <button type="button" class="btn btn-sm btn-primary" data-action="export-all-plan-versions">Export All Versions</button>
      </div>

      <div class="row-wrap" style="margin-bottom:12px;">
        ${Object.values(getWorkouts()).map((w) => `
          <button type="button" class="btn btn-sm" data-action="open-plan-editor" data-workout="${w.id}">Edit ${escapeHtml(w.shortName)}</button>
        `).join('')}
      </div>

      <div class="list-divided">
        ${[...(state.planVersions || [])].reverse().map((v) => `
          <div class="list-item">
            <div class="row-between" style="flex-wrap:wrap;gap:8px;">
              <div>
                <div style="font-weight:700;font-size:0.875rem;">
                  <span class="tag ${v.versionId === state.activePlanVersionId ? 'tag-success' : ''}" style="margin-right:6px;">${escapeHtml(v.versionId)}</span>
                  ${escapeHtml(v.note)}
                </div>
                <div class="muted-sm" style="margin-top:4px;">${escapeHtml(v.effectiveDate)} · Week ${v.planWeek} (Day ${v.planDay}) · ${escapeHtml(PHASES[v.phase]?.label || v.phase)}</div>
              </div>
              <div class="row-wrap">
                <button type="button" class="btn btn-sm" data-action="export-plan-version" data-version="${escapeHtml(v.versionId)}">Export JSON</button>
                ${v.versionId !== state.activePlanVersionId ? `<button type="button" class="btn btn-sm" data-action="restore-plan-version" data-version="${escapeHtml(v.versionId)}">Restore</button>` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <section class="card">
      <div class="card-header">
        <div>
          <h2 class="card-title">Full 90-Day Plan vs. Current Tracker</h2>
          <p class="card-meta">${planDiffs.length === 0 ? 'Tracker matches the baseline markdown plan 1:1' : `${planDiffs.length} active customization${planDiffs.length === 1 ? '' : 's'} from baseline`}</p>
        </div>
        <div class="row-wrap">
          <button type="button" class="btn btn-sm" data-action="copy-plan-md">Copy MD</button>
          <button type="button" class="btn btn-sm btn-primary" data-action="toggle-full-plan">${showFullPlanDoc ? 'Hide Full Plan' : 'Read Full Plan'}</button>
        </div>
      </div>

      ${planDiffs.length > 0 ? `
        <div class="list-divided" style="margin-bottom:${showFullPlanDoc ? '12px' : '0'};">
          ${planDiffs.map((d) => `<div class="list-item" style="font-size:0.875rem;color:var(--amber);">${escapeHtml(d)}</div>`).join('')}
        </div>
      ` : ''}

      ${showFullPlanDoc ? `
        <div class="panel-inset" style="max-height:540px;overflow-y:auto;">${renderMarkdownHtml(FULL_PLAN_MARKDOWN)}</div>
      ` : ''}
    </section>

    <section class="card">
      <div class="card-header">
        <div>
          <h2 class="card-title">Backup, Restore &amp; Settings</h2>
          <p class="card-meta">All data stays private in browser localStorage + portable JSON backup</p>
        </div>
      </div>
      <div class="row-between" style="margin-bottom:12px;flex-wrap:wrap;gap:8px;">
        <label for="plan-start-date" style="font-weight:600;font-size:0.875rem;">Plan Start Date (Day 1)</label>
        <input id="plan-start-date" type="date" class="text-input" style="max-width:170px;" value="${escapeHtml(state.startDate)}" data-action="set-start-date" />
      </div>
      <div class="row-wrap">
        <button type="button" class="btn btn-primary" data-action="export-json">Export JSON Backup</button>
        <label class="btn" style="cursor:pointer;">
          Import JSON Backup
          <input type="file" accept="application/json,.json" id="import-json-input" style="display:none;" />
        </label>
      </div>
      <div class="divider" style="margin:14px 0;"></div>
      <div class="row-between" style="flex-wrap:wrap;gap:8px;">
        <span class="muted-sm">Start fresh from baseline (export backup first)</span>
        <button type="button" class="btn btn-sm btn-danger" data-action="reset-data">Reset All Data</button>
      </div>
    </section>
  `;
}

let activeAccordionCleanup = null;

function cancelAccordionAnimations() {
  if (typeof activeAccordionCleanup === 'function') {
    const fn = activeAccordionCleanup;
    activeAccordionCleanup = null;
    fn();
  }
}

function syncExerciseAccordionInPlace(workout, draft, { targetExId = null, scrollToTarget = false } = {}) {
  const main = document.getElementById('main-view');
  const cards = Array.from(document.querySelectorAll('.exercise-card[data-ex-card]'));
  if (!main || cards.length === 0) {
    renderMain();
    return;
  }

  const focusBtn = document.getElementById('focus-mode-btn');
  if (focusBtn) {
    focusBtn.textContent = state.trainFocusMode ? 'Show all' : 'Focus active';
  }

  const topItems = Array.from(main.children);
  const supersetGroups = topItems.filter((el) => el.classList.contains('superset-group'));

  // 1. FIRST: Measure live visual rects BEFORE canceling in-flight animations (seamless mid-flight interruption)
  const beforeRects = new Map();
  const prevExpandedMap = new Map();
  const prevBodyHeightMap = new Map();
  for (const el of topItems) {
    beforeRects.set(el, el.getBoundingClientRect());
  }
  for (const card of cards) {
    beforeRects.set(card, card.getBoundingClientRect());
    const wasExp = card.classList.contains('is-expanded');
    prevExpandedMap.set(card, wasExp);
    const col = card.querySelector('.exercise-collapse');
    prevBodyHeightMap.set(card, wasExp && col ? col.getBoundingClientRect().height : 0);
  }

  // Cancel any prior WAAPI animations & clean up temporary overlay classes
  cancelAccordionAnimations();

  // 2. LAST: Apply final DOM state in ONE synchronous pass (zero per-frame layout!)
  const nextExpandedSet = getExpandedExerciseIds(workout, draft);
  const targetCard = targetExId
    ? cards.find((c) => c.dataset.exCard === targetExId) || null
    : null;

  const openingCards = [];
  const closingCards = [];
  for (const card of cards) {
    const exId = card.dataset.exCard;
    const col = card.querySelector('.exercise-collapse');
    const toggleBtn = card.querySelector('.exercise-toggle');
    const shouldExpand = nextExpandedSet.has(exId);
    const wasExpanded = prevExpandedMap.get(card);

    card.classList.toggle('is-active', exId === draft.activeExId);
    card.classList.toggle('is-expanded', shouldExpand);
    card.classList.toggle('is-collapsed', !shouldExpand);
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', String(shouldExpand));
    if (col) {
      if (shouldExpand) col.removeAttribute('inert');
      else col.setAttribute('inert', '');
    }

    if (shouldExpand && !wasExpanded) openingCards.push(card);
    else if (!shouldExpand && wasExpanded) closingCards.push(card);
  }

  // Commit final scroll position ONCE at Frame 0 so targetCard lands cleanly below sticky header
  const headerEl = document.querySelector('.top-header');
  const stickyOffset = Math.ceil((headerEl ? headerEl.offsetHeight : 0) + 12);
  if (scrollToTarget && targetCard) {
    const finalTargetDocTop = targetCard.getBoundingClientRect().top + window.scrollY;
    const finalMaxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const endScrollY = Math.max(0, Math.min(finalTargetDocTop - stickyOffset, finalMaxScrollY));
    if (Math.abs(endScrollY - window.scrollY) >= 2) {
      window.scrollTo(0, endScrollY);
    }
  }

  if (prefersReducedMotion()) {
    return;
  }

  // 3. Measure final screen positions ONCE
  const afterRects = new Map();
  for (const el of topItems) {
    afterRects.set(el, el.getBoundingClientRect());
  }
  for (const card of cards) {
    afterRects.set(card, card.getBoundingClientRect());
  }

  const vh = window.innerHeight;
  const nearViewport = (r) => r && r.bottom >= -320 && r.top <= vh + 320;
  const openingSet = new Set(openingCards);
  const closingSet = new Set(closingCards);

  const anyOpening = openingCards.length > 0;
  const durationMs = anyOpening ? 280 : 220;
  const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const opDurMs = anyOpening ? 200 : 180;

  const anims = [];
  const tempElevated = [];
  const tempClosingHosts = [];

  // Attach zero-layout absolute overlays for visible collapsing cards so they smoothly clip shut on GPU
  for (const card of closingCards) {
    const b = beforeRects.get(card);
    const a = afterRects.get(card);
    const bodyH = prevBodyHeightMap.get(card) || 0;
    if (bodyH < 2 || (!nearViewport(b) && !nearViewport(a))) continue;
    const col = card.querySelector('.exercise-collapse');
    if (!col) continue;
    card.classList.add('is-collapsing-host');
    col.classList.add('is-collapsing-overlay');
    tempClosingHosts.push({ card, col });
    anims.push(
      col.animate(
        [
          { clipPath: 'inset(0px 0px 0px 0px round 0px 0px 16px 16px)', opacity: 1 },
          { clipPath: `inset(0px 0px ${bodyH.toFixed(1)}px 0px round 0px 0px 16px 16px)`, opacity: 0 }
        ],
        { duration: durationMs, easing: ease }
      )
    );
  }

  // 4. INVERT & PLAY via 100% GPU-composited WAAPI (transform + clipPath + opacity)
  for (const el of topItems) {
    const b = beforeRects.get(el);
    const a = afterRects.get(el);
    if (!b || !a || (!nearViewport(b) && !nearViewport(a))) continue;

    const dy = b.top - a.top;
    const isOpeningSingle = openingSet.has(el);
    const isSuperset = el.classList.contains('superset-group');
    const isClosingSingle = closingSet.has(el);

    if (!isClosingSingle && tempClosingHosts.length > 0) {
      el.classList.add('exercise-flip-elevated');
      tempElevated.push(el);
    }

    if (isOpeningSingle) {
      const clipDelta = Math.max(0, a.height - b.height);
      const fromFrame = { transform: `translate3d(0, ${dy.toFixed(1)}px, 0)` };
      const toFrame = { transform: 'translate3d(0, 0, 0)' };
      if (clipDelta >= 2) {
        fromFrame.clipPath = `inset(0px 0px ${clipDelta.toFixed(1)}px 0px round 16px)`;
        toFrame.clipPath = 'inset(0px 0px 0px 0px round 16px)';
      }
      if (Math.abs(dy) >= 0.5 || clipDelta >= 2) {
        anims.push(el.animate([fromFrame, toFrame], { duration: durationMs, easing: ease }));
      }
      const col = el.querySelector('.exercise-collapse');
      if (col) {
        anims.push(col.animate([{ opacity: 0 }, { opacity: 1 }], { duration: opDurMs, easing: ease }));
      }
    } else if (isSuperset) {
      const groupDelta = a.height - b.height;
      const fromFrame = { transform: `translate3d(0, ${dy.toFixed(1)}px, 0)` };
      const toFrame = { transform: 'translate3d(0, 0, 0)' };
      if (groupDelta >= 2) {
        fromFrame.clipPath = `inset(0px 0px ${groupDelta.toFixed(1)}px 0px round 16px)`;
        toFrame.clipPath = 'inset(0px 0px 0px 0px round 16px)';
      }
      if (Math.abs(dy) >= 0.5 || groupDelta >= 2) {
        anims.push(el.animate([fromFrame, toFrame], { duration: durationMs, easing: ease }));
      }

      // Animate inner cards relative to their superset group (zero double-translation!)
      const groupCards = Array.from(el.querySelectorAll(':scope > .exercise-card[data-ex-card]'));
      for (const card of groupCards) {
        const cb = beforeRects.get(card);
        const ca = afterRects.get(card);
        if (!cb || !ca) continue;
        const relDy = (cb.top - b.top) - (ca.top - a.top);
        const cardIsOpening = openingSet.has(card);
        const clipDelta = cardIsOpening ? Math.max(0, ca.height - cb.height) : 0;

        if (!closingSet.has(card) && tempClosingHosts.length > 0) {
          card.classList.add('exercise-flip-elevated');
          tempElevated.push(card);
        }

        if (Math.abs(relDy) >= 0.5 || clipDelta >= 2) {
          const cf = { transform: `translate3d(0, ${relDy.toFixed(1)}px, 0)` };
          const ct = { transform: 'translate3d(0, 0, 0)' };
          if (clipDelta >= 2) {
            cf.clipPath = `inset(0px 0px ${clipDelta.toFixed(1)}px 0px round 16px)`;
            ct.clipPath = 'inset(0px 0px 0px 0px round 16px)';
          }
          anims.push(card.animate([cf, ct], { duration: durationMs, easing: ease }));
        }
        if (cardIsOpening) {
          const col = card.querySelector('.exercise-collapse');
          if (col) {
            anims.push(col.animate([{ opacity: 0 }, { opacity: 1 }], { duration: opDurMs, easing: ease }));
          }
        }
      }
    } else if (Math.abs(dy) >= 0.5) {
      anims.push(
        el.animate(
          [
            { transform: `translate3d(0, ${dy.toFixed(1)}px, 0)` },
            { transform: 'translate3d(0, 0, 0)' }
          ],
          { duration: durationMs, easing: ease }
        )
      );
    }
  }

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    for (const a of anims) {
      try { a.cancel(); } catch { /* ignore */ }
    }
    for (const { card, col } of tempClosingHosts) {
      card.classList.remove('is-collapsing-host');
      col.classList.remove('is-collapsing-overlay');
    }
    for (const el of tempElevated) {
      el.classList.remove('exercise-flip-elevated');
    }
    if (activeAccordionCleanup === cleanup) {
      activeAccordionCleanup = null;
    }
  };

  if (anims.length === 0) {
    cleanup();
    return;
  }

  activeAccordionCleanup = cleanup;
  Promise.allSettled(anims.map((a) => a.finished)).then(() => {
    if (activeAccordionCleanup === cleanup) cleanup();
  });
}

function renderMain({ overrideExpandedIds = null } = {}) {
  cancelAccordionAnimations();
  applyTheme();
  renderHeader();
  renderRestDock();
  syncWakeLock();
  const main = document.getElementById('main-view');
  if (state.activeTab === 'today') main.innerHTML = renderTodayView();
  else if (state.activeTab === 'train') main.innerHTML = renderTrainView({ overrideExpandedIds });
  else if (state.activeTab === 'progress') main.innerHTML = renderProgressView();
  else main.innerHTML = renderPlanView();
  justCheckedTarget = null;
}

function prefersReducedMotion() {
  return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
}

function renderMainWithTransition({ focusMain = false, onSettled = null } = {}) {
  const modalOpen = !document.getElementById('modal-backdrop')?.classList.contains('hidden');
  if (!document.startViewTransition || modalOpen) {
    renderMain();
    if (focusMain) document.getElementById('main-view')?.focus({ preventScroll: true });
    if (typeof onSettled === 'function') onSettled();
    return;
  }
  const vt = document.startViewTransition(() => {
    renderMain();
  });
  vt.finished.finally(() => {
    if (focusMain) document.getElementById('main-view')?.focus({ preventScroll: true });
    if (typeof onSettled === 'function') onSettled();
  });
}

// ---------- Event Delegation ----------
document.addEventListener('click', (e) => {
  if (e.target.id === 'toast-undo-btn') {
    const fn = pendingUndoFn;
    pendingUndoFn = null;
    clearTimeout(showToast._t);
    hideAnimatedEl(document.getElementById('toast'));
    if (fn) fn();
    return;
  }

  const navBtn = e.target.closest('.nav-tab');
  if (navBtn) {
    const nextTab = navBtn.dataset.tab;
    if (nextTab === state.activeTab) return;
    if (nextTab !== 'progress') lastSavedBanner = null;
    state.activeTab = nextTab;
    saveState();
    renderMainWithTransition({ focusMain: true });
    return;
  }

  const target = e.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;

  if (action === 'shift-date') {
    const delta = Number(target.dataset.days);
    const d = new Date(`${state.selectedDate}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + delta);
    state.selectedDate = d.toISOString().slice(0, 10);
    saveState();
    renderMain();
  } else if (action === 'jump-today') {
    state.selectedDate = localTodayIso();
    state.lastOpenedDate = state.selectedDate;
    saveState();
    renderMain();
  } else if (action === 'set-day-type') {
    const log = ensureDailyLog(state.selectedDate);
    log.dayType = target.dataset.type;
    saveState();
    renderMain();
  } else if (action === 'toggle-hunger-swing') {
    state.hungerTightSwing = !state.hungerTightSwing;
    saveState();
    renderMain();
  } else if (action === 'toggle-meal') {
    const log = ensureDailyLog(state.selectedDate);
    const id = target.dataset.id;
    log.meals[id] = !log.meals[id];
    justCheckedTarget = log.meals[id] ? `meal:${id}` : null;
    saveState();
    renderMain();
  } else if (action === 'toggle-habit') {
    const log = ensureDailyLog(state.selectedDate);
    const id = target.dataset.id;
    log.habits[id] = !log.habits[id];
    justCheckedTarget = log.habits[id] ? `habit:${id}` : null;
    saveState();
    renderMain();
  } else if (action === 'quick-daily') {
    const log = ensureDailyLog(state.selectedDate);
    const field = target.dataset.field;
    const val = target.dataset.val;
    log[field] = String(log[field]) === val ? '' : val;
    saveState();
    renderMain();
  } else if (action === 'go-train') {
    unlockAudio();
    state.activeWorkoutId = target.dataset.workout;
    state.activeTab = 'train';
    saveState();
    renderMainWithTransition({ focusMain: true });
  } else if (action === 'go-progress') {
    state.activeTab = 'progress';
    saveState();
    renderMainWithTransition({ focusMain: true });
  } else if (action === 'open-quick-weighin') {
    openQuickWeighInModal(state.selectedDate);
  } else if (action === 'save-quick-weight') {
    const dateVal = document.getElementById('quick-weight-date')?.value || state.selectedDate || localTodayIso();
    const weightVal = Number(document.getElementById('quick-weight-val')?.value);
    if (!Number.isFinite(weightVal) || weightVal < 70 || weightVal > 450) {
      showToast('Enter a valid scale weight in lbs.');
      return;
    }
    const existingIdx = state.weightLogs.findIndex((w) => w.date === dateVal);
    if (existingIdx >= 0) state.weightLogs[existingIdx].weight = weightVal;
    else state.weightLogs.push({ date: dateVal, weight: weightVal });
    ensureDailyLog(dateVal).weighInSkipped = false;
    pendingWeightInput = weightVal;
    selectedChartIdx = null;
    saveState();
    closeModal();
    showToast(`Logged ${weightVal} lbs for ${formatHumanDate(dateVal)}`);
    renderMain();
  } else if (action === 'select-strip-date') {
    if (target.dataset.date) {
      state.selectedDate = target.dataset.date;
      saveState();
      renderMain();
    }
  } else if (action === 'toggle-skip-weighin') {
    const log = ensureDailyLog(state.selectedDate);
    log.weighInSkipped = !log.weighInSkipped;
    saveState();
    renderMain();
  } else if (action === 'apply-adjustment') {
    const mode = target.dataset.mode;
    if (!state.calorieAdjustments) state.calorieAdjustments = { liftingDeltaKcal: 0, restDeltaKcal: 0, stepsFloor: 8000 };
    if (mode === 'add_food') {
      state.calorieAdjustments.liftingDeltaKcal += 150;
      showToast('Applied +150 kcal to Lifting Days');
    } else if (mode === 'cut_rest') {
      state.calorieAdjustments.restDeltaKcal -= 150;
      showToast('Applied -150 kcal to Rest Days');
    } else if (mode === 'add_steps') {
      state.calorieAdjustments.stepsFloor = (state.calorieAdjustments.stepsFloor || 8000) + 1500;
      showToast(`Steps floor raised to ${state.calorieAdjustments.stepsFloor.toLocaleString()}/day`);
    } else if (mode === 'reset') {
      state.calorieAdjustments = { liftingDeltaKcal: 0, restDeltaKcal: 0, stepsFloor: 8000 };
      showToast('Reset calorie & step adjustments to baseline');
    }
    saveState();
    renderMain();
  } else if (action === 'open-holiday') {
    openHolidayModal();
  } else if (action === 'bank-kcal') {
    const delta = target.dataset.delta;
    state.bankedKcal = delta === 'reset' ? 0 : state.bankedKcal + Number(delta);
    saveState();
    openHolidayModal();
    renderMain();
  } else if (action === 'set-phase') {
    state.phaseMode = target.dataset.phase;
    saveState();
    openPhaseModal();
    renderMain();
  } else if (action === 'toggle-wk10-bonus') {
    const { bonusWk10Sets } = getEffectivePhase();
    state.bonusWk10Manual = !bonusWk10Sets;
    saveState();
    openPhaseModal();
    renderMain();
  } else if (action === 'select-workout') {
    if (state.activeWorkoutId === target.dataset.workout) return;
    state.activeWorkoutId = target.dataset.workout;
    saveState();
    renderMainWithTransition();
  } else if (action === 'open-workout-settings') {
    openWorkoutSettingsModal();
  } else if (action === 'toggle-focus-mode') {
    const workout = getWorkouts()[state.activeWorkoutId];
    const draft = ensureWorkoutDraft(state.activeWorkoutId);
    state.trainFocusMode = !state.trainFocusMode;
    if (!state.trainFocusMode) {
      draft.collapsedExIds = {};
    } else if (!draft.activeExId && workout?.exercises?.length) {
      const firstPending = workout.exercises.find((e) => (draft.sets[e.id] || []).some((s) => !s.done));
      draft.activeExId = firstPending?.id || workout.exercises[0].id;
    }
    saveState();
    syncExerciseAccordionInPlace(workout, draft, {
      targetExId: draft.activeExId,
      scrollToTarget: state.trainFocusMode && Boolean(draft.activeExId)
    });
  } else if (action === 'test-chime') {
    unlockAudio();
    playTimerDoneFeedback({ forceChime: true, volume: 1.0 });
    showToast('Playing test chime');
  } else if (action === 'set-alert-mode-pref') {
    unlockAudio();
    state.restAlertMode = target.dataset.mode;
    saveState();
    if (isChimeEnabled()) {
      playTimerDoneFeedback({ forceChime: true, volume: 0.75, skipVibe: true });
    }
    openWorkoutSettingsModal();
    renderMain();
  } else if (action === 'toggle-wake-lock') {
    state.keepAwake = !state.keepAwake;
    saveState();
    if (!document.getElementById('modal-backdrop').classList.contains('hidden')) {
      openWorkoutSettingsModal();
    }
    renderMain();
  } else if (action === 'focus-exercise') {
    const workout = getWorkouts()[state.activeWorkoutId];
    const draft = ensureWorkoutDraft(state.activeWorkoutId);
    const exId = target.dataset.ex;
    if (!draft.collapsedExIds) draft.collapsedExIds = {};
    let scrollToTarget = false;
    let targetExId = exId;
    if (!state.trainFocusMode) {
      const isCurrentlyCollapsed = Boolean(draft.collapsedExIds[exId]);
      if (isCurrentlyCollapsed) {
        delete draft.collapsedExIds[exId];
        draft.activeExId = exId;
        scrollToTarget = true;
      } else {
        draft.collapsedExIds[exId] = true;
        if (draft.activeExId === exId) draft.activeExId = null;
        scrollToTarget = false;
      }
    } else if (draft.activeExId === exId) {
      draft.activeExId = null;
      targetExId = null;
      scrollToTarget = false;
    } else {
      draft.activeExId = exId;
      scrollToTarget = true;
    }
    saveState();
    syncExerciseAccordionInPlace(workout, draft, { targetExId, scrollToTarget });
  } else if (action === 'toggle-ramp-inline') {
    const draft = ensureWorkoutDraft(state.activeWorkoutId);
    const exId = target.dataset.ex;
    draft.rampOpen[exId] = !draft.rampOpen[exId];
    saveState();
    renderMainWithTransition();
  } else if (action === 'toggle-ramp-set') {
    const draft = ensureWorkoutDraft(state.activeWorkoutId);
    const key = target.dataset.key;
    draft.rampDone[key] = !draft.rampDone[key];
    saveState();
    renderMain();
  } else if (action === 'toggle-auto-timer') {
    state.autoStartRestTimer = !state.autoStartRestTimer;
    saveState();
    if (!document.getElementById('modal-backdrop').classList.contains('hidden')) {
      openWorkoutSettingsModal();
    }
    renderMain();
  } else if (action === 'start-session') {
    unlockAudio();
    const draft = ensureWorkoutDraft(state.activeWorkoutId);
    draft.startedAt = Date.now();
    const switchedDay = ensureTodayLiftingDay();
    saveState();
    if (switchedDay) showToast('Clock started · Today switched to Lifting Day');
    renderMain();
  } else if (action === 'open-rest-presets') {
    openRestPresetsModal(target.dataset.label || (timer.active ? timer.label : ''));
  } else if (action === 'pick-rest-preset') {
    unlockAudio();
    const sec = Number(target.dataset.sec) || 90;
    const label = target.dataset.label || 'Manual Rest';
    closeModal();
    startRestTimer(sec, label);
  } else if (action === 'open-exercise-note') {
    openExerciseNoteModal(target.dataset.ex, target.dataset.name || 'Exercise');
  } else if (action === 'save-exercise-note') {
    const exId = target.dataset.ex;
    const val = String(document.getElementById('exercise-note-input')?.value || '').trim();
    if (!state.exerciseNotes) state.exerciseNotes = {};
    if (val) state.exerciseNotes[exId] = val;
    else delete state.exerciseNotes[exId];
    saveState();
    closeModal();
    showToast(val ? 'Saved setup note' : 'Cleared setup note');
    renderMain();
  } else if (action === 'clear-exercise-note') {
    const exId = target.dataset.ex;
    if (state.exerciseNotes) delete state.exerciseNotes[exId];
    saveState();
    closeModal();
    showToast('Cleared setup note');
    renderMain();
  } else if (action === 'open-exercise-history') {
    openExerciseHistoryModal(target.dataset.ex, target.dataset.name || 'Exercise', target.dataset.default || target.dataset.name || 'Exercise');
  } else if (action === 'toggle-why-inline') {
    const exId = target.dataset.ex;
    openWhyByEx[exId] = !openWhyByEx[exId];
    renderMain();
  } else if (action === 'select-chart-point') {
    selectedChartIdx = Number(target.dataset.idx);
    renderMain();
  } else if (action === 'reset-session') {
    const workoutId = state.activeWorkoutId;
    const prevDraft = state.draftWorkouts[workoutId] ? structuredClone(state.draftWorkouts[workoutId]) : null;
    delete state.draftWorkouts[workoutId];
    saveState();
    if (prevDraft) {
      showToast(`Cleared ${getWorkouts()[workoutId].shortName} draft`, () => {
        state.draftWorkouts[workoutId] = prevDraft;
        saveState();
        renderMain();
      });
    }
    renderMain();
  } else if (action === 'toggle-prehab') {
    unlockAudio();
    const draft = ensureWorkoutDraft(state.activeWorkoutId);
    if (!draft.startedAt) draft.startedAt = Date.now();
    const wasCollapsed = Boolean((draft.prehabDone.ext && draft.prehabDone.pullapart) || draft.prehabSkipped);
    const k = target.dataset.key;
    draft.prehabDone[k] = !draft.prehabDone[k];
    if (draft.prehabDone[k]) draft.prehabSkipped = false;
    justCheckedTarget = draft.prehabDone[k] ? `prehab:${k}` : null;
    const isCollapsed = Boolean((draft.prehabDone.ext && draft.prehabDone.pullapart) || draft.prehabSkipped);
    saveState();
    if (wasCollapsed !== isCollapsed) renderMainWithTransition();
    else renderMain();
  } else if (action === 'toggle-skip-prehab') {
    const draft = ensureWorkoutDraft(state.activeWorkoutId);
    draft.prehabSkipped = !draft.prehabSkipped;
    saveState();
    renderMainWithTransition();
  } else if (action === 'toggle-cond-swap') {
    const draft = ensureWorkoutDraft(state.activeWorkoutId);
    draft.conditioningSwapped = !draft.conditioningSwapped;
    saveState();
    renderMain();
  } else if (action === 'toggle-cond-done') {
    const draft = ensureWorkoutDraft(state.activeWorkoutId);
    draft.conditioningDone = !draft.conditioningDone;
    justCheckedTarget = draft.conditioningDone ? 'cond' : null;
    saveState();
    renderMain();
  } else if (action === 'open-swap') {
    openSwapModal(state.activeWorkoutId, target.dataset.ex);
  } else if (action === 'pick-swap') {
    const exId = target.dataset.ex;
    const swapName = target.dataset.swap;
    const workout = getWorkouts()[state.activeWorkoutId];
    const ex = workout.exercises.find((e) => e.id === exId);
    state.swapsBySlot[exId] = swapName;
    if (ex) {
      const draft = ensureWorkoutDraft(state.activeWorkoutId);
      const { phase, bonusWk10Sets } = getEffectivePhase();
      const hasLogged = (draft.sets[exId] || []).some((s) => s.done);
      if (!hasLogged) {
        draft.sets[exId] = buildDefaultSetsForExercise(ex, swapName, workout, phase, bonusWk10Sets);
        draft.activeSetIdxByEx[exId] = 0;
      }
    }
    saveState();
    closeModal();
    renderMain();
  } else if (action === 'add-custom-swap') {
    const exId = target.dataset.ex;
    const input = document.getElementById('custom-swap-input');
    const customName = String(input?.value || '').trim();
    if (!customName) {
      showToast('Enter an exercise name first.');
      return;
    }
    const workout = getWorkouts()[state.activeWorkoutId];
    const ex = workout.exercises.find((e) => e.id === exId);
    state.swapsBySlot[exId] = customName;
    if (ex) {
      const draft = ensureWorkoutDraft(state.activeWorkoutId);
      const { phase, bonusWk10Sets } = getEffectivePhase();
      const hasLogged = (draft.sets[exId] || []).some((s) => s.done);
      if (!hasLogged) {
        draft.sets[exId] = buildDefaultSetsForExercise(ex, customName, workout, phase, bonusWk10Sets);
        draft.activeSetIdxByEx[exId] = 0;
      }
    }
    saveState();
    closeModal();
    showToast(`Swapped to ${customName}`);
    renderMain();
  } else if (action === 'open-plan-editor') {
    openPlanEditorModal(target.dataset.workout || state.activeWorkoutId);
  } else if (action === 'editor-move-ex') {
    if (!planEditorDraft) return;
    const idx = Number(target.dataset.idx);
    const dir = Number(target.dataset.dir);
    const nextIdx = idx + dir;
    if (nextIdx < 0 || nextIdx >= planEditorDraft.exercises.length) return;
    const [item] = planEditorDraft.exercises.splice(idx, 1);
    planEditorDraft.exercises.splice(nextIdx, 0, item);
    document.getElementById('modal-body').innerHTML = renderPlanEditorModalBody();
  } else if (action === 'editor-remove-ex') {
    if (!planEditorDraft || planEditorDraft.exercises.length <= 1) return;
    const idx = Number(target.dataset.idx);
    planEditorDraft.exercises.splice(idx, 1);
    document.getElementById('modal-body').innerHTML = renderPlanEditorModalBody();
  } else if (action === 'editor-add-ex') {
    if (!planEditorDraft) return;
    planEditorDraft.exercises.push({
      id: `custom_${Date.now().toString(36)}`,
      name: 'New Exercise',
      sets: 3,
      repMin: 10,
      repMax: 12,
      restSec: 60,
      restLabel: '60s',
      isCompound: false,
      isBarbell: false,
      big3Key: null,
      rampUp: false,
      leftFirst: false,
      superset: null,
      phase2Cue: null,
      bonusWk10Set: false,
      defaultWeight: 0,
      note: '',
      swaps: ['New Exercise']
    });
    document.getElementById('modal-body').innerHTML = renderPlanEditorModalBody();
  } else if (action === 'editor-toggle-left') {
    if (!planEditorDraft) return;
    const idx = Number(target.dataset.idx);
    if (planEditorDraft.exercises[idx]) {
      planEditorDraft.exercises[idx].leftFirst = !planEditorDraft.exercises[idx].leftFirst;
      document.getElementById('modal-body').innerHTML = renderPlanEditorModalBody();
    }
  } else if (action === 'editor-save-plan') {
    if (!planEditorDraft) return;
    const nextWorkouts = getWorkouts();
    const wId = planEditorDraft.workoutId;
    nextWorkouts[wId].exercises = planEditorDraft.exercises.map((ex) => {
      const restSec = Math.max(15, Number(ex.restSec) || 60);
      const restLabel = restSec >= 120 && restSec % 60 === 0 ? `${restSec / 60} min` : `${restSec}s`;
      const cleanName = String(ex.name || '').trim() || 'Exercise';
      const origEx = getWorkouts()[wId]?.exercises?.find((e) => e.id === ex.id);
      const isBarbell = origEx && origEx.name === cleanName
        ? Boolean(ex.isBarbell)
        : /barbell/i.test(cleanName);
      const swaps = Array.isArray(ex.swaps) ? [...ex.swaps] : [];
      if (!swaps.includes(cleanName)) swaps.unshift(cleanName);
      return {
        ...ex,
        name: cleanName,
        isBarbell,
        sets: Math.max(1, Number(ex.sets) || 3),
        repMin: Math.max(1, Number(ex.repMin) || 8),
        repMax: Math.max(Math.max(1, Number(ex.repMin) || 8), Number(ex.repMax) || 12),
        restSec,
        restLabel,
        swaps
      };
    });
    const note = planEditorDraft.note || `Edited ${nextWorkouts[wId].shortName}`;
    const snap = saveNewPlanVersion(nextWorkouts, note);
    const existingDraft = state.draftWorkouts[wId];
    const hasLoggedSets = existingDraft && Object.values(existingDraft.sets || {}).some((arr) => arr.some((s) => s.done));
    if (!hasLoggedSets) delete state.draftWorkouts[wId];
    planEditorDraft = null;
    saveState();
    closeModal();
    showToast(`Saved Plan ${snap.versionId} (${nextWorkouts[wId].shortName})`);
    renderMain();
  } else if (action === 'export-plan-version') {
    const v = (state.planVersions || []).find((x) => x.versionId === target.dataset.version);
    if (!v) return;
    downloadJsonFile(`recomp-plan-${v.versionId}-${v.effectiveDate}.json`, v);
    showToast(`Exported ${v.versionId} JSON`);
  } else if (action === 'restore-plan-version') {
    const v = (state.planVersions || []).find((x) => x.versionId === target.dataset.version);
    if (!v) return;
    const snap = saveNewPlanVersion(v.workouts, `Restored from ${v.versionId} (${v.effectiveDate})`);
    state.draftWorkouts = {};
    saveState();
    showToast(`Restored ${v.versionId} as ${snap.versionId}`);
    renderMain();
  } else if (action === 'export-all-plan-versions') {
    const payload = buildPlanVersionsExport({
      planVersions: state.planVersions || [],
      activeVersionId: state.activePlanVersionId || 'v1',
      activeWorkouts: getWorkouts(),
      profile: PLAN_CONFIG.profile,
      strengthTargets: PLAN_CONFIG.strengthTargets
    });
    downloadJsonFile(`recomp-plan-versions-${localTodayIso()}.json`, payload);
    showToast(`Exported ${payload.planVersions.length} plan version(s)`);
  } else if (action === 'select-set') {
    const draft = ensureWorkoutDraft(state.activeWorkoutId);
    draft.activeExId = target.dataset.ex;
    draft.activeSetIdxByEx[target.dataset.ex] = Number(target.dataset.idx);
    saveState();
    renderMain();
  } else if (action === 'add-extra-set') {
    const draft = ensureWorkoutDraft(state.activeWorkoutId);
    const exId = target.dataset.ex;
    draft.extraSetsByEx[exId] = (draft.extraSetsByEx[exId] || 0) + 1;
    const sets = draft.sets[exId] || [];
    const last = sets[sets.length - 1] || { weight: '', reps: '10', rir: '1.5' };
    sets.push({ weight: last.weight, reps: last.reps, rir: last.rir, done: false, weightEdited: false });
    draft.sets[exId] = sets;
    draft.activeSetIdxByEx[exId] = sets.length - 1;
    saveState();
    renderMain();
  } else if (action === 'remove-extra-set') {
    const draft = ensureWorkoutDraft(state.activeWorkoutId);
    const exId = target.dataset.ex;
    if ((draft.extraSetsByEx[exId] || 0) > 0) {
      const sets = draft.sets[exId] || [];
      const removed = sets.pop();
      draft.extraSetsByEx[exId] -= 1;
      draft.sets[exId] = sets;
      draft.activeSetIdxByEx[exId] = Math.max(0, Math.min(draft.activeSetIdxByEx[exId] || 0, sets.length - 1));
      saveState();
      showToast('Removed extra set', () => {
        const d = ensureWorkoutDraft(state.activeWorkoutId);
        d.extraSetsByEx[exId] = (d.extraSetsByEx[exId] || 0) + 1;
        if (removed) d.sets[exId].push(removed);
        saveState();
        renderMain();
      });
      renderMain();
    }
  } else if (action === 'nudge-weight') {
    const draft = ensureWorkoutDraft(state.activeWorkoutId);
    const row = draft.sets[target.dataset.ex]?.[Number(target.dataset.idx)];
    if (!row) return;
    const nextW = Math.max(0, (Number(row.weight) || 0) + Number(target.dataset.delta));
    row.weight = nextW === 0 ? '' : String(nextW);
    row.weightEdited = true;
    saveState();
    renderMain();
  } else if (action === 'copy-weight-rest') {
    const draft = ensureWorkoutDraft(state.activeWorkoutId);
    const exId = target.dataset.ex;
    const idx = Number(target.dataset.idx);
    const sets = draft.sets[exId] || [];
    const srcWeight = sets[idx]?.weight ?? '';
    for (let i = idx + 1; i < sets.length; i++) {
      sets[i].weight = srcWeight;
      sets[i].weightEdited = true;
    }
    saveState();
    showToast(`Applied ${srcWeight || 'BW'} lbs to remaining sets`);
    renderMain();
  } else if (action === 'pick-reps') {
    const draft = ensureWorkoutDraft(state.activeWorkoutId);
    const row = draft.sets[target.dataset.ex]?.[Number(target.dataset.idx)];
    if (!row) return;
    row.reps = target.dataset.val;
    saveState();
    renderMain();
  } else if (action === 'nudge-reps') {
    const draft = ensureWorkoutDraft(state.activeWorkoutId);
    const row = draft.sets[target.dataset.ex]?.[Number(target.dataset.idx)];
    if (!row) return;
    row.reps = String(Math.max(1, (Number(row.reps) || 1) + Number(target.dataset.delta)));
    saveState();
    renderMain();
  } else if (action === 'pick-rir') {
    const draft = ensureWorkoutDraft(state.activeWorkoutId);
    const row = draft.sets[target.dataset.ex]?.[Number(target.dataset.idx)];
    if (!row) return;
    row.rir = target.dataset.val;
    row.rirEdited = true;
    saveState();
    renderMain();
  } else if (action === 'log-active-set') {
    unlockAudio();
    const workoutId = state.activeWorkoutId;
    const workoutsMap = getWorkouts();
    const workout = workoutsMap[workoutId];
    const draft = ensureWorkoutDraft(workoutId);
    let switchedDay = false;
    if (!draft.startedAt) {
      draft.startedAt = Date.now();
      switchedDay = ensureTodayLiftingDay();
    }
    const exId = target.dataset.ex;
    const ex = workout.exercises.find((x) => x.id === exId);
    const activeName = state.swapsBySlot[exId] || ex?.name;
    const idx = Number(target.dataset.idx);
    const setsArr = draft.sets[exId] || [];
    const row = setsArr[idx];
    if (!row) return;
    const wasDone = row.done;
    row.done = true;
    const exDefForRamp = workout.exercises.find((x) => x.id === exId);
    if (exDefForRamp?.rampUp) draft.rampOpen[exId] = false;

    // Auto-carry working weight & RIR forward to unedited upcoming sets of this exercise
    for (let j = idx + 1; j < setsArr.length; j++) {
      if (!setsArr[j].done) {
        if (row.weight !== '' && !setsArr[j].weightEdited) {
          setsArr[j].weight = row.weight;
        }
        if (row.rir !== '' && !setsArr[j].rirEdited) {
          setsArr[j].rir = row.rir;
        }
      }
    }

    const { phase, bonusWk10Sets } = getEffectivePhase();
    const prog = ex && phase !== 'deload' ? evaluateDoubleProgression(setsArr, ex, activeName) : null;

    const prevActiveExId = draft.activeExId;
    const prevExpandedIds = getExpandedExerciseIds(workout, draft);
    const prevScrollY = window.scrollY;
    const { supersetMovedToPartner, partnerDisplayName } = advanceFocusAfterSetLogged(workoutId, exId, idx);
    const switchedExercise = draft.activeExId !== prevActiveExId;
    saveState();

    const anyPendingSetsLeft = workout.exercises.some((e) => (draft.sets[e.id] || []).some((s) => !s.done));

    const msgs = [];
    if (!anyPendingSetsLeft) {
      stopRestTimer();
      msgs.push(workout.conditioning && !draft.conditioningDone
        ? 'All lifting sets done. Finish conditioning!'
        : 'All working sets complete! Tap Finish & Save.');
    } else if (supersetMovedToPartner) {
      msgs.push(`Superset → Now: ${partnerDisplayName}`);
    } else if (!wasDone && state.autoStartRestTimer) {
      startRestTimer(Number(target.dataset.rest), target.dataset.label);
    }

    if (prog) {
      msgs.push(prog.message);
    } else if (wasDone && anyPendingSetsLeft && !supersetMovedToPartner) {
      msgs.push(`Updated Set ${idx + 1}`);
    }
    if (switchedDay) {
      msgs.push('Today → Lifting Day');
    }
    if (msgs.length > 0) showToast(msgs.join(' · '));
    if (switchedExercise) {
      renderMain({ overrideExpandedIds: prevExpandedIds });
      window.scrollTo(0, prevScrollY);
      syncExerciseAccordionInPlace(workout, draft, {
        targetExId: draft.activeExId,
        scrollToTarget: Boolean(draft.activeExId)
      });
    } else {
      renderMain();
    }
  } else if (action === 'undo-set') {
    const workoutId = state.activeWorkoutId;
    const exId = target.dataset.ex;
    const idx = Number(target.dataset.idx);
    const draft = ensureWorkoutDraft(workoutId);
    const row = draft.sets[exId]?.[idx];
    if (!row) return;
    row.done = false;
    saveState();
    showToast(`Unchecked Set ${idx + 1}`, () => {
      const d = ensureWorkoutDraft(workoutId);
      if (d.sets[exId]?.[idx]) d.sets[exId][idx].done = true;
      saveState();
      renderMain();
    });
    renderMain();
  } else if (action === 'start-rest') {
    startRestTimer(Number(target.dataset.sec), target.dataset.label);
  } else if (action === 'finish-workout') {
    const workoutId = state.activeWorkoutId;
    const workoutsMap = getWorkouts();
    const workout = workoutsMap[workoutId];
    const draft = ensureWorkoutDraft(workoutId);
    const { phase, bonusWk10Sets } = getEffectivePhase();
    const today = localTodayIso();

    const prevDraft = structuredClone(draft);
    const prevPerf = structuredClone(state.lastPerformance);
    const prevSwaps = structuredClone(state.swapsBySlot);
    const daily = ensureDailyLog(today);
    const prevDayType = daily.dayType;

    const exercises = [];

    for (const ex of workout.exercises) {
      const rows = (draft.sets[ex.id] || []).filter((r) => r.done);
      if (rows.length > 0) {
        const activeName = state.swapsBySlot[ex.id] || ex.name;
        const perfKey = getPerfKey(ex.id, activeName, ex.name);
        const prevForAdherence = prevPerf[perfKey] || null;
        const spec = getEffectiveExerciseSpec(ex, {
          phase,
          bonusWk10Sets,
          isOptionalPumpDay: Boolean(workout.isOptionalPumpDay)
        });
        const adherence = evaluatePlanAdherence({
          exercise: ex,
          setsLog: draft.sets[ex.id] || [],
          activeName,
          defaultName: ex.name,
          phase,
          isOptionalPumpDay: Boolean(workout.isOptionalPumpDay),
          expectedSets: spec.sets,
          prevEntry: prevForAdherence
        });
        const mappedSets = rows.map((r) => ({ weight: Number(r.weight) || 0, reps: Number(r.reps) || 0, rir: Number(r.rir) || 0 }));
        state.lastPerformance[perfKey] = {
          date: today,
          sets: mappedSets
        };
        exercises.push({
          exId: ex.id,
          perfKey,
          name: activeName,
          big3Key: ex.big3Key || null,
          isRepMaxGoal: Boolean(ex.isRepMaxGoal),
          isDefaultSlot: activeName === ex.name,
          isCompound: ex.isCompound,
          isBarbell: ex.isBarbell,
          repMax: ex.repMax,
          deviations: adherence.reasons,
          sets: mappedSets
        });
      }
    }

    if (exercises.length === 0) {
      showToast('Log at least 1 set before saving.');
      return;
    }

    const durationMin = draft.startedAt ? Math.max(1, Math.round((Date.now() - draft.startedAt) / 60000)) : null;
    const conditioningNote = workout.conditioning && draft.conditioningDone
      ? (draft.conditioningSwapped ? '2×8-10 Split Squats' : '15m Incline Walk')
      : null;
    const summary = recomputeSessionSummary({
      id: `${Date.now()}_${workoutId}`,
      date: today,
      workoutId,
      workoutName: workout.dayLabel,
      phase,
      durationMin,
      conditioningNote,
      exercises
    }, workoutsMap);
    state.workoutHistory.push(summary);
    lastSavedBanner = summary;

    daily.dayType = 'lifting';
    for (const ex of workout.exercises) {
      delete state.swapsBySlot[ex.id];
    }
    delete state.draftWorkouts[workoutId];
    stopRestTimer();
    saveState();
    state.activeTab = 'progress';
    showToast(`Saved ${workout.shortName} (${summary.totalSetsDone} sets)!`, () => {
      state.workoutHistory = state.workoutHistory.filter((h) => h.id !== summary.id);
      lastSavedBanner = null;
      state.lastPerformance = prevPerf;
      state.swapsBySlot = prevSwaps;
      state.draftWorkouts[workoutId] = prevDraft;
      ensureDailyLog(today).dayType = prevDayType;
      state.activeWorkoutId = workoutId;
      state.activeTab = 'train';
      saveState();
      renderMain();
    });
    renderMainWithTransition({ focusMain: true });
  } else if (action === 'dismiss-saved-banner') {
    lastSavedBanner = null;
    renderMainWithTransition();
  } else if (action === 'nudge-quick-metric') {
    const metric = target.dataset.metric;
    const delta = Number(target.dataset.delta);
    if (metric === 'weight' || metric === 'quick-weight') {
      const input = document.getElementById(metric === 'quick-weight' ? 'quick-weight-val' : 'weight-val-input');
      const curr = Number(input?.value ?? pendingWeightInput ?? 185);
      pendingWeightInput = Number(Math.max(70, Math.min(450, curr + delta)).toFixed(1));
      if (input) input.value = pendingWeightInput.toFixed(1);
    } else if (metric === 'waist') {
      const input = document.getElementById('waist-val-input');
      const curr = Number(input?.value ?? pendingWaistInput ?? 34);
      pendingWaistInput = Number(Math.max(20, Math.min(70, curr + delta)).toFixed(2));
      if (input) input.value = String(pendingWaistInput);
    }
  } else if (action === 'add-weight') {
    const dateVal = document.getElementById('weight-date-input').value || localTodayIso();
    const weightVal = Number(document.getElementById('weight-val-input').value);
    if (!Number.isFinite(weightVal) || weightVal < 70 || weightVal > 450) {
      showToast('Enter a valid scale weight in lbs.');
      return;
    }
    const existingIdx = state.weightLogs.findIndex((w) => w.date === dateVal);
    if (existingIdx >= 0) state.weightLogs[existingIdx].weight = weightVal;
    else state.weightLogs.push({ date: dateVal, weight: weightVal });
    ensureDailyLog(dateVal).weighInSkipped = false;
    pendingWeightInput = weightVal;
    selectedChartIdx = null;
    saveState();
    showToast(`Logged ${weightVal} lbs for ${formatHumanDate(dateVal)}`);
    renderMain();
  } else if (action === 'add-waist') {
    const dateVal = document.getElementById('waist-date-input').value || localTodayIso();
    const waistVal = Number(document.getElementById('waist-val-input').value);
    if (!Number.isFinite(waistVal) || waistVal < 20 || waistVal > 70) {
      showToast('Enter a valid waist measurement (in).');
      return;
    }
    const existingIdx = state.waistLogs.findIndex((w) => w.date === dateVal);
    if (existingIdx >= 0) state.waistLogs[existingIdx].waist = waistVal;
    else state.waistLogs.push({ date: dateVal, waist: waistVal });
    pendingWaistInput = waistVal;
    saveState();
    showToast(`Logged ${waistVal}" waist`);
    renderMain();
  } else if (action === 'delete-weight') {
    if (state.weightLogs.length <= 1) return;
    const dateVal = target.dataset.date;
    const prevLogs = structuredClone(state.weightLogs);
    state.weightLogs = state.weightLogs.filter((w) => w.date !== dateVal);
    pendingWeightInput = null;
    selectedChartIdx = null;
    saveState();
    showToast(`Removed weigh-in (${dateVal})`, () => {
      state.weightLogs = prevLogs;
      pendingWeightInput = null;
      selectedChartIdx = null;
      saveState();
      renderMain();
    });
    renderMain();
  } else if (action === 'delete-waist') {
    const dateVal = target.dataset.date;
    const prevLogs = structuredClone(state.waistLogs);
    state.waistLogs = state.waistLogs.filter((w) => w.date !== dateVal);
    pendingWaistInput = null;
    saveState();
    showToast(`Removed waist log (${dateVal})`, () => {
      state.waistLogs = prevLogs;
      pendingWaistInput = null;
      saveState();
      renderMain();
    });
    renderMain();
  } else if (action === 'delete-photo') {
    const dateVal = target.dataset.date;
    const prevLogs = [...state.photoLogs];
    state.photoLogs = state.photoLogs.filter((d) => d !== dateVal);
    saveState();
    showToast(`Removed photo log (${dateVal})`, () => {
      state.photoLogs = prevLogs;
      saveState();
      renderMain();
    });
    renderMain();
  } else if (action === 'log-photo') {
    const today = localTodayIso();
    if (!state.photoLogs.includes(today)) {
      state.photoLogs.push(today);
      saveState();
      showToast('Biweekly progress photos logged!');
      renderMain();
    }
  } else if (action === 'toggle-history-expand') {
    const id = target.dataset.id;
    expandedHistoryId = expandedHistoryId === id ? null : id;
    renderMainWithTransition();
  } else if (action === 'open-edit-history-set') {
    const id = target.dataset.id;
    const exIdx = Number(target.dataset.exidx);
    const setIdx = Number(target.dataset.setidx);
    const sess = state.workoutHistory.find((h) => h.id === id);
    const exEntry = sess?.exercises?.[exIdx];
    const s = exEntry?.sets?.[setIdx];
    if (!s) return;
    openModal(`Edit ${exEntry.name} · Set #${setIdx + 1}`, `
      <div class="control-group">
        <label class="num-label" for="hist-edit-weight">Weight (lbs)</label>
        <input id="hist-edit-weight" type="number" step="2.5" inputmode="decimal" class="num-input" value="${Number(s.weight) || 0}" />
      </div>
      <div class="grid-2" style="gap:12px;">
        <div class="control-group">
          <label class="num-label" for="hist-edit-reps">Reps</label>
          <input id="hist-edit-reps" type="number" min="1" inputmode="numeric" class="num-input" value="${Number(s.reps) || 1}" />
        </div>
        <div class="control-group">
          <label class="num-label" for="hist-edit-rir">RIR</label>
          <input id="hist-edit-rir" type="number" step="0.5" min="0" max="5" inputmode="decimal" class="num-input" value="${Number(s.rir) ?? 1.5}" />
        </div>
      </div>
      <div class="row-wrap" style="margin-top:8px;">
        <button type="button" class="btn btn-primary" style="flex:1;" data-action="save-history-set" data-id="${escapeHtml(id)}" data-exidx="${exIdx}" data-setidx="${setIdx}">Save Changes</button>
        <button type="button" class="btn" data-action="delete-history-set" data-id="${escapeHtml(id)}" data-exidx="${exIdx}" data-setidx="${setIdx}">Delete Set</button>
      </div>
    `);
  } else if (action === 'save-history-set') {
    const id = target.dataset.id;
    const exIdx = Number(target.dataset.exidx);
    const setIdx = Number(target.dataset.setidx);
    const sessIdx = state.workoutHistory.findIndex((h) => h.id === id);
    const sess = state.workoutHistory[sessIdx];
    const exEntry = sess?.exercises?.[exIdx];
    if (!exEntry?.sets?.[setIdx]) return;

    const wVal = Math.max(0, Number(document.getElementById('hist-edit-weight')?.value) || 0);
    const rVal = Math.max(1, Number(document.getElementById('hist-edit-reps')?.value) || 1);
    const rirVal = Math.max(0, Math.min(5, Number(document.getElementById('hist-edit-rir')?.value) || 0));

    const prevHistory = structuredClone(state.workoutHistory);
    const prevPerf = structuredClone(state.lastPerformance);

    exEntry.sets[setIdx] = { weight: wVal, reps: rVal, rir: rirVal };
    state.workoutHistory[sessIdx] = recomputeSessionSummary(sess, getWorkouts());
    const touchedKeys = exEntry.perfKey ? [exEntry.perfKey] : [];
    state.lastPerformance = rebuildLastPerformance(state.workoutHistory, state.lastPerformance, touchedKeys);
    saveState();
    closeModal();
    showToast(`Updated ${exEntry.name} Set #${setIdx + 1}`, () => {
      state.workoutHistory = prevHistory;
      state.lastPerformance = prevPerf;
      expandedHistoryId = id;
      saveState();
      renderMain();
    });
    renderMain();
  } else if (action === 'reopen-history-session') {
    const id = target.dataset.id;
    const sess = state.workoutHistory.find((h) => h.id === id);
    const workoutsMap = getWorkouts();
    const workout = sess ? workoutsMap[sess.workoutId] : null;
    if (!sess || !workout) return;

    const prevHistory = structuredClone(state.workoutHistory);
    const prevPerf = structuredClone(state.lastPerformance);
    const prevSwaps = structuredClone(state.swapsBySlot);
    const prevDraft = state.draftWorkouts[sess.workoutId] ? structuredClone(state.draftWorkouts[sess.workoutId]) : null;
    const removedKeys = (sess.exercises || []).map((e) => e.perfKey).filter(Boolean);

    state.workoutHistory = state.workoutHistory.filter((h) => h.id !== id);
    state.lastPerformance = rebuildLastPerformance(state.workoutHistory, state.lastPerformance, removedKeys);
    expandedHistoryId = null;

    for (const exEntry of sess.exercises || []) {
      const defEx = workout.exercises.find((e) => e.id === exEntry.exId);
      if (defEx && exEntry.name && exEntry.name !== defEx.name) {
        state.swapsBySlot[exEntry.exId] = exEntry.name;
      }
    }

    delete state.draftWorkouts[sess.workoutId];
    const restoredDraft = ensureWorkoutDraft(sess.workoutId);
    restoredDraft.startedAt = sess.durationMin ? Date.now() - sess.durationMin * 60000 : Date.now();
    restoredDraft.conditioningDone = Boolean(sess.conditioningNote);
    for (const exEntry of sess.exercises || []) {
      const targetRows = restoredDraft.sets[exEntry.exId] || [];
      if (exEntry.sets.length > targetRows.length) {
        restoredDraft.extraSetsByEx[exEntry.exId] = (restoredDraft.extraSetsByEx[exEntry.exId] || 0) + (exEntry.sets.length - targetRows.length);
      }
      exEntry.sets.forEach((s, idx) => {
        const rowObj = {
          weight: s.weight === 0 ? '' : String(s.weight),
          reps: String(s.reps),
          rir: String(s.rir),
          done: true,
          weightEdited: true
        };
        if (idx < targetRows.length) targetRows[idx] = rowObj;
        else targetRows.push(rowObj);
      });
      restoredDraft.sets[exEntry.exId] = targetRows;
    }
    const nextPending = workout.exercises.find((e) => (restoredDraft.sets[e.id] || []).some((s) => !s.done));
    if (nextPending) restoredDraft.activeExId = nextPending.id;

    state.activeWorkoutId = sess.workoutId;
    state.activeTab = 'train';
    saveState();
    showToast(`Reopened ${workout.shortName} in Train`, () => {
      state.workoutHistory = prevHistory;
      state.lastPerformance = prevPerf;
      state.swapsBySlot = prevSwaps;
      if (prevDraft) state.draftWorkouts[sess.workoutId] = prevDraft;
      else delete state.draftWorkouts[sess.workoutId];
      state.activeTab = 'progress';
      saveState();
      renderMain();
    });
    renderMainWithTransition({ focusMain: true });
  } else if (action === 'delete-history-set') {
    const id = target.dataset.id;
    const exIdx = Number(target.dataset.exidx);
    const setIdx = Number(target.dataset.setidx);
    const prevHistory = structuredClone(state.workoutHistory);
    const prevPerf = structuredClone(state.lastPerformance);

    const sessIdx = state.workoutHistory.findIndex((h) => h.id === id);
    if (sessIdx < 0) return;
    const sess = state.workoutHistory[sessIdx];
    const exEntry = sess.exercises?.[exIdx];
    if (!exEntry || !exEntry.sets?.[setIdx]) return;

    const removedKey = exEntry.perfKey ? [exEntry.perfKey] : [];
    exEntry.sets.splice(setIdx, 1);
    if (exEntry.sets.length === 0) {
      sess.exercises.splice(exIdx, 1);
    }
    if (sess.exercises.length === 0) {
      state.workoutHistory.splice(sessIdx, 1);
      if (expandedHistoryId === id) expandedHistoryId = null;
    } else {
      state.workoutHistory[sessIdx] = recomputeSessionSummary(sess, getWorkouts());
    }
    state.lastPerformance = rebuildLastPerformance(state.workoutHistory, state.lastPerformance, removedKey);
    closeModal();
    saveState();
    showToast('Removed set from logbook', () => {
      state.workoutHistory = prevHistory;
      state.lastPerformance = prevPerf;
      expandedHistoryId = id;
      saveState();
      renderMain();
    });
    renderMain();
  } else if (action === 'delete-history') {
    const id = target.dataset.id;
    const removed = state.workoutHistory.find((h) => h.id === id);
    if (!removed) return;
    const prevHistory = structuredClone(state.workoutHistory);
    const prevPerf = structuredClone(state.lastPerformance);
    const removedKeys = (removed.exercises || []).map((e) => e.perfKey).filter(Boolean);
    state.workoutHistory = state.workoutHistory.filter((h) => h.id !== id);
    if (expandedHistoryId === id) expandedHistoryId = null;
    state.lastPerformance = rebuildLastPerformance(state.workoutHistory, state.lastPerformance, removedKeys);
    saveState();
    showToast(`Deleted ${removed.workoutName}`, () => {
      state.workoutHistory = prevHistory;
      state.lastPerformance = prevPerf;
      saveState();
      renderMain();
    });
    renderMain();
  } else if (action === 'set-split-mode') {
    state.weeklySplitMode = Number(target.dataset.mode);
    saveState();
    renderMain();
  } else if (action === 'toggle-full-plan') {
    showFullPlanDoc = !showFullPlanDoc;
    renderMainWithTransition();
  } else if (action === 'copy-plan-md') {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(FULL_PLAN_MARKDOWN)
        .then(() => showToast('Copied full 90-day plan markdown!'))
        .catch(() => showToast('Clipboard unavailable in this browser.'));
    } else {
      showToast('Clipboard unavailable in this browser.');
    }
  } else if (action === 'export-json') {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recomp-90d-backup-${localTodayIso()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup JSON downloaded.');
  } else if (action === 'reset-data') {
    if (confirm('Reset all logged workouts, weights, and daily check-ins? Export a JSON backup first if you want to keep them.')) {
      const prevState = structuredClone(state);
      stopRestTimer();
      state = createInitialState();
      timer = createDefaultRestTimerState();
      pendingWeightInput = null;
      pendingWaistInput = null;
      expandedHistoryId = null;
      selectedChartIdx = null;
      openWhyByEx = {};
      saveState();
      renderMain();
      showToast('Tracker reset to baseline', () => {
        state = prevState;
        timer = normalizeRestTimerState(state.activeRestTimer);
        ensureTimerInterval();
        saveState();
        renderMain();
      });
    }
  }
});

document.addEventListener('focusin', (e) => {
  if (e.target instanceof HTMLInputElement && e.target.type === 'number') {
    requestAnimationFrame(() => e.target.select());
  }
});

document.addEventListener('input', (e) => {
  const target = e.target;
  const action = target.dataset?.action;
  if (action === 'edit-set') {
    const draft = ensureWorkoutDraft(state.activeWorkoutId);
    const exId = target.dataset.ex;
    const idx = Number(target.dataset.idx);
    const field = target.dataset.field;
    if (draft.sets[exId]?.[idx]) {
      const row = draft.sets[exId][idx];
      row[field] = target.value;
      if (field === 'weight') row.weightEdited = true;
      saveState();
      const workout = getWorkouts()[state.activeWorkoutId];
      const ex = workout?.exercises?.find((e) => e.id === exId);
      if (ex) {
        const labelEl = document.querySelector(`[data-log-label-for="${exId}_${idx}"]`);
        if (labelEl) {
          const rNum = Number(row.reps) || ex.repMin;
          labelEl.textContent = row.done
            ? `Re-Log Set ${idx + 1} (${row.weight || 'BW'} × ${rNum})`
            : `Log Set ${idx + 1}${ex.leftFirst ? ' (L→R)' : ''} · ${row.weight || 'BW'} × ${rNum}`;
        }
        const plateEl = document.querySelector(`[data-plate-for="${exId}_${idx}"]`);
        if (plateEl) {
          const plates = computeBarbellPlatesPerSide(Number(row.weight) || 0);
          plateEl.innerHTML = renderBarbellPlateChips(plates);
        }
      }
    }
  } else if (action === 'update-daily-num') {
    const log = ensureDailyLog(state.selectedDate);
    log[target.dataset.field] = target.value;
    saveState();
  } else if (action === 'editor-note' && planEditorDraft) {
    planEditorDraft.note = target.value;
  } else if (action === 'editor-field' && planEditorDraft) {
    const idx = Number(target.dataset.idx);
    const field = target.dataset.field;
    if (planEditorDraft.exercises[idx]) {
      const isNum = field === 'sets' || field === 'repMin' || field === 'repMax' || field === 'restSec';
      planEditorDraft.exercises[idx][field] = isNum ? Number(target.value) : target.value;
    }
  } else if (target.id === 'weight-val-input' || target.id === 'quick-weight-val') {
    pendingWeightInput = target.value;
  } else if (target.id === 'waist-val-input') {
    pendingWaistInput = target.value;
  }
});

document.addEventListener('change', (e) => {
  const target = e.target;
  if (target.id === 'import-json-input' && target.files?.[0]) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const check = validateBackupState(parsed);
        if (!check.valid) {
          showToast(`Invalid backup: ${check.error}`);
          return;
        }
        state = normalizeRestoredState(parsed, createInitialState());
        timer = normalizeRestTimerState(state.activeRestTimer);
        ensureTimerInterval();
        pendingWeightInput = null;
        pendingWaistInput = null;
        expandedHistoryId = null;
        selectedChartIdx = null;
        openWhyByEx = {};
        lastSavedBanner = null;
        saveState();
        renderMain();
        showToast('Backup restored successfully!');
      } catch {
        showToast('Could not parse JSON backup.');
      } finally {
        target.value = '';
      }
    };
    reader.readAsText(target.files[0]);
    return;
  }

  const action = target.dataset?.action;
  if (action === 'editor-select' && planEditorDraft) {
    const idx = Number(target.dataset.idx);
    const field = target.dataset.field;
    if (planEditorDraft.exercises[idx]) {
      if (field === 'isCompound') {
        planEditorDraft.exercises[idx].isCompound = target.value === 'true';
      } else if (field === 'superset') {
        planEditorDraft.exercises[idx].superset = target.value || null;
      }
    }
  } else if (action === 'pick-date') {
    if (target.value) {
      state.selectedDate = target.value;
      saveState();
      renderMain();
    }
  } else if (action === 'set-start-date') {
    if (target.value) {
      state.startDate = target.value;
      saveState();
      renderMain();
      showToast(`Plan Day 1 updated to ${target.value}`);
    }
  }
});

document.getElementById('theme-btn').addEventListener('click', (e) => {
  e.stopPropagation();
  const menu = document.getElementById('theme-menu');
  const isClosed = menu.classList.contains('hidden') || menu.hasAttribute('data-closing');
  setThemeMenuOpen(isClosed);
});
document.getElementById('theme-menu').addEventListener('click', (e) => {
  const opt = e.target.closest('[data-theme-option]');
  if (!opt) return;
  state.theme = opt.dataset.themeOption;
  saveState();
  applyTheme();
  setThemeMenuOpen(false);
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('#theme-dropdown')) setThemeMenuOpen(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    setThemeMenuOpen(false);
    closeModal();
  }
});
document.getElementById('phase-pill-btn').addEventListener('click', openPhaseModal);
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-backdrop').addEventListener('click', (e) => {
  if (e.target.id === 'modal-backdrop') closeModal();
});
document.getElementById('rest-alert-mode').addEventListener('click', () => {
  unlockAudio();
  if (!supportsVibration()) {
    const nextOn = !isChimeEnabled();
    state.restAlertMode = nextOn ? 'chime' : 'mute';
    saveState();
    renderRestDock();
    if (nextOn) {
      playTimerDoneFeedback({ forceChime: true, volume: 0.75, skipVibe: true });
      showToast('Rest chime ON');
    } else {
      showToast('Rest chime muted');
    }
    return;
  }
  const modes = ['chime', 'chime_only', 'vibe', 'mute'];
  const idx = modes.indexOf(state.restAlertMode);
  state.restAlertMode = modes[(idx + 1) % modes.length];
  saveState();
  renderRestDock();
  const msgMap = {
    chime: 'Rest alert: Chime + Vibration',
    chime_only: 'Rest alert: Chime Only',
    vibe: 'Rest alert: Vibration Only',
    mute: 'Rest alert: Muted (visual only)'
  };
  if (isChimeEnabled()) {
    playTimerDoneFeedback({ forceChime: true, volume: 0.75, skipVibe: true });
  }
  showToast(msgMap[state.restAlertMode] || 'Rest alert updated');
});
document.getElementById('rest-minus').addEventListener('click', () => adjustRestTimer(-15));
document.getElementById('rest-plus').addEventListener('click', () => adjustRestTimer(15));
document.getElementById('rest-toggle').addEventListener('click', toggleRestTimerPause);
document.getElementById('rest-stop').addEventListener('click', stopRestTimer);

// Handle overnight date rollover, timer re-sync, and wake lock on foreground
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    const today = localTodayIso();
    if (state.lastOpenedDate !== today) {
      state.lastOpenedDate = today;
      state.selectedDate = today;
      saveState();
      renderMain();
    }
    syncTimerTick();
    syncWakeLock();
  }
});
window.addEventListener('focus', syncTimerTick);
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) {
    state = loadState();
    timer = normalizeRestTimerState(state.activeRestTimer);
    ensureTimerInterval();
    renderMain();
  }
});

setInterval(() => {
  if (state.activeTab !== 'train') return;
  const draft = state.draftWorkouts[state.activeWorkoutId];
  const clockEl = document.getElementById('session-clock');
  if (draft?.startedAt && clockEl) {
    const sec = Math.floor((Date.now() - draft.startedAt) / 1000);
    clockEl.textContent = `${formatMMSS(sec)} / 60:00`;
    clockEl.className = `tabular ${sec >= 3000 ? 'tag tag-warn' : ''}`;
  }
}, 1000);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  const btn = document.getElementById('install-btn');
  if (btn) btn.style.display = 'inline-flex';
});

document.getElementById('install-btn').addEventListener('click', async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  document.getElementById('install-btn').style.display = 'none';
});

const urlParams = new URLSearchParams(window.location.search);
const reqTab = urlParams.get('tab');
if (reqTab && ['today', 'train', 'progress', 'plan'].includes(reqTab)) {
  state.activeTab = reqTab;
}

renderMain();

if (timer.active && !timer.paused) {
  syncTimerTick();
  ensureTimerInterval();
}

const reqModal = urlParams.get('modal');
if (reqModal === 'phase') {
  openPhaseModal();
} else if (reqModal === 'swap') {
  const wId = state.activeWorkoutId || 'upperA';
  const ex = getWorkouts()[wId]?.exercises[0];
  if (ex) openSwapModal(wId, ex.id);
} else if (reqModal === 'plan-editor') {
  openPlanEditorModal(state.activeWorkoutId || 'upperA');
} else if (reqModal === 'settings') {
  openWorkoutSettingsModal();
} else if (reqModal === 'holiday') {
  openHolidayModal();
}
