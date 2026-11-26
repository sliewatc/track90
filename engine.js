import { PLAN_CONFIG } from './data.js';

export function roundToNearest(val, step) {
  if (!Number.isFinite(val) || val <= 0) return 0;
  return Math.round(val / step) * step;
}

export function isActiveExerciseBarbell(exercise, activeName) {
  if (!activeName || activeName === exercise?.name) return Boolean(exercise?.isBarbell);
  return /barbell/i.test(activeName);
}

export function getExerciseWeightStep(exercise, activeName = null) {
  if (isActiveExerciseBarbell(exercise, activeName)) return 10; // Smallest barbell plate is 5 lb (+10 lb total)
  if (exercise?.isCompound) return 5;
  return 2.5;
}

export function estimate1RM(weight, reps, rir = 0) {
  const w = Number(weight) || 0;
  const r = Number(reps) || 0;
  const reserve = Math.max(0, Number(rir) || 0);
  if (w <= 0 || r <= 0) return 0;
  const effReps = r + reserve;
  if (effReps <= 1) return Math.round(w);
  return Math.round(w * (1 + effReps / 30));
}

export function computePlanDayInfo(todayIso, startDateIso = PLAN_CONFIG.startDate) {
  const start = new Date(`${startDateIso}T00:00:00Z`);
  const curr = new Date(`${todayIso}T00:00:00Z`);
  const diffDays = Math.floor((curr - start) / 86400000);
  const clampedDay = Math.max(1, Math.min(PLAN_CONFIG.totalDays, diffDays + 1));
  const rawDay = diffDays + 1;
  const weekNum = Math.max(1, Math.min(13, Math.ceil(clampedDay / 7)));

  let suggestedPhase = 'phase1';
  if (weekNum === 7) suggestedPhase = 'deload';
  else if (weekNum >= 8) suggestedPhase = 'phase2';

  return {
    rawDay,
    dayNum: clampedDay,
    weekNum,
    suggestedPhase,
    suggestedBonusSets: weekNum >= 10,
    isCreatineWindow: clampedDay <= 21
  };
}

export function getMacroTargets(dayType, phase, hungerTightSwing = false, adjustments = null) {
  const liftDelta = Number(adjustments?.liftingDeltaKcal) || 0;
  const restDelta = Number(adjustments?.restDeltaKcal) || 0;
  const fmtRange = (lo, hi, delta) => (delta === 0 ? `${lo.toLocaleString()}–${hi.toLocaleString()}` : `${(lo + delta).toLocaleString()}–${(hi + delta).toLocaleString()}`);
  const fmtSingle = (val, delta) => (val + delta).toLocaleString();

  if (phase === 'deload') {
    return {
      label: 'Week 7 Deload (Maintenance)',
      kcal: '2,650–2,750',
      kcalMid: 2700,
      protein: '180–185g',
      fats: '65–70g',
      carbs: '330–355g'
    };
  }
  if (dayType === 'rest') {
    if (hungerTightSwing) {
      return {
        label: restDelta ? `Rest Day (Tighter Swing, ${restDelta > 0 ? '+' : ''}${restDelta})` : 'Rest Day (Tighter Swing)',
        kcal: fmtSingle(2200, restDelta),
        kcalMid: 2200 + restDelta,
        protein: '180–185g',
        fats: '65–70g',
        carbs: '210–220g'
      };
    }
    return {
      label: restDelta ? `Rest Day (${restDelta > 0 ? '+' : ''}${restDelta} kcal)` : 'Rest / Active Recovery Day',
      kcal: fmtRange(2050, 2100, restDelta),
      kcalMid: 2075 + restDelta,
      protein: '180–185g',
      fats: '65–70g',
      carbs: '175–195g'
    };
  }
  if (hungerTightSwing) {
    return {
      label: liftDelta ? `Lifting Day (Tighter Swing, ${liftDelta > 0 ? '+' : ''}${liftDelta})` : 'Lifting Day (Tighter Swing)',
      kcal: fmtSingle(2450, liftDelta),
      kcalMid: 2450 + liftDelta,
      protein: '180–185g',
      fats: '65–70g',
      carbs: '275–285g'
    };
  }
  return {
    label: liftDelta ? `Lifting Day (${liftDelta > 0 ? '+' : ''}${liftDelta} kcal)` : 'Lifting Day',
    kcal: fmtRange(2500, 2550, liftDelta),
    kcalMid: 2525 + liftDelta,
    protein: '180–185g',
    fats: '65–70g',
    carbs: '285–305g'
  };
}

export function getEffectiveExerciseSpec(exercise, { phase = 'phase1', bonusWk10Sets = false, isOptionalPumpDay = false, prevWeight = null } = {}) {
  let sets = exercise.sets;
  let deloadSuggestedWeight = null;
  let phaseNote = null;

  if (phase === 'deload') {
    sets = Math.max(1, Math.ceil(exercise.sets / 2));
    const baseW = Number(prevWeight) > 0 ? Number(prevWeight) : Number(exercise.defaultWeight || 0);
    if (baseW > 0) {
      const step = getExerciseWeightStep(exercise);
      if (exercise.isBarbell && step === 10) {
        deloadSuggestedWeight = Math.max(45, 45 + roundToNearest(baseW * 0.9 - 45, 10));
      } else {
        deloadSuggestedWeight = Math.max(step, roundToNearest(baseW * 0.9, step));
      }
    }
    phaseNote = `Deload: ${sets} working sets @ ~90% (${deloadSuggestedWeight ? `${deloadSuggestedWeight} lbs` : '-10%'})`;
  } else if (phase === 'phase2') {
    if (bonusWk10Sets && exercise.bonusWk10Set) {
      sets = exercise.sets + 1;
      phaseNote = 'Weeks 10–13: +1 bonus aesthetic set';
    }
  }

  const activeIntensifier = (phase === 'phase2' && !isOptionalPumpDay) ? exercise.phase2Cue : null;

  return {
    sets,
    deloadSuggestedWeight,
    phaseNote,
    activeIntensifier
  };
}

