import assert from 'node:assert/strict';
import test from 'node:test';
import { WORKOUTS, PLAN_CONFIG } from '../data.js';
import {
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
} from '../engine.js';

test('workout structure covers all 5 days without skullcrushers', () => {
  assert.deepEqual(Object.keys(WORKOUTS), ['upperA', 'lowerA', 'upperB', 'lowerB', 'day5']);
  for (const w of Object.values(WORKOUTS)) {
    for (const ex of w.exercises) {
      assert.equal(/skullcrusher/i.test(ex.name), false, `Unexpected skullcrusher in ${ex.name}`);
      assert.ok(Array.isArray(ex.swaps) && ex.swaps.length >= 2, `Missing swaps for ${ex.id}`);
    }
  }
});

test('computePlanDayInfo resolves phases across 90-day calendar', () => {
  assert.equal(computePlanDayInfo('2026-11-24').dayNum, 1);
  assert.equal(computePlanDayInfo('2026-11-24').suggestedPhase, 'phase1');
  assert.equal(computePlanDayInfo('2026-11-24').isCreatineWindow, true);

  const wk7 = computePlanDayInfo('2027-01-06');
  assert.equal(wk7.weekNum, 7);
  assert.equal(wk7.suggestedPhase, 'deload');

  const wk10 = computePlanDayInfo('2027-01-27');
  assert.equal(wk10.weekNum, 10);
  assert.equal(wk10.suggestedPhase, 'phase2');
  assert.equal(wk10.suggestedBonusSets, true);
});

test('getEffectiveExerciseSpec applies deload and phase2 rules', () => {
  const bench = WORKOUTS.upperA.exercises[0];
  const deloadSpec = getEffectiveExerciseSpec(bench, { phase: 'deload', prevWeight: 150 });
  assert.equal(deloadSpec.sets, 2);
  assert.equal(deloadSpec.deloadSuggestedWeight, 135);

  const latRaise = WORKOUTS.upperA.exercises.find((e) => e.id === 'ua_lat_raise');
  const p2Bonus = getEffectiveExerciseSpec(latRaise, { phase: 'phase2', bonusWk10Sets: true });
  assert.equal(p2Bonus.sets, 4);
  assert.match(p2Bonus.activeIntensifier, /Lengthened Partials/);

  // Optional day 5 never enables failure intensifiers
  const d5Lat = WORKOUTS.day5.exercises.find((e) => e.id === 'd5_lat_raise');
  const d5Spec = getEffectiveExerciseSpec(d5Lat, { phase: 'phase2', bonusWk10Sets: true, isOptionalPumpDay: true });
  assert.equal(d5Spec.sets, 5);
  assert.equal(d5Spec.activeIntensifier, null);
});

test('computeRampUpSets calculates 50/75/90% warm-ups loadable with 5-lb plates', () => {
  const sets = computeRampUpSets(225, true);
  assert.equal(sets.length, 4);
  assert.deepEqual(sets.map((s) => [s.weight, s.reps]), [
    [45, 10],
    [115, 5],
    [165, 3],
    [205, 1]
  ]);
});

test('evaluateDoubleProgression detects top-of-range completion', () => {
  const bench = WORKOUTS.upperA.exercises[0]; // 5-8 reps, barbell (+10)
  const notReady = evaluateDoubleProgression(
    [
      { weight: 145, reps: 8, done: true },
      { weight: 145, reps: 7, done: true },
      { weight: 145, reps: 6, done: true }
    ],
    bench
  );
  assert.equal(notReady, null);

  const readyBarbell = evaluateDoubleProgression(
    [
      { weight: 135, reps: 8, done: true },
      { weight: 135, reps: 8, done: true },
      { weight: 135, reps: 8, done: true }
    ],
    bench
  );
  assert.equal(readyBarbell.increment, 10);
  assert.equal(readyBarbell.nextWeight, 145);

  const curl = WORKOUTS.upperA.exercises.find((e) => e.id === 'ua_hammer'); // isolation (+2.5)
  const readyIso = evaluateDoubleProgression(
    [
      { weight: 25, reps: 12, done: true },
      { weight: 25, reps: 12, done: true },
      { weight: 25, reps: 12, done: true }
    ],
    curl
  );
  assert.equal(readyIso.increment, 2.5);
  assert.equal(readyIso.nextWeight, 27.5);
});