export function computeRampUpSets(workingWeight, isBarbell = true, minBarbellPlate = 5) {
  const w = Number(workingWeight);
  if (!Number.isFinite(w) || w <= 0) return [];
  const light = isBarbell ? 45 : Math.max(10, roundToNearest(w * 0.3, 5));
  const roundBar = (pct) => {
    const raw = w * pct;
    if (isBarbell && minBarbellPlate === 5) {
      return Math.max(45, 45 + roundToNearest(Math.max(0, raw - 45), 10));
    }
    return Math.max(light, roundToNearest(raw, 5));
  };
  return [
    { label: isBarbell ? 'Empty Bar / Light' : 'Light Warm-up', reps: 10, weight: light, pct: 'Warm-up' },
    { label: '50% Ramp', reps: 5, weight: roundBar(0.5), pct: '50%' },
    { label: '75% Ramp', reps: 3, weight: roundBar(0.75), pct: '75%' },
    { label: '90% Primer', reps: 1, weight: roundBar(0.9), pct: '90%' }
  ];
}

export function computeBarbellPlatesPerSide(totalWeight, barWeight = 45, minPlate = 5) {
  const w = Number(totalWeight);
  if (!Number.isFinite(w) || w < barWeight) return null;
  if (w === barWeight) return [];
  let perSide = (w - barWeight) / 2;
  const plates = minPlate === 2.5 ? [45, 35, 25, 10, 5, 2.5] : [45, 35, 25, 10, 5];
  const result = [];
  for (const p of plates) {
    while (perSide + 0.001 >= p) {
      result.push(p);
      perSide -= p;
    }
  }
  if (perSide > 0.01) return null;
  return result;
}

export function evaluateDoubleProgression(setsLog, exercise, activeName = null) {
  if (!Array.isArray(setsLog) || setsLog.length === 0) return null;
  const doneSets = setsLog.filter((s) => s.done && Number(s.reps) > 0);
  if (doneSets.length < setsLog.length) return null;

  const weights = doneSets.map((s) => Number(s.weight) || 0);
  const allPositiveWeight = weights.every((w) => w > 0);
  const hitTop = doneSets.every((s) => Number(s.reps) >= exercise.repMax);

  if (!hitTop) return null;
  const increment = getExerciseWeightStep(exercise, activeName);
  const currentMaxW = Math.max(...weights);
  return {
    ready: true,
    increment,
    nextWeight: allPositiveWeight ? currentMaxW + increment : null,
    message: allPositiveWeight
      ? `Hit ${exercise.repMax}+ reps: add +${increment} lbs next (${currentMaxW + increment} lbs)`
      : `Hit ${exercise.repMax}+ reps: progress load next`
  };
}

export function computeRollingAverage(weightLogs, windowDays = 7) {
  if (!Array.isArray(weightLogs) || weightLogs.length === 0) return [];
  const sorted = [...weightLogs]
    .filter((e) => e && e.date && Number.isFinite(Number(e.weight)))
    .sort((a, b) => a.date.localeCompare(b.date));

  return sorted.map((entry) => {
    const endMs = new Date(`${entry.date}T00:00:00Z`).getTime();
    const startMs = endMs - (windowDays - 1) * 86400000;
    const windowEntries = sorted.filter((other) => {
      const t = new Date(`${other.date}T00:00:00Z`).getTime();
      return t >= startMs && t <= endMs;
    });
    const avg = windowEntries.reduce((sum, x) => sum + Number(x.weight), 0) / windowEntries.length;
    return {
      date: entry.date,
      weight: Number(entry.weight),
      rollingAvg: Number(avg.toFixed(1)),
      sampleCount: windowEntries.length
    };
  });
}

export function evaluateBiweeklyAdjustment({ weightLogs = [], waistLogs = [], workoutHistory = [], currentDay = 1 }) {
  if (currentDay <= 21) {
    return {
      status: 'creatine_caveat',
      title: 'Weeks 1–3 Creatine Water-Weight Window',
      recommendation: 'Do not cut calories based on scale weight alone. Expect +2–4 lb water bump if starting creatine; judge progress by waist, photos, and gym performance.'
    };
  }

  const series = computeRollingAverage(weightLogs, 7);
  if (series.length < 4) {
    return {
      status: 'need_data',
      title: 'Need More Weigh-Ins for Biweekly Trend',
      recommendation: 'Log morning scale weight consistently for 7+ days and biweekly waist measurements to unlock automated calorie adjustments.'
    };
  }

  const latest = series[series.length - 1];
  const latestMs = new Date(`${latest.date}T00:00:00Z`).getTime();
  const targetPrevMs = latestMs - 14 * 86400000;
  let baseline = series[0];
  let bestDiff = Infinity;
  for (const pt of series) {
    const t = new Date(`${pt.date}T00:00:00Z`).getTime();
    const diff = Math.abs(t - targetPrevMs);
    if (diff < bestDiff) {
      bestDiff = diff;
      baseline = pt;
    }
  }

  const daysApart = (latestMs - new Date(`${baseline.date}T00:00:00Z`).getTime()) / 86400000;
  if (daysApart < 10) {
    return {
      status: 'need_data',
      title: 'Building 14-Day Trend',
      recommendation: `Currently ${Math.round(daysApart)} days between earliest and latest rolling averages. Check again once 10–14 days of weigh-ins are logged.`
    };
  }

  const weeklyRate = ((latest.rollingAvg - baseline.rollingAvg) / daysApart) * 7;

  const sortedWaist = [...waistLogs].sort((a, b) => a.date.localeCompare(b.date));
  const waistUnchanged = sortedWaist.length >= 2
    ? Math.abs(Number(sortedWaist[sortedWaist.length - 1].waist) - Number(sortedWaist[sortedWaist.length - 2].waist)) < 0.25
    : true;

  // Check progression across any tracked Big 3 lifts rather than bench alone
  let trackedLifts = 0;
  let stalledLifts = 0;
  for (const key of ['bench', 'squat', 'deadlift']) {
    const vals = workoutHistory
      .map((w) => w.big3Max?.[key] || 0)
      .filter((v) => v > 0)
      .slice(-4);
    if (vals.length >= 2) {
      trackedLifts += 1;
      if (vals[vals.length - 1] <= vals[0]) stalledLifts += 1;
    }
  }
  const strengthStalling = trackedLifts > 0 && stalledLifts === trackedLifts;

  if (weeklyRate < -1.2 && strengthStalling) {
    return {
      status: 'add_food',
      title: `Losing ${Math.abs(weeklyRate).toFixed(2)} lbs/wk + Strength Flat`,
      recommendation: 'Add +150 kcal of carbs on lifting days to protect muscle and drive progression.'
    };
  }

  if (weeklyRate > -0.15 && waistUnchanged) {
    return {
      status: 'cut_food',
      title: 'Weight & Waist Flat Over ~2 Weeks',
      recommendation: 'Cut 150 kcal from rest-day carbs/fats OR add +1,500 daily steps.'
    };
  }

  return {
    status: 'on_track',
    title: `On Track (${weeklyRate >= 0 ? '+' : ''}${weeklyRate.toFixed(2)} lbs/wk rolling avg)`,
    recommendation: 'Stay the course. Keep hitting 180–185g protein, 8–10k steps, and double progression.'
  };
}

export function getPerfKey(exId, activeName, defaultName) {
  if (!activeName || activeName === defaultName) return exId;
  return `${exId}::${activeName}`;
}

export function getLastPerfEntry(lastPerformance, exId, activeName, defaultName) {
  if (!lastPerformance || typeof lastPerformance !== 'object') return null;
  const key = getPerfKey(exId, activeName, defaultName);
  return lastPerformance[key] || null;
}

export function computeExerciseTargetHint(exercise, prevEntry, { phase = 'phase1', isOptionalPumpDay = false, activeName = null } = {}) {
  const effectiveBarbell = isActiveExerciseBarbell(exercise, activeName);
  const step = getExerciseWeightStep(exercise, activeName);
  if (phase === 'deload') {
    const baseW = Number(prevEntry?.sets?.[0]?.weight) || Number(exercise.defaultWeight) || 0;
    const deloadW = baseW > 0
      ? (effectiveBarbell ? Math.max(45, 45 + roundToNearest(baseW * 0.9 - 45, 10)) : Math.max(step, roundToNearest(baseW * 0.9, step)))
      : null;
    return {
      mode: 'deload',
      headline: deloadW ? `${deloadW} lbs · 2 sets` : '2 sets @ -10%',
      detail: 'Leave 3+ reps in reserve; focus on crisp bar speed.'
    };
  }

  if (!prevEntry?.sets?.length) {
    const startW = Number(exercise.defaultWeight) || 0;
    return {
      mode: 'baseline',
      headline: startW > 0 ? `Start ~${startW} lbs × ${exercise.repMin}–${exercise.repMax}` : `${exercise.repMin}–${exercise.repMax} reps`,
      detail: isOptionalPumpDay ? 'Stop at 2 RIR (keep Monday fresh).' : 'Find working weight at 1–2 RIR.'
    };
  }

  const prevSets = prevEntry.sets;
  const prevTopW = Math.max(...prevSets.map((s) => Number(s.weight) || 0));
  const hitAllTop = prevSets.every((s) => Number(s.reps) >= exercise.repMax);
  const underMin = prevSets.some((s) => Number(s.reps) > 0 && Number(s.reps) < exercise.repMin);
  const avgRir = prevSets.reduce((sum, s) => sum + (Number(s.rir) || 0), 0) / prevSets.length;

  if (underMin && avgRir <= 0.5 && prevTopW > 0) {
    const minW = exercise.isBarbell ? 45 : step;
    const stepDownW = Math.max(minW, prevTopW - step);
    return {
      mode: 'step_down',
      headline: `Step down: ${stepDownW} lbs × ${exercise.repMin}+`,
      detail: `Missed ${exercise.repMin} reps at ~0 RIR last time; reset load cleanly.`
    };
  }

  if (hitAllTop && prevTopW > 0) {
    return {
      mode: 'progress',
      headline: `Progress: ${prevTopW + step} lbs × ${exercise.repMin}+`,
      detail: `Hit ${exercise.repMax} reps across all sets last time (+${step} lb).`
    };
  }

  const prevTotalReps = prevSets.reduce((sum, s) => sum + (Number(s.reps) || 0), 0);
  const minReps = Math.min(...prevSets.map((s) => Number(s.reps) || 0));
  return {
    mode: 'match_beat',
    headline: prevTopW > 0
      ? `Beat ${prevTotalReps} reps @ ${prevTopW} lbs`
      : `Beat ${prevTotalReps} total reps`,
    detail: `Push ${minReps}-rep set to ${Math.min(exercise.repMax, minReps + 1)}+ reps at ${isOptionalPumpDay ? '2 RIR' : '1–2 RIR'}.`
  };
}