test('computeRollingAverage and evaluateBiweeklyAdjustment handle trends accurately', () => {
  const logs = [];
  for (let i = 0; i < 15; i++) {
    const d = new Date('2026-12-10T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + i);
    logs.push({ date: d.toISOString().slice(0, 10), weight: 184 });
  }
  const series = computeRollingAverage(logs, 7);
  assert.equal(series[series.length - 1].rollingAvg, 184);

  const creatineAdvice = evaluateBiweeklyAdjustment({ weightLogs: logs, currentDay: 14 });
  assert.equal(creatineAdvice.status, 'creatine_caveat');

  const flatAdvice = evaluateBiweeklyAdjustment({ weightLogs: logs, waistLogs: [], currentDay: 35 });
  assert.equal(flatAdvice.status, 'cut_food');
});

test('getMacroTargets & validateBackupState work for all modes', () => {
  assert.equal(getMacroTargets('lifting', 'phase1', false).kcal, '2,500–2,550');
  assert.equal(getMacroTargets('rest', 'phase1', false).kcal, '2,050–2,100');
  assert.equal(getMacroTargets('rest', 'phase1', true).kcal, '2,200');
  assert.equal(getMacroTargets('lifting', 'deload', false).kcal, '2,650–2,750');

  assert.equal(validateBackupState({ version: 1, dailyLogs: {}, workoutHistory: [], weightLogs: [] }).valid, true);
  assert.equal(validateBackupState({ version: 1 }).valid, false);
});

test('getPerfKey isolates swapped exercise history from default slot', () => {
  const perf = {
    la_squat: { date: '2026-11-25', sets: [{ weight: 225, reps: 6 }] },
    'la_squat::45° Leg Press': { date: '2026-11-28', sets: [{ weight: 320, reps: 10 }] }
  };
  assert.equal(getPerfKey('la_squat', 'Barbell Back Squat', 'Barbell Back Squat'), 'la_squat');
  assert.equal(getPerfKey('la_squat', '45° Leg Press', 'Barbell Back Squat'), 'la_squat::45° Leg Press');
  assert.equal(getLastPerfEntry(perf, 'la_squat', 'Barbell Back Squat', 'Barbell Back Squat').sets[0].weight, 225);
  assert.equal(getLastPerfEntry(perf, 'la_squat', '45° Leg Press', 'Barbell Back Squat').sets[0].weight, 320);
  assert.equal(getLastPerfEntry(perf, 'la_squat', 'Hack Squat', 'Barbell Back Squat'), null);
});

test('recomputeSessionSummary & rebuildLastPerformance roll back cleanly on delete', () => {
  const s1 = recomputeSessionSummary(
    {
      id: 's1',
      date: '2026-11-24',
      workoutId: 'upperA',
      phase: 'phase1',
      exercises: [
        {
          exId: 'ua_bench',
          perfKey: 'ua_bench',
          name: 'Flat Barbell Bench Press',
          big3Key: 'bench',
          isDefaultSlot: true,
          isCompound: true,
          repMax: 8,
          sets: [
            { weight: 135, reps: 7, rir: 1.5 },
            { weight: 135, reps: 7, rir: 1.5 },
            { weight: 135, reps: 7, rir: 1.5 }
          ]
        }
      ]
    },
    WORKOUTS
  );
  assert.equal(s1.totalSetsDone, 3);
  assert.equal(s1.big3Max.bench, 135);
  assert.deepEqual(s1.progressions, []);

  const s2Bad = recomputeSessionSummary(
    {
      id: 's2',
      date: '2026-11-28',
      workoutId: 'upperA',
      phase: 'phase1',
      exercises: [
        {
          exId: 'ua_bench',
          perfKey: 'ua_bench',
          name: 'Flat Barbell Bench Press',
          big3Key: 'bench',
          isDefaultSlot: true,
          isCompound: true,
          repMax: 8,
          sets: [
            { weight: 1350, reps: 8, rir: 1 },
            { weight: 1350, reps: 8, rir: 1 },
            { weight: 1350, reps: 8, rir: 1 }
          ]
        }
      ]
    },
    WORKOUTS
  );
  assert.equal(s2Bad.big3Max.bench, 1350);
  assert.equal(s2Bad.progressions.length, 1);

  let perf = rebuildLastPerformance([s1, s2Bad]);
  assert.equal(perf.ua_bench.sets[0].weight, 1350);

  // Deleting bad session rolls lastPerformance back to s1
  perf = rebuildLastPerformance([s1], perf, ['ua_bench']);
  assert.equal(perf.ua_bench.sets[0].weight, 135);
  assert.equal(perf.ua_bench.date, '2026-11-24');

  // Deleting all sessions removes ua_bench from lastPerformance
  perf = rebuildLastPerformance([], perf, ['ua_bench']);
  assert.equal(perf.ua_bench, undefined);
});

test('computeBarbellPlatesPerSide computes 5-lb smallest plate loading', () => {
  assert.deepEqual(computeBarbellPlatesPerSide(45), []);
  assert.deepEqual(computeBarbellPlatesPerSide(135), [45]);
  assert.deepEqual(computeBarbellPlatesPerSide(175), [45, 10, 10]);
  assert.equal(computeBarbellPlatesPerSide(140), null); // Not loadable with 5-lb smallest plate
  assert.equal(computeBarbellPlatesPerSide(35), null);
});

test('computeExerciseTargetHint computes progress vs beat-last-session goals', () => {
  const bench = WORKOUTS.upperA.exercises[0]; // 5-8 reps, barbell (+10)
  const progHint = computeExerciseTargetHint(bench, {
    date: '2026-11-24',
    sets: [{ weight: 135, reps: 8 }, { weight: 135, reps: 8 }, { weight: 135, reps: 8 }]
  });
  assert.equal(progHint.mode, 'progress');
  assert.match(progHint.headline, /145 lbs/);

  const beatHint = computeExerciseTargetHint(bench, {
    date: '2026-11-24',
    sets: [{ weight: 135, reps: 7 }, { weight: 135, reps: 7 }, { weight: 135, reps: 6 }]
  });
  assert.equal(beatHint.mode, 'match_beat');
  assert.match(beatHint.headline, /Beat 20 reps/);
});

test('computeNextSessionDefaults auto-bumps weight on repMax and nudges weakest set otherwise', () => {
  const bench = WORKOUTS.upperA.exercises[0]; // 5-8 reps, +10 lb barbell
  const bumped = computeNextSessionDefaults(bench, {
    date: '2026-11-24',
    sets: [{ weight: 135, reps: 8 }, { weight: 135, reps: 8 }, { weight: 135, reps: 8 }]
  }, 3);
  assert.equal(bumped[0].weight, '145');
  assert.equal(bumped[0].reps, '5');
  assert.equal(bumped[0].autoProgressed, true);

  const nudged = computeNextSessionDefaults(bench, {
    date: '2026-11-24',
    sets: [{ weight: 135, reps: 7 }, { weight: 135, reps: 7 }, { weight: 135, reps: 6 }]
  }, 3);
  assert.deepEqual(nudged.map((s) => `${s.weight}x${s.reps}`), ['135x7', '135x7', '135x7']);

  const adjusted = getMacroTargets('rest', 'phase1', false, { restDeltaKcal: -150 });
  assert.equal(adjusted.kcal, '1,900–1,950');
});

test('estimate1RM, undershoot step-down, and computeWorkoutContextBrief work across N sessions', () => {
  assert.equal(estimate1RM(135, 8, 2), 180);

  const bench = WORKOUTS.upperA.exercises[0]; // 5-8 reps, +10 lb barbell
  const stepDown = computeNextSessionDefaults(bench, {
    date: '2026-11-28',
    sets: [{ weight: 145, reps: 4, rir: 0 }, { weight: 145, reps: 4, rir: 0 }, { weight: 145, reps: 3, rir: 0 }]
  }, 3);
  assert.equal(stepDown[0].weight, '135');
  assert.equal(stepDown[0].reps, '5');

  const brief = computeWorkoutContextBrief({
    workout: WORKOUTS.upperA,
    workoutHistory: [
      {
        id: 'u1',
        date: '2026-11-24',
        workoutId: 'upperA',
        durationMin: 52,
        totalSetsDone: 24,
        exercises: [{ exId: 'ua_bench', perfKey: 'ua_bench', name: 'Flat Barbell Bench Press', sets: [{ weight: 135, reps: 8, rir: 1 }] }]
      }
    ],
    lastPerformance: {
      ua_bench: { date: '2026-11-24', sets: [{ weight: 135, reps: 8, rir: 1 }, { weight: 135, reps: 8, rir: 1 }, { weight: 135, reps: 8, rir: 1 }] }
    },
    phase: 'phase1',
    weekNum: 2
  });
  assert.equal(brief.runNumber, 2);
  assert.match(brief.lastSummary, /Last Upper A/);
  assert.match(brief.todayGoal, /145 lbs/);

  const swapCtx = getPriorSwapContext(
    [{ workoutId: 'upperA', date: '2026-11-28', exercises: [{ exId: 'ua_bench', name: 'Machine Chest Press', sets: [{ weight: 140, reps: 8 }] }] }],
    'upperA',
    'ua_bench',
    'Flat Barbell Bench Press'
  );
  assert.equal(swapCtx.swappedName, 'Machine Chest Press');
  assert.equal(swapCtx.setsText, '140×8');
});

test('getEffectiveWorkouts, createPlanVersionSnapshot, and buildPlanVersionsExport support plan edits', () => {
  const custom = structuredClone(WORKOUTS);
  custom.lowerA.exercises[0] = {
    ...custom.lowerA.exercises[0],
    name: 'Hack Squat',
    sets: 4,
    repMin: 8,
    repMax: 10
  };
  const effective = getEffectiveWorkouts(WORKOUTS, custom);
  assert.equal(effective.lowerA.exercises[0].name, 'Hack Squat');
  assert.equal(effective.lowerA.exercises[0].sets, 4);
  assert.equal(effective.lowerA.exercises[0].swaps.includes('Hack Squat'), true);

  const v1 = createPlanVersionSnapshot({
    versionNumber: 1,
    workouts: WORKOUTS,
    effectiveDate: '2026-11-24',
    planDayInfo: { dayNum: 1, weekNum: 1 },
    phase: 'phase1'
  });
  const v2 = createPlanVersionSnapshot({
    versionNumber: 2,
    workouts: effective,
    effectiveDate: '2026-12-08',
    planDayInfo: { dayNum: 15, weekNum: 3 },
    phase: 'phase1',
    note: 'Week 3: Swapped Back Squat to Hack Squat'
  });
  const exported = buildPlanVersionsExport({
    planVersions: [v1, v2],
    activeVersionId: 'v2',
    activeWorkouts: effective,
    profile: PLAN_CONFIG.profile,
    strengthTargets: PLAN_CONFIG.strengthTargets
  });
  assert.equal(exported.exportType, 'recomp_90d_plan_versions');
  assert.equal(exported.planVersions.length, 2);
  assert.equal(exported.planVersions[0].workouts.lowerA.exercises[0].name, 'Barbell Back Squat');
  assert.equal(exported.planVersions[1].workouts.lowerA.exercises[0].name, 'Hack Squat');
  assert.equal(exported.planVersions[1].planWeek, 3);
});

test('getExercisePrescriptionRationale & evaluatePlanAdherence surface plan reasons and deviations', () => {
  const bench = WORKOUTS.upperA.exercises[0]; // 5-8 reps, barbell
  const why = getExercisePrescriptionRationale(bench, { phase: 'phase1' });
  assert.match(why, /5–8 @ 1–2 RIR/);

  const deloadWhy = getExercisePrescriptionRationale(bench, { phase: 'deload' });
  assert.match(deloadWhy, /Deload \(3\+ RIR\)/);

  const onPlan = evaluatePlanAdherence({
    exercise: bench,
    setsLog: [
      { weight: 135, reps: 7, rir: 1.5, done: true },
      { weight: 135, reps: 7, rir: 1.5, done: true },
      { weight: 135, reps: 7, rir: 1.5, done: true }
    ],
    activeName: bench.name,
    defaultName: bench.name,
    phase: 'phase1',
    expectedSets: 3
  });
  assert.equal(onPlan.status, 'on_plan');
  assert.deepEqual(onPlan.reasons, []);

  const deviated = evaluatePlanAdherence({
    exercise: bench,
    setsLog: [
      { weight: 145, reps: 4, rir: 0, done: true },
      { weight: 145, reps: 4, rir: 0, done: true },
      { weight: 145, reps: 4, rir: 0, done: true },
      { weight: 145, reps: 4, rir: 0, done: true }
    ],
    activeName: 'Machine Chest Press',
    defaultName: bench.name,
    phase: 'phase1',
    expectedSets: 3,
    prevEntry: { sets: [{ weight: 135, reps: 7 }, { weight: 135, reps: 7 }, { weight: 135, reps: 6 }] }
  });
  assert.equal(deviated.status, 'deviated');
  assert.equal(deviated.reasons.length, 5);
});

test('validateBackupState & normalizeRestoredState guard against corrupt or mismatched imports', () => {
  const invalidPlanExport = validateBackupState({ exportType: 'recomp_90d_plan_versions', version: 1, dailyLogs: {}, workoutHistory: [], weightLogs: [] });
  assert.equal(invalidPlanExport.valid, false);

  const normalized = normalizeRestoredState(
    { version: 1, dailyLogs: [], calorieAdjustments: null, workoutHistory: [] },
    { version: 4, dailyLogs: {}, calorieAdjustments: { liftingDeltaKcal: 0, restDeltaKcal: 0, stepsFloor: 8000 }, workoutHistory: [], weightLogs: [{ date: '2026-11-24', weight: 185 }], waistLogs: [], photoLogs: [], swapsBySlot: {}, lastPerformance: {}, draftWorkouts: {}, customWorkouts: null, activePlanVersionId: 'v1', planVersions: [{ versionId: 'v1' }] }
  );
  assert.deepEqual(normalized.dailyLogs, {});
  assert.equal(normalized.calorieAdjustments.stepsFloor, 8000);
  assert.equal(normalized.weightLogs.length, 1);
});

test('swapped non-barbell exercise uses +5 lb compound step instead of +10 lb barbell step', () => {
  const bench = WORKOUTS.upperA.exercises[0]; // Flat Barbell Bench Press (isBarbell: true, isCompound: true)
  const swapName = 'Machine Chest Press';
  const prevSwap = {
    date: '2026-11-24',
    sets: [
      { weight: 140, reps: 8, rir: 1 },
      { weight: 140, reps: 8, rir: 1 },
      { weight: 140, reps: 8, rir: 1 }
    ]
  };

  const hint = computeExerciseTargetHint(bench, prevSwap, { activeName: swapName });
  assert.equal(hint.mode, 'progress');
  assert.match(hint.headline, /145 lbs/);

  const defaults = computeNextSessionDefaults(bench, prevSwap, 3, {
    isDefaultSlot: false,
    activeName: swapName
  });
  assert.deepEqual(
    defaults.map((s) => `${s.weight}x${s.reps}`),
    ['145x5', '145x5', '145x5']
  );

  const prog = evaluateDoubleProgression(
    prevSwap.sets.map((s) => ({ ...s, done: true })),
    bench,
    swapName
  );
  assert.equal(prog.increment, 5);
  assert.equal(prog.nextWeight, 145);
});

test('every default exercise name matches its swaps[0] to prevent duplicate swap modal options', () => {
  for (const w of Object.values(WORKOUTS)) {
    for (const ex of w.exercises) {
      assert.equal(ex.swaps[0], ex.name, `Expected ${ex.id} swaps[0] to match exercise name`);
    }
  }
});

test('rest timer state machine handles reload hydration, -15s completion, pause/adjust, and restart cleanly', () => {
  const t0 = 1_700_000_000_000;
  const running = {
    active: true,
    paused: false,
    completed: false,
    remainingSec: 90,
    totalSec: 90,
    endAtMs: t0 + 90_000,
    label: 'Flat Barbell Bench Press'
  };

  // Normal tick midway through rest
  const mid = computeRestTimerTick(running, t0 + 30_000);
  assert.equal(mid.justCompleted, false);
  assert.equal(mid.state.remainingSec, 60);

  // Reaching 0 completes cleanly and pauses
  const done = computeRestTimerTick(mid.state, t0 + 90_500);
  assert.equal(done.justCompleted, true);
  assert.equal(done.staleCompletion, false);
  assert.equal(done.state.remainingSec, 0);
  assert.equal(done.state.paused, true);
  assert.equal(done.state.completed, true);

  // Returning >2 minutes late suppresses startling stale chime while marking completed
  const stale = computeRestTimerTick(running, t0 + 90_000 + 180_000);
  assert.equal(stale.justCompleted, true);
  assert.equal(stale.staleCompletion, true);

  // Adjusting -15s down to 0 while running finishes immediately
  const nearEnd = { ...running, remainingSec: 10, endAtMs: t0 + 10_000 };
  const minusToZero = adjustRestTimerState(nearEnd, -15, t0);
  assert.equal(minusToZero.justCompleted, true);
  assert.equal(minusToZero.state.remainingSec, 0);
  assert.equal(minusToZero.state.paused, true);
  assert.equal(minusToZero.state.completed, true);

  // Adjusting +15s while paused mid-rest preserves paused state without auto-resuming
  const pausedMid = toggleRestTimerPauseState(running, t0 + 30_000);
  assert.equal(pausedMid.paused, true);
  assert.equal(pausedMid.remainingSec, 60);
  const pausedPlus = adjustRestTimerState(pausedMid, 15, t0 + 35_000);
  assert.equal(pausedPlus.state.paused, true);
  assert.equal(pausedPlus.state.remainingSec, 75);

  // Adjusting +15s from GO! auto-resumes for 15s
  const addedFromDone = adjustRestTimerState(done.state, 15, t0 + 95_000);
  assert.equal(addedFromDone.state.paused, false);
  assert.equal(addedFromDone.state.completed, false);
  assert.equal(addedFromDone.state.remainingSec, 15);

  // Toggling from GO! restarts full totalSec
  const restarted = toggleRestTimerPauseState(done.state, t0 + 100_000);
  assert.equal(restarted.paused, false);
  assert.equal(restarted.remainingSec, 90);
  assert.equal(restarted.endAtMs, t0 + 190_000);

  // Reloading drops timers expired >4 hours ago
  const ancient = normalizeRestTimerState({ ...running, endAtMs: t0 - 5 * 3600 * 1000 }, t0);
  assert.deepEqual(ancient, createDefaultRestTimerState());
});