export function computeNextSessionDefaults(exercise, prevEntry, setCount, { phase = 'phase1', isDefaultSlot = true, isOptionalPumpDay = false, deloadSuggestedWeight = null, activeName = null } = {}) {
  const prevSets = prevEntry?.sets || [];
  const effectiveBarbell = isActiveExerciseBarbell(exercise, activeName);
  const step = getExerciseWeightStep(exercise, activeName);
  const defaultRir = isOptionalPumpDay ? '2' : '1.5';

  if (phase === 'deload') {
    const rows = [];
    for (let i = 0; i < setCount; i++) {
      const p = prevSets[i] || prevSets[0];
      const w = deloadSuggestedWeight ?? p?.weight ?? (isDefaultSlot ? exercise.defaultWeight : '');
      rows.push({
        weight: !w || w === 0 ? '' : String(w),
        reps: String(exercise.repMin),
        rir: '3',
        done: false,
        weightEdited: false,
        autoProgressed: false
      });
    }
    return rows;
  }

  if (prevSets.length > 0) {
    const prevTopW = Math.max(...prevSets.map((s) => Number(s.weight) || 0));
    const hitAllTop = prevSets.every((s) => Number(s.reps) >= exercise.repMax);
    const underMin = prevSets.some((s) => Number(s.reps) > 0 && Number(s.reps) < exercise.repMin);
    const avgRir = prevSets.reduce((sum, s) => sum + (Number(s.rir) || 0), 0) / prevSets.length;

    if (underMin && avgRir <= 0.5 && prevTopW > 0) {
      const minW = effectiveBarbell ? 45 : step;
      const stepDownW = Math.max(minW, prevTopW - step);
      return Array.from({ length: setCount }, () => ({
        weight: String(stepDownW),
        reps: String(exercise.repMin),
        rir: defaultRir,
        done: false,
        weightEdited: false,
        autoProgressed: false
      }));
    }

    if (hitAllTop && prevTopW > 0) {
      const nextW = prevTopW + step;
      return Array.from({ length: setCount }, () => ({
        weight: String(nextW),
        reps: String(exercise.repMin),
        rir: defaultRir,
        done: false,
        weightEdited: false,
        autoProgressed: true
      }));
    }

    // Not yet at repMax on all sets: keep weight and nudge the lowest-rep set by +1
    const minReps = Math.min(...prevSets.map((s) => Number(s.reps) || exercise.repMin));
    let nudged = false;
    return Array.from({ length: setCount }, (_, i) => {
      const p = prevSets[i] || prevSets[0];
      const w = p?.weight ?? (isDefaultSlot ? exercise.defaultWeight : '');
      let targetReps = Number(p?.reps) || exercise.repMin;
      if (!nudged && targetReps === minReps && targetReps < exercise.repMax) {
        targetReps += 1;
        nudged = true;
      }
      return {
        weight: !w || w === 0 ? '' : String(w),
        reps: String(targetReps),
        rir: p?.rir !== undefined ? String(p.rir) : defaultRir,
        done: false,
        weightEdited: false,
        autoProgressed: false
      };
    });
  }

  // First time doing this exercise
  const startW = isDefaultSlot ? exercise.defaultWeight : '';
  return Array.from({ length: setCount }, () => ({
    weight: !startW || startW === 0 ? '' : String(startW),
    reps: String(exercise.repMin),
    rir: defaultRir,
    done: false,
    weightEdited: false,
    autoProgressed: false
  }));
}

export function recomputeSessionSummary(session, workoutsMap) {
  const workout = workoutsMap?.[session.workoutId];
  const exercises = Array.isArray(session.exercises) ? session.exercises : [];
  let totalSetsDone = 0;
  const big3Max = {};
  const progressions = [];
  const deviations = [];
  let onPlanCount = 0;
  let deviatedCount = 0;

  for (const exEntry of exercises) {
    const sets = Array.isArray(exEntry.sets) ? exEntry.sets : [];
    if (sets.length === 0) continue;
    totalSetsDone += sets.length;

    const exDef = workout?.exercises?.find((e) => e.id === exEntry.exId);
    const big3Key = exEntry.big3Key || exDef?.big3Key;
    const isRepMaxGoal = exEntry.isRepMaxGoal !== undefined ? exEntry.isRepMaxGoal : exDef?.isRepMaxGoal;
    const isDefaultSlot = exEntry.isDefaultSlot !== undefined
      ? exEntry.isDefaultSlot
      : (exDef ? exEntry.name === exDef.name : false);
    if (big3Key && isDefaultSlot) {
      if (isRepMaxGoal) {
        const maxR = Math.max(...sets.map((s) => Number(s.reps) || 0));
        if (maxR > 0) big3Max[big3Key] = maxR;
      } else {
        const maxW = Math.max(...sets.map((s) => Number(s.weight) || 0));
        if (maxW > 0) big3Max[big3Key] = maxW;
      }
    }

    if (session.phase !== 'deload') {
      const repMax = exEntry.repMax || exDef?.repMax;
      const isCompound = exEntry.isCompound !== undefined ? exEntry.isCompound : exDef?.isCompound;
      const isBarbell = exEntry.isBarbell !== undefined ? exEntry.isBarbell : exDef?.isBarbell;
      if (repMax) {
        const prog = evaluateDoubleProgression(
          sets.map((s) => ({ ...s, done: true })),
          { repMax, isCompound, isBarbell, name: exDef?.name || exEntry.name },
          exEntry.name
        );
        if (prog) progressions.push(`${exEntry.name} (+${prog.increment} lb)`);
      }
    }

    if (Array.isArray(exEntry.deviations) && exEntry.deviations.length > 0) {
      deviatedCount += 1;
      deviations.push(`${exEntry.name}: ${exEntry.deviations.join(', ')}`);
    } else {
      onPlanCount += 1;
    }
  }

  return {
    ...session,
    totalSetsDone,
    big3Max,
    progressions,
    adherenceSummary: {
      onPlanCount,
      deviatedCount,
      deviations
    }
  };
}

export function rebuildLastPerformance(workoutHistory, existingLastPerf = {}, removedKeys = []) {
  const next = { ...(existingLastPerf || {}) };
  for (const k of removedKeys) {
    delete next[k];
  }

  const ordered = [...(Array.isArray(workoutHistory) ? workoutHistory : [])]
    .filter((s) => Array.isArray(s?.exercises) && s.exercises.length > 0)
    .sort((a, b) => {
      const cmp = String(a.date || '').localeCompare(String(b.date || ''));
      return cmp !== 0 ? cmp : String(a.id || '').localeCompare(String(b.id || ''));
    });

  for (const session of ordered) {
    for (const exEntry of session.exercises) {
      if (!exEntry.perfKey || !Array.isArray(exEntry.sets) || exEntry.sets.length === 0) continue;
      next[exEntry.perfKey] = {
        date: session.date,
        sets: exEntry.sets.map((s) => ({
          weight: Number(s.weight) || 0,
          reps: Number(s.reps) || 0,
          rir: Number(s.rir) || 0
        }))
      };
    }
  }
  return next;
}

export function getEffectiveWorkouts(baseWorkouts, customWorkouts = null) {
  const source = customWorkouts && typeof customWorkouts === 'object' ? customWorkouts : baseWorkouts;
  const result = {};
  for (const [id, baseW] of Object.entries(baseWorkouts)) {
    const customW = source[id];
    if (!customW) {
      result[id] = structuredClone(baseW);
      continue;
    }
    const mergedExercises = Array.isArray(customW.exercises)
      ? customW.exercises.map((ex) => {
          const swaps = Array.isArray(ex.swaps) && ex.swaps.length > 0 ? [...ex.swaps] : [ex.name];
          if (!swaps.includes(ex.name)) swaps.unshift(ex.name);
          return {
            ...ex,
            sets: Math.max(1, Number(ex.sets) || 3),
            repMin: Math.max(1, Number(ex.repMin) || 8),
            repMax: Math.max(Math.max(1, Number(ex.repMin) || 8), Number(ex.repMax) || 12),
            restSec: Math.max(15, Number(ex.restSec) || 60),
            swaps
          };
        })
      : structuredClone(baseW.exercises);

    result[id] = {
      ...baseW,
      ...customW,
      exercises: mergedExercises
    };
  }
  return result;
}

export function createPlanVersionSnapshot({
  versionNumber,
  workouts,
  effectiveDate,
  planDayInfo,
  phase,
  note = '',
  nutritionConfig = {}
}) {
  return {
    versionId: `v${versionNumber}`,
    versionNumber,
    createdAt: new Date().toISOString(),
    effectiveDate,
    planDay: planDayInfo?.dayNum ?? 1,
    planWeek: planDayInfo?.weekNum ?? 1,
    phase: phase || 'phase1',
    note: String(note || '').trim() || (versionNumber === 1 ? 'Initial 90-day baseline plan' : 'Plan customization'),
    nutritionConfig: { ...nutritionConfig },
    workouts: structuredClone(workouts)
  };
}

export function buildPlanVersionsExport({ planVersions = [], activeVersionId = 'v1', activeWorkouts, profile, strengthTargets }) {
  return {
    exportType: 'recomp_90d_plan_versions',
    exportedAt: new Date().toISOString(),
    activeVersionId,
    profile,
    strengthTargets,
    activeWorkouts: structuredClone(activeWorkouts),
    planVersions: structuredClone(planVersions)
  };
}

export function getExerciseHistoryTrail(workoutHistory, perfKey, limit = 5) {
  if (!Array.isArray(workoutHistory) || !perfKey) return [];
  const trail = [];
  for (const sess of workoutHistory) {
    const ex = (sess.exercises || []).find((e) => e.perfKey === perfKey);
    if (!ex || !Array.isArray(ex.sets) || ex.sets.length === 0) continue;
    const maxW = Math.max(...ex.sets.map((s) => Number(s.weight) || 0));
    const totalReps = ex.sets.reduce((sum, s) => sum + (Number(s.reps) || 0), 0);
    const bestE1rm = Math.max(...ex.sets.map((s) => estimate1RM(s.weight, s.reps, s.rir)));
    trail.push({ date: sess.date, maxW, totalReps, bestE1rm, sets: ex.sets });
  }
  return trail.slice(-limit);
}

export function computeWorkoutContextBrief({ workout, workoutHistory = [], lastPerformance = {}, swapsBySlot = {}, phase = 'phase1', weekNum = 1 }) {
  const matchingSessions = workoutHistory.filter((h) => h.workoutId === workout.id);
  const runNumber = matchingSessions.length + 1;
  const lastRun = matchingSessions.length ? matchingSessions[matchingSessions.length - 1] : null;

  const weightJumps = [];
  const stalledLifts = [];
  for (const ex of workout.exercises) {
    const activeName = swapsBySlot[ex.id] || ex.name;
    const perfKey = getPerfKey(ex.id, activeName, ex.name);
    const prev = lastPerformance[perfKey];
    const hint = computeExerciseTargetHint(ex, prev, {
      phase,
      isOptionalPumpDay: Boolean(workout.isOptionalPumpDay),
      activeName
    });
    if (hint.mode === 'progress') {
      weightJumps.push(`${activeName.split(' (')[0]} (${hint.headline.replace('Progress: ', '')})`);
    }
    const trail = getExerciseHistoryTrail(workoutHistory, perfKey, 3);
    if (phase !== 'deload' && trail.length >= 3) {
      const first = trail[0];
      const last = trail[trail.length - 1];
      if (last.maxW <= first.maxW && last.totalReps <= first.totalReps && last.bestE1rm <= first.bestE1rm) {
        stalledLifts.push(activeName.split(' (')[0]);
      }
    }
  }

  let lastSummary = `First ${workout.shortName} of your 90-day plan (Week ${weekNum}).`;
  if (lastRun) {
    const anchor = lastRun.exercises?.[0];
    const anchorText = anchor?.sets?.length
      ? ` · ${anchor.name.split(' (')[0]} ${anchor.sets.map((s) => `${s.weight || 'BW'}×${s.reps}`).join(',')}`
      : '';
    lastSummary = `Last ${workout.shortName} (${lastRun.date.slice(5)}${lastRun.durationMin ? `, ${lastRun.durationMin}m` : ''}): ${lastRun.totalSetsDone} sets${anchorText}`;
  }

  let todayGoal = '';
  if (phase === 'deload') {
    todayGoal = 'Week 7 Deload: 2 crisp sets per exercise at -10% load (3+ RIR) to clear fatigue.';
  } else if (workout.isOptionalPumpDay) {
    todayGoal = 'Optional Aesthetic Pump: Keep every set capped at 2 RIR (no failure) so Monday Bench stays fresh.';
  } else if (weightJumps.length > 0) {
    todayGoal = `Today's Goal: Lock in ${weightJumps.slice(0, 2).join(' & ')}, and add +1 rep on remaining lifts under 60m.`;
  } else if (stalledLifts.length > 0) {
    todayGoal = `Today's Goal: Break plateau on ${stalledLifts[0]} (+1 rep at 1 RIR or swap station) and beat last session's total reps.`;
  } else if (lastRun) {
    todayGoal = `Today's Goal: Beat last ${workout.shortName}'s rep totals at 1–2 RIR while staying under 60m.`;
  } else {
    todayGoal = 'Today\'s Goal: Establish clean 1–2 RIR working baselines with sharp form.';
  }

  return {
    runNumber,
    lastSummary,
    todayGoal,
    weightJumps,
    stalledLifts
  };
}

export function getPriorSwapContext(workoutHistory, workoutId, exId, defaultName) {
  if (!Array.isArray(workoutHistory) || !workoutId || !exId) return null;
  const matching = workoutHistory.filter((h) => h.workoutId === workoutId);
  if (matching.length === 0) return null;
  const lastSess = matching[matching.length - 1];
  const entry = (lastSess.exercises || []).find((e) => e.exId === exId);
  if (!entry || entry.name === defaultName) return null;
  const setsText = Array.isArray(entry.sets) && entry.sets.length
    ? entry.sets.map((s) => `${s.weight || 'BW'}×${s.reps}`).join(', ')
    : '';
  return {
    swappedName: entry.name,
    date: lastSess.date,
    setsText
  };
}

export function getExercisePrescriptionRationale(exercise, { phase = 'phase1', isOptionalPumpDay = false } = {}) {
  const repLabel = exercise.repMin === exercise.repMax ? `${exercise.repMin}` : `${exercise.repMin}–${exercise.repMax}`;
  if (phase === 'deload') {
    return 'Deload (3+ RIR): half volume and -10% load to clear joint/CNS fatigue before Phase 2.';
  }
  if (isOptionalPumpDay) {
    return `Aesthetic pump (${repLabel} @ 2 RIR cap): hypertrophy stimulus without failure so Monday Bench stays fresh.`;
  }
  if (exercise.isRepMaxGoal) {
    return `Strict pull-up test (1–2 RIR): track bodyweight max reps before pulldown volume.`;
  }
  if (exercise.isBarbell || exercise.repMax <= 8) {
    return `Heavy compound (${repLabel} @ 1–2 RIR): high mechanical tension to preserve strength in a deficit.`;
  }
  if (exercise.isCompound) {
    return `Compound volume (${repLabel} @ 1–2 RIR): balanced back/chest stimulus with controlled fatigue.`;
  }
  if (phase === 'phase2' && exercise.phase2Cue) {
    return `Isolation (${repLabel} @ 1–2 RIR): joint-friendly hypertrophy; push final set with Phase 2 finisher.`;
  }
  return `Isolation (${repLabel} @ 1–2 RIR): target muscle tension without excessive systemic fatigue.`;
}

export function evaluatePlanAdherence({
  exercise,
  setsLog = [],
  activeName = '',
  defaultName = '',
  phase = 'phase1',
  isOptionalPumpDay = false,
  expectedSets = null,
  prevEntry = null
}) {
  const reasons = [];
  if (activeName && defaultName && activeName !== defaultName) {
    reasons.push(`Swapped (${activeName})`);
  }
  if (expectedSets && setsLog.length > expectedSets) {
    reasons.push(`+${setsLog.length - expectedSets} extra set${setsLog.length - expectedSets === 1 ? '' : 's'}`);
  }

  const doneSets = setsLog.filter((s) => s.done && Number(s.reps) > 0);
  if (doneSets.length > 0) {
    if (phase === 'deload' && doneSets.some((s) => Number(s.rir) < 2.5)) {
      reasons.push('Pushed below Deload 3+ RIR');
    } else if (isOptionalPumpDay && doneSets.some((s) => Number(s.rir) < 1.5)) {
      reasons.push('Under 2 RIR cap');
    } else if (phase === 'phase1' && doneSets.some((s) => Number(s.rir) < 0.5)) {
      reasons.push('Hit 0 RIR (plan: 1–2 RIR)');
    }

    if (doneSets.some((s) => Number(s.reps) < exercise.repMin)) {
      reasons.push(`Below ${exercise.repMin}-rep floor`);
    }

    if (prevEntry?.sets?.length && phase !== 'deload') {
      const prevHitTop = prevEntry.sets.every((s) => Number(s.reps) >= exercise.repMax);
      const prevMaxW = Math.max(...prevEntry.sets.map((s) => Number(s.weight) || 0));
      if (!prevHitTop && prevMaxW > 0 && doneSets.some((s) => (Number(s.weight) || 0) > prevMaxW)) {
        reasons.push(`Jumped weight before ${exercise.repMax} reps`);
      }
    }
  }

  return {
    status: reasons.length === 0 ? 'on_plan' : 'deviated',
    label: reasons.length === 0 ? 'On Plan' : 'Modified',
    reasons
  };
}

export function validateBackupState(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { valid: false, error: 'Backup must be a JSON object.' };
  if (raw.exportType === 'recomp_90d_plan_versions') {
    return { valid: false, error: 'This is a Plan Versions export, not a full tracker backup.' };
  }
  if (typeof raw.version !== 'number') return { valid: false, error: 'Missing numeric backup version.' };
  if (!raw.dailyLogs || typeof raw.dailyLogs !== 'object' || Array.isArray(raw.dailyLogs)) {
    return { valid: false, error: 'Missing dailyLogs object.' };
  }
  if (!Array.isArray(raw.workoutHistory)) return { valid: false, error: 'Missing workoutHistory array.' };
  if (!Array.isArray(raw.weightLogs)) return { valid: false, error: 'Missing weightLogs array.' };
  if (raw.waistLogs !== undefined && !Array.isArray(raw.waistLogs)) return { valid: false, error: 'Invalid waistLogs array.' };
  if (raw.photoLogs !== undefined && !Array.isArray(raw.photoLogs)) return { valid: false, error: 'Invalid photoLogs array.' };
  return { valid: true };
}

export function createDefaultRestTimerState() {
  return {
    active: false,
    paused: false,
    completed: false,
    remainingSec: 0,
    totalSec: 90,
    endAtMs: 0,
    label: ''
  };
}

export function normalizeRestTimerState(raw, nowMs = Date.now()) {
  const fallback = createDefaultRestTimerState();
  if (!raw || typeof raw !== 'object' || !raw.active) return fallback;
  const totalSec = Math.max(10, Math.round(Number(raw.totalSec) || 90));
  const label = String(raw.label || 'Rest');
  const paused = Boolean(raw.paused);
  const completed = Boolean(raw.completed);
  const endAtMs = Number(raw.endAtMs) || 0;

  if (paused) {
    const remainingSec = Math.max(0, Math.round(Number(raw.remainingSec) || 0));
    if (remainingSec === 0 && endAtMs > 0 && (nowMs - endAtMs) > 4 * 3600 * 1000) {
      return fallback;
    }
    return {
      active: true,
      paused: true,
      completed: completed || remainingSec === 0,
      remainingSec,
      totalSec: Math.max(totalSec, remainingSec || 10),
      endAtMs: remainingSec === 0 ? endAtMs : 0,
      label
    };
  }

  if (endAtMs <= 0) return fallback;
  if ((nowMs - endAtMs) > 4 * 3600 * 1000) return fallback;

  const remainingSec = Math.max(0, Math.ceil((endAtMs - nowMs) / 1000));
  return {
    active: true,
    paused: false,
    completed: false,
    remainingSec,
    totalSec: Math.max(totalSec, remainingSec || 10),
    endAtMs,
    label
  };
}

export function computeRestTimerTick(timerState, nowMs = Date.now()) {
  if (!timerState?.active || timerState.paused) {
    return { state: timerState || createDefaultRestTimerState(), justCompleted: false, staleCompletion: false };
  }
  const remainingSec = Math.max(0, Math.ceil((timerState.endAtMs - nowMs) / 1000));
  if (remainingSec <= 0) {
    const staleCompletion = (nowMs - timerState.endAtMs) > 120000;
    return {
      state: {
        ...timerState,
        remainingSec: 0,
        paused: true,
        completed: true
      },
      justCompleted: !timerState.completed,
      staleCompletion
    };
  }
  return {
    state: {
      ...timerState,
      remainingSec,
      completed: false
    },
    justCompleted: false,
    staleCompletion: false
  };
}

export function adjustRestTimerState(timerState, deltaSec, nowMs = Date.now()) {
  if (!timerState?.active) {
    return { state: timerState || createDefaultRestTimerState(), justCompleted: false };
  }
  const delta = Number(deltaSec) || 0;
  if (timerState.paused) {
    if (timerState.remainingSec <= 0 && delta <= 0) {
      return { state: timerState, justCompleted: false };
    }
    const wasFinished = timerState.completed || timerState.remainingSec <= 0;
    const nextRemaining = Math.max(0, timerState.remainingSec + delta);
    const nextTotal = Math.max(timerState.totalSec, nextRemaining);
    if (nextRemaining <= 0) {
      return {
        state: {
          ...timerState,
          remainingSec: 0,
          totalSec: nextTotal,
          paused: true,
          completed: true,
          endAtMs: nowMs
        },
        justCompleted: false
      };
    }
    if (wasFinished) {
      return {
        state: {
          ...timerState,
          remainingSec: nextRemaining,
          totalSec: nextTotal,
          paused: false,
          completed: false,
          endAtMs: nowMs + nextRemaining * 1000
        },
        justCompleted: false
      };
    }
    return {
      state: {
        ...timerState,
        remainingSec: nextRemaining,
        totalSec: nextTotal,
        paused: true,
        completed: false,
        endAtMs: 0
      },
      justCompleted: false
    };
  }

  const nextEndAtMs = timerState.endAtMs + delta * 1000;
  const nextRemaining = Math.max(0, Math.ceil((nextEndAtMs - nowMs) / 1000));
  if (nextRemaining <= 0) {
    return {
      state: {
        ...timerState,
        remainingSec: 0,
        paused: true,
        completed: true,
        endAtMs: nowMs
      },
      justCompleted: !timerState.completed
    };
  }
  return {
    state: {
      ...timerState,
      remainingSec: nextRemaining,
      totalSec: Math.max(timerState.totalSec, nextRemaining),
      endAtMs: nextEndAtMs,
      paused: false,
      completed: false
    },
    justCompleted: false
  };
}

export function toggleRestTimerPauseState(timerState, nowMs = Date.now()) {
  if (!timerState?.active) return timerState || createDefaultRestTimerState();
  if (timerState.paused) {
    const nextRemaining = timerState.remainingSec <= 0 ? Math.max(10, timerState.totalSec) : timerState.remainingSec;
    return {
      ...timerState,
      remainingSec: nextRemaining,
      endAtMs: nowMs + nextRemaining * 1000,
      paused: false,
      completed: false
    };
  }
  const remainingSec = Math.max(0, Math.ceil((timerState.endAtMs - nowMs) / 1000));
  return {
    ...timerState,
    remainingSec,
    endAtMs: remainingSec === 0 ? nowMs : 0,
    paused: true,
    completed: remainingSec === 0
  };
}

export function normalizeRestoredState(parsed, base) {
  const safeObj = (v, fallback) => (v && typeof v === 'object' && !Array.isArray(v) ? v : fallback);
  return {
    ...base,
    ...parsed,
    dailyLogs: safeObj(parsed.dailyLogs, {}),
    swapsBySlot: safeObj(parsed.swapsBySlot, {}),
    lastPerformance: safeObj(parsed.lastPerformance, {}),
    draftWorkouts: safeObj(parsed.draftWorkouts, {}),
    activeRestTimer: normalizeRestTimerState(parsed.activeRestTimer),
    calorieAdjustments: {
      ...base.calorieAdjustments,
      ...safeObj(parsed.calorieAdjustments, {})
    },
    workoutHistory: Array.isArray(parsed.workoutHistory) ? parsed.workoutHistory : [],
    weightLogs: Array.isArray(parsed.weightLogs) && parsed.weightLogs.length > 0 ? parsed.weightLogs : base.weightLogs,
    waistLogs: Array.isArray(parsed.waistLogs) ? parsed.waistLogs : [],
    photoLogs: Array.isArray(parsed.photoLogs) ? parsed.photoLogs : [],
    customWorkouts: safeObj(parsed.customWorkouts, null),
    activePlanVersionId: parsed.activePlanVersionId || base.activePlanVersionId,
    planVersions: Array.isArray(parsed.planVersions) && parsed.planVersions.length > 0 ? parsed.planVersions : base.planVersions
  };
}
