export const PLAN_CONFIG = {
  startDate: '2026-11-24',
  endDate: '2027-02-22',
  totalDays: 90,
  profile: {
    height: `6'1"`,
    startWeight: 185,
    targetWeightMin: 173,
    targetWeightMax: 177,
    waistTarget: '-1.5 to 2.5"',
    sessionCapMin: 60,
    stepsTarget: '8,000–10,000',
    sleepTarget: '7–8 hrs',
    waterTarget: '3–4 L',
    fiberTarget: '30–35 g'
  },
  strengthTargets: {
    bench: { key: 'bench', label: 'Bench Press', repLabel: '5–8 reps', baseline: 135, targetMin: 155, targetMax: 165, stretch: 175, unit: 'lbs' },
    squat: { key: 'squat', label: 'Back Squat', repLabel: '5–8 reps', baseline: 225, targetMin: 245, targetMax: 265, stretch: null, unit: 'lbs' },
    deadlift: { key: 'deadlift', label: 'Deadlift', repLabel: '5 reps', baseline: 315, targetMin: 335, targetMax: 355, stretch: null, unit: 'lbs' },
    pullups: { key: 'pullups', label: 'Strict Pull-Ups', repLabel: '1 AMRAP set', baseline: 4, targetMin: 8, targetMax: 10, stretch: null, unit: 'reps' }
  }
};

export const PHASES = {
  phase1: {
    id: 'phase1',
    label: 'Phase 1',
    range: 'Weeks 1–6 (Nov 24 – Jan 4)',
    summary: 'Clean straight sets at 1–2 RIR. Lock in form, calorie cycling, and double progression.'
  },
  deload: {
    id: 'deload',
    label: 'Wk 7 Deload',
    range: 'Week 7 (Jan 5 – Jan 11)',
    summary: 'Cut working sets in half (~2 sets), drop weights ~10%, eat at maintenance (~2,650–2,750 kcal).'
  },
  phase2: {
    id: 'phase2',
    label: 'Phase 2',
    range: 'Weeks 8–13 (Jan 12 – Feb 22)',
    summary: 'Full volume + Lengthened Partials & Rest-Pause finishers. Wks 10–13 add +1 set on delts & arms.'
  }
};

export const NUTRITION = {
  meals: [
    { id: 'm1', title: 'Meal 1', target: '40–45g Protein', timing: 'Before 1:00 PM', detail: 'Front-load morning protein + fiber' },
    { id: 'm2', title: 'Meal 2', target: '40g Protein + 12–15g Fiber', timing: 'Before 1:00 PM', detail: 'Hit 75–85g protein across M1 & M2' },
    { id: 'm3', title: 'Meal 3 (Post-WO / Dinner)', target: '55–65g Protein', timing: '60–70% carbs ±2h lifting', detail: 'Fuel workout & recovery window' },
    { id: 'm4', title: 'Meal 4 (Pre-Sleep Anchor)', target: '35–40g Protein', timing: '60–90 min before bed', detail: 'Casein, cottage cheese, or Greek yogurt' }
  ],
  habits: [
    { id: 'steps', label: '8,000–10,000 Steps + 10m AM Walk', meta: 'NEAT & recovery' },
    { id: 'sleep', label: '7–8 Hours Sleep', meta: 'Muscle retention & strength' },
    { id: 'water', label: '3–4L Water + Electrolytes', meta: 'AM sodium + potassium' },
    { id: 'fiber', label: '30–35g Fiber', meta: '12–15g before 1 PM' },
    { id: 'creatine', label: '5g Creatine Monohydrate', meta: 'Daily saturation' },
    { id: 'caffeine', label: 'No Caffeine After 2:00 PM (Evening Lift = Electrolytes)', meta: 'Protects 7–8h sleep for 5–8 PM sessions' }
  ],
  takeoutPlaybook: [
    {
      name: 'Chipotle / Bowl Spots (Double Meat)',
      kcal: '620–720',
      protein: '55–65g P',
      notes: 'Double chicken or steak, light/half rice (full rice on lifting evenings), fajita veggies, black beans, salsa. Skip queso & sour cream.'
    },
    {
      name: 'Sweetgreen / Cava Salad & Grain Bowls',
      kcal: '550–650',
      protein: '45–55g P',
      notes: 'Double grilled/harissa chicken, greens + half grains, roasted veggies, dressing on the side.'
    },
    {
      name: 'Panda Express / Asian Grill',
      kcal: '580–680',
      protein: '48–55g P',
      notes: 'Double Grilled Teriyaki Chicken (sauce on side) or String Bean Chicken over steamed veggies (half rice on lifting evenings).'
    },
    {
      name: 'Poke / Sushi Bowls',
      kcal: '550–650',
      protein: '45–50g P',
      notes: 'Double salmon/tuna poke over greens + half rice, or sashimi + edamame + 1 simple roll. Easy on spicy mayo/crispy onions.'
    }
  ],
  sampleMeals: [
    {
      name: 'Greek Yogurt Berry Bowl',
      kcal: 430,
      protein: 45,
      prep: '5 min',
      notes: '1.5 cups plain nonfat Greek yogurt + 1 scoop whey + mixed berries + sliced almonds + light honey drizzle.'
    },
    {
      name: 'Chicken Quinoa Power Bowl',
      kcal: 560,
      protein: 52,
      prep: '25 min',
      notes: '6 oz grilled chicken breast over quinoa, spinach, cherry tomatoes, cucumber, avocado, lemon. (Shortcut: microwave quinoa + rotisserie chicken).'
    },
    {
      name: 'Post-Workout Beef or Chicken Rice Bowl',
      kcal: 680,
      protein: 50,
      prep: '10 min',
      notes: '6 oz 93/7 ground beef or chicken breast + 1.5 cups jasmine rice + light soy/sriracha + banana or pineapple (~85g carbs).'
    },
    {
      name: 'Sheet-Pan Teriyaki Salmon & Broccoli',
      kcal: 590,
      protein: 44,
      prep: '20 min bake',
      notes: '6 oz wild salmon + broccoli florets brushed with light soy-ginger glaze & olive oil, roast 400°F (200°C) for 14–16 min.'
    },
    {
      name: 'Pre-Sleep Cottage Cheese / Casein Bowl (Meal 4)',
      kcal: 280,
      protein: 38,
      prep: '3 min',
      notes: '1.5 cups low-fat cottage cheese (or 1.5 scoops casein mixed thick) + cinnamon + berries.'
    }
  ],
  holidayRules: [
    'Calorie Banking: Trim 150–200 kcal of carbs/fats for 2–3 days before a big dinner to bank a +450–600 kcal buffer.',
    'Plate Rule Step 1: Fill half the plate with lean protein first (turkey breast, roast beef, shrimp, salmon).',
    'Plate Rule Step 2: Fill the other half with fibrous vegetables/salad before touching starches or desserts.',
    'Alcohol Cap: Max 1–2 drinks (clear spirits + soda water or dry wine); skip sugary cocktails.'
  ]
};

export const WORKOUTS = {
  upperA: {
    id: 'upperA',
    shortName: 'Upper A',
    dayLabel: 'Day 1: Upper A',
    estMinutes: '52–55 min',
    focus: 'Strength, Chest, Back & Arms',
    hasShoulderPrehab: true,
    rirDefault: '1–2',
    exercises: [
      {
        id: 'ua_bench',
        name: 'Flat Barbell Bench Press',
        sets: 3,
        repMin: 5,
        repMax: 8,
        restSec: 165,
        restLabel: '2.5–3 min',
        isCompound: true,
        isBarbell: true,
        big3Key: 'bench',
        rampUp: true,
        leftFirst: false,
        superset: null,
        phase2Cue: null,
        bonusWk10Set: false,
        defaultWeight: 135,
        note: 'Primary anchor lift. Retract & depress scapulae, subtle arch, drive heels.',
        swaps: ['Flat Barbell Bench Press', 'Dumbbell Bench Press (Left arm rules)', 'Machine Chest Press']
      },
      {
        id: 'ua_row',
        name: 'Single-Arm Dumbbell Row',
        sets: 3,
        repMin: 8,
        repMax: 10,
        restSec: 105,
        restLabel: '90–120s',
        isCompound: true,
        isBarbell: false,
        big3Key: null,
        rampUp: false,
        leftFirst: true,
        superset: null,
        phase2Cue: null,
        bonusWk10Set: false,
        defaultWeight: 55,
        note: 'Use lifting straps if grip limits back tension.',
        swaps: ['Single-Arm Dumbbell Row', 'Chest-Supported Row', 'Seated Cable Row', 'Machine Row']
      },
      {
        id: 'ua_incline_db',
        name: 'Incline Dumbbell Press (30° bench)',
        sets: 3,
        repMin: 8,
        repMax: 12,
        restSec: 90,
        restLabel: '90s',
        isCompound: true,
        isBarbell: false,
        big3Key: null,
        rampUp: false,
        leftFirst: true,
        superset: null,
        phase2Cue: 'Lengthened Partials: On final set, hit failure then do 3–4 bottom half-reps.',
        bonusWk10Set: false,
        defaultWeight: 45,
        note: '30° bench angle for upper chest & shoulder comfort.',
        swaps: ['Incline Dumbbell Press (30° bench)', 'Smith Machine Incline Press', 'Machine Incline Chest Press']
      },
      {
        id: 'ua_lat_pull',
        name: 'Wide-Grip Lat Pulldown',
        sets: 3,
        repMin: 10,
        repMax: 12,
        restSec: 90,
        restLabel: '90s',
        isCompound: true,
        isBarbell: false,
        big3Key: null,
        rampUp: false,
        leftFirst: false,
        superset: null,
        phase2Cue: null,
        bonusWk10Set: false,
        defaultWeight: 120,
        note: 'Use straps on heavy sets.',
        swaps: ['Wide-Grip Lat Pulldown', 'Assisted Pull-Up Machine', 'Neutral-Grip Lat Pulldown']
      },
      {
        id: 'ua_lat_raise',
        name: 'Single-Arm Cable Lateral Raise',
        sets: 3,
        repMin: 12,
        repMax: 15,
        restSec: 60,
        restLabel: '60s',
        isCompound: false,
        isBarbell: false,
        big3Key: null,
        rampUp: false,
        leftFirst: true,
        superset: 'A1',
        phase2Cue: 'Lengthened Partials: 3–4 bottom half-reps past failure on final set.',
        bonusWk10Set: true,
        defaultWeight: 15,
        note: 'Superset A1 with Cable Face Pull.',
        swaps: ['Single-Arm Cable Lateral Raise', 'Dumbbell Lateral Raise']
      },
      {
        id: 'ua_face_pull',
        name: 'Cable Face Pull',
        sets: 3,
        repMin: 12,
        repMax: 15,
        restSec: 60,
        restLabel: '60s',
        isCompound: false,
        isBarbell: false,
        big3Key: null,
        rampUp: false,
        leftFirst: false,
        superset: 'A2',
        phase2Cue: null,
        bonusWk10Set: true,
        defaultWeight: 40,
        note: 'Superset A2. External rotation at end range for rotator cuff health.',
        swaps: ['Cable Face Pull', 'Reverse Pec Deck', 'Rear-Delt Dumbbell Fly']
      },
      {
        id: 'ua_pushdown',
        name: 'Cable Tricep Pushdown',
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
        superset: 'B1',
        phase2Cue: 'Rest-Pause: On final set, hit failure, rest 15s, squeeze 3–5 more reps.',
        bonusWk10Set: true,
        defaultWeight: 50,
        note: 'Single-Rope, V-Bar, or Single-Arm Cross-Body. NO skullcrushers.',
        swaps: ['Cable Tricep Pushdown (Rope/V-Bar)', 'Single-Arm Cross-Body Cable Pushdown']
      },
      {
        id: 'ua_hammer',
        name: 'Dumbbell Hammer Curl',
        sets: 3,
        repMin: 10,
        repMax: 12,
        restSec: 60,
        restLabel: '60s',
        isCompound: false,
        isBarbell: false,
        big3Key: null,
        rampUp: false,
        leftFirst: true,
        superset: 'B2',
        phase2Cue: null,
        bonusWk10Set: true,
        defaultWeight: 25,
        note: 'Superset B2. Left arm sets the rep cap.',
        swaps: ['Dumbbell Hammer Curl', 'Rope Cable Hammer Curl']
      }
    ]
  },

  lowerA: {
    id: 'lowerA',
    shortName: 'Lower A',
    dayLabel: 'Day 2: Lower A',
    estMinutes: '50–52 min',
    focus: 'Squat, Quads & Weighted Abs',
    hasShoulderPrehab: false,
    rirDefault: '1–2',
    exercises: [
      {
        id: 'la_squat',
        name: 'Barbell Back Squat',
        sets: 3,
        repMin: 5,
        repMax: 8,
        restSec: 165,
        restLabel: '2.5–3 min',
        isCompound: true,
        isBarbell: true,
        big3Key: 'squat',
        rampUp: true,
        leftFirst: false,
        superset: null,
        phase2Cue: null,
        bonusWk10Set: false,
        defaultWeight: 225,
        note: 'Primary squat anchor.',
        swaps: ['Barbell Back Squat', '45° Leg Press', 'Hack Squat', 'Smith Machine Squat']
      },
      {
        id: 'la_rdl',
        name: 'Romanian Deadlift (BB or DB)',
        sets: 3,
        repMin: 8,
        repMax: 10,
        restSec: 120,
        restLabel: '2 min',
        isCompound: true,
        isBarbell: true,
        big3Key: null,
        rampUp: false,
        leftFirst: false,
        superset: null,
        phase2Cue: null,
        bonusWk10Set: false,
        defaultWeight: 185,
        note: 'Use lifting straps so grip never limits hamstring tension.',
        swaps: ['Romanian Deadlift (Barbell)', 'Dumbbell RDL', '45° Weighted Back Extension', 'Cable Pull-Through']
      },
      {
        id: 'la_legpress',
        name: '45° Leg Press (feet low)',
        sets: 3,
        repMin: 8,
        repMax: 12,
        restSec: 105,
        restLabel: '90–120s',
        isCompound: true,
        isBarbell: false,
        big3Key: null,
        rampUp: false,
        leftFirst: false,
        superset: null,
        phase2Cue: null,
        bonusWk10Set: false,
        defaultWeight: 270,
        note: 'Low foot placement biases quads.',
        swaps: ['45° Leg Press (feet low)', 'Hack Squat', 'Smith Machine Squat', 'DB Bulgarian Split Squat']
      },
      {
        id: 'la_legcurl',
        name: 'Seated Leg Curl',
        sets: 3,
        repMin: 10,
        repMax: 12,
        restSec: 80,
        restLabel: '75–90s',
        isCompound: false,
        isBarbell: false,
        big3Key: null,
        rampUp: false,
        leftFirst: false,
        superset: null,
        phase2Cue: 'Lengthened Partials: 3–4 top/stretched half-reps past failure on final set.',
        bonusWk10Set: false,
        defaultWeight: 110,
        note: 'Lean slightly forward for deeper hamstring stretch.',
        swaps: ['Seated Leg Curl', 'Lying Leg Curl']
      },
      {
        id: 'la_calf',
        name: 'Standing Calf Raise',
        sets: 3,
        repMin: 12,
        repMax: 15,
        restSec: 60,
        restLabel: '60s',
        isCompound: false,
        isBarbell: false,
        big3Key: null,
        rampUp: false,
        leftFirst: false,
        superset: 'A1',
        phase2Cue: null,
        bonusWk10Set: false,
        defaultWeight: 135,
        note: 'Superset A1. Pause 1–2s in the bottom stretch.',
        swaps: ['Standing Calf Raise', 'Straight-Leg Calf Press (45° Leg Press)', 'Seated Calf Raise']
      },
      {
        id: 'la_abs',
        name: 'Hanging Leg Raise',
        sets: 3,
        repMin: 10,
        repMax: 15,
        restSec: 60,
        restLabel: '60s',
        isCompound: false,
        isBarbell: false,
        big3Key: null,
        rampUp: false,
        leftFirst: false,
        superset: 'A2',
        phase2Cue: null,
        bonusWk10Set: false,
        defaultWeight: 0,
        note: 'Superset A2. Curl pelvis upward, avoid swinging.',
        swaps: ['Hanging Leg Raise', "Captain's Chair Leg/Knee Raise"]
      }
    ]
  },

  upperB: {
    id: 'upperB',
    shortName: 'Upper B',
    dayLabel: 'Day 4: Upper B',
    estMinutes: '50–53 min',
    focus: 'Shoulders, Upper Chest, Back Width & Arms',
    hasShoulderPrehab: true,
    rirDefault: '1–2',
    exercises: [
      {
        id: 'ub_pullups',
        name: 'Strict Pull-Ups (AMRAP Test Set)',
        sets: 1,
        repMin: 3,
        repMax: 10,
        restSec: 120,
        restLabel: '2 min',
        isCompound: true,
        isBarbell: false,
        big3Key: 'pullups',
        isRepMaxGoal: true,
        rampUp: false,
        leftFirst: false,
        superset: null,
        phase2Cue: null,
        bonusWk10Set: false,
        defaultWeight: 0,
        note: '1 fresh strict set at 1–2 RIR before pulldowns (goal: 8–10 strict reps).',
        swaps: ['Strict Pull-Ups (AMRAP Test Set)', 'Negative / Eccentric Pull-Ups', 'Assisted Pull-Up Machine']
      },
      {
        id: 'ub_ohp',
        name: 'Seated DB Overhead Press (30° elbows)',
        sets: 3,
        repMin: 6,
        repMax: 8,
        restSec: 135,
        restLabel: '2–2.5 min',
        isCompound: true,
        isBarbell: false,
        big3Key: null,
        rampUp: true,
        leftFirst: true,
        superset: null,
        phase2Cue: null,
        bonusWk10Set: false,
        defaultWeight: 45,
        note: 'Elbows ~30° forward in scapular plane: rotator-cuff friendly & fixes L/R imbalance.',
        swaps: ['Seated DB Overhead Press (30° elbows)', 'Machine Shoulder Press', 'High-Incline DB Press (60°)']
      },
      {
        id: 'ub_neutral_pull',
        name: 'Neutral-Grip Lat Pulldown',
        sets: 3,
        repMin: 8,
        repMax: 10,
        restSec: 120,
        restLabel: '2 min',
        isCompound: true,
        isBarbell: false,
        big3Key: null,
        rampUp: false,
        leftFirst: false,
        superset: null,
        phase2Cue: null,
        bonusWk10Set: false,
        defaultWeight: 130,
        note: 'Builds toward strict pull-ups (5+ reps). Use straps if needed.',
        swaps: ['Neutral-Grip Lat Pulldown', 'Assisted Pull-Up Machine', 'Wide-Grip Lat Pulldown']
      },
      {
        id: 'ub_smith_incline',
        name: 'Smith Machine Incline Press (30°)',
        sets: 3,
        repMin: 8,
        repMax: 10,
        restSec: 105,
        restLabel: '90–120s',
        isCompound: true,
        isBarbell: false,
        big3Key: null,
        rampUp: false,
        leftFirst: false,
        superset: null,
        phase2Cue: null,
        bonusWk10Set: false,
        defaultWeight: 115,
        note: 'Upper chest focus.',
        swaps: ['Smith Machine Incline Press (30°)', 'Barbell Incline Bench Press', 'Converging Incline Chest Press Machine']
      },
      {
        id: 'ub_cable_row',
        name: 'Wide-Grip Seated Cable Row',
        sets: 3,
        repMin: 8,
        repMax: 10,
        restSec: 90,
        restLabel: '90s',
        isCompound: true,
        isBarbell: false,
        big3Key: null,
        rampUp: false,
        leftFirst: false,
        superset: null,
        phase2Cue: null,
        bonusWk10Set: false,
        defaultWeight: 120,
        note: 'Use straps on heavy sets.',
        swaps: ['Wide-Grip Seated Cable Row', '30° Incline Bench DB Row', 'Chest-Supported Machine Row']
      },
      {
        id: 'ub_db_lat',
        name: 'Dumbbell Lateral Raise',
        sets: 3,
        repMin: 12,
        repMax: 15,
        restSec: 60,
        restLabel: '60s',
        isCompound: false,
        isBarbell: false,
        big3Key: null,
        rampUp: false,
        leftFirst: false,
        superset: 'A1',
        phase2Cue: 'Rest-Pause: Final set to failure, rest 15s, squeeze 3–5 more reps.',
        bonusWk10Set: true,
        defaultWeight: 17.5,
        note: 'Superset A1. Slight lean forward, lead with elbows.',
        swaps: ['Dumbbell Lateral Raise', 'Single-Arm Cable Lateral Raise']
      },
      {
        id: 'ub_rev_pec',
        name: 'Reverse Pec Deck',
        sets: 3,
        repMin: 12,
        repMax: 15,
        restSec: 60,
        restLabel: '60s',
        isCompound: false,
        isBarbell: false,
        big3Key: null,
        rampUp: false,
        leftFirst: false,
        superset: 'A2',
        phase2Cue: null,
        bonusWk10Set: true,
        defaultWeight: 85,
        note: 'Superset A2. Keep traps relaxed, sweep out wide.',
        swaps: ['Reverse Pec Deck', 'Cable Face Pull', 'Rear-Delt Dumbbell Fly']
      },
      {
        id: 'ub_inc_curl',
        name: 'Incline Dumbbell Curl',
        sets: 3,
        repMin: 10,
        repMax: 12,
        restSec: 60,
        restLabel: '60s',
        isCompound: false,
        isBarbell: false,
        big3Key: null,
        rampUp: false,
        leftFirst: true,
        superset: 'B1',
        phase2Cue: null,
        bonusWk10Set: true,
        defaultWeight: 22.5,
        note: 'Superset B1. Left arm first; keep elbows back.',
        swaps: ['Incline Dumbbell Curl', 'Bayesian Face-Away Cable Curl']
      },
      {
        id: 'ub_oh_ext',
        name: 'Overhead Cable Tricep Extension',
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
        superset: 'B2',
        phase2Cue: 'Lengthened Partials: 3–4 stretched half-reps past failure on final set.',
        bonusWk10Set: true,
        defaultWeight: 45,
        note: 'Superset B2. Elbow-friendly long-head stretch. NO skullcrushers.',
        swaps: ['Overhead Cable Tricep Extension', 'Single-Arm Overhead DB Extension']
      }
    ]
  },

  lowerB: {
    id: 'lowerB',
    shortName: 'Lower B',
    dayLabel: 'Day 5: Lower B',
    estMinutes: '~54 min incl. cardio',
    focus: 'Posterior Chain, Core & Conditioning',
    hasShoulderPrehab: false,
    rirDefault: '1–2',
    conditioning: {
      title: 'Conditioning Finisher: 15 min Incline Treadmill Walk',
      detail: '10% incline @ 3.2 mph',
      swap: 'If steps are hit outside gym: swap for 2 × 8–10/leg DB Bulgarian Split Squats.'
    },
    exercises: [
      {
        id: 'lb_deadlift',
        name: 'Conventional Deadlift',
        sets: 3,
        repMin: 5,
        repMax: 5,
        restSec: 165,
        restLabel: '2.5–3 min',
        isCompound: true,
        isBarbell: true,
        big3Key: 'deadlift',
        rampUp: true,
        leftFirst: false,
        superset: null,
        phase2Cue: null,
        bonusWk10Set: false,
        defaultWeight: 315,
        note: 'Reset each rep cleanly, brace hard.',
        swaps: ['Conventional Deadlift', 'Trap-Bar Deadlift', 'Barbell/DB RDL (3×8)']
      },
      {
        id: 'lb_legext',
        name: 'Leg Extension',
        sets: 3,
        repMin: 12,
        repMax: 15,
        restSec: 75,
        restLabel: '75s',
        isCompound: false,
        isBarbell: false,
        big3Key: null,
        rampUp: false,
        leftFirst: false,
        superset: null,
        phase2Cue: 'Rest-Pause: Final set to failure, rest 15s, squeeze 3–5 more reps.',
        bonusWk10Set: false,
        defaultWeight: 130,
        note: 'Control the eccentric for 2 seconds.',
        swaps: ['Leg Extension', 'Walking Dumbbell Lunges']
      },
      {
        id: 'lb_lying_curl',
        name: 'Lying Leg Curl',
        sets: 3,
        repMin: 10,
        repMax: 12,
        restSec: 75,
        restLabel: '75s',
        isCompound: false,
        isBarbell: false,
        big3Key: null,
        rampUp: false,
        leftFirst: false,
        superset: null,
        phase2Cue: null,
        bonusWk10Set: false,
        defaultWeight: 95,
        note: 'Keep hips pressed into pad.',
        swaps: ['Lying Leg Curl', 'Seated Leg Curl']
      },
      {
        id: 'lb_calf',
        name: 'Standing or Leg-Press Calf Raise',
        sets: 3,
        repMin: 12,
        repMax: 15,
        restSec: 60,
        restLabel: '60s',
        isCompound: false,
        isBarbell: false,
        big3Key: null,
        rampUp: false,
        leftFirst: false,
        superset: 'A1',
        phase2Cue: null,
        bonusWk10Set: false,
        defaultWeight: 135,
        note: 'Superset A1.',
        swaps: ['Standing Calf Raise', 'Leg-Press Calf Raise', 'Smith Machine Calf Raise']
      },
      {
        id: 'lb_crunch',
        name: 'Kneeling Cable Crunch',
        sets: 3,
        repMin: 10,
        repMax: 15,
        restSec: 60,
        restLabel: '60s',
        isCompound: false,
        isBarbell: false,
        big3Key: null,
        rampUp: false,
        leftFirst: false,
        superset: 'A2',
        phase2Cue: null,
        bonusWk10Set: false,
        defaultWeight: 70,
        note: 'Superset A2. Flex spine downward, keep hips stationary.',
        swaps: ['Kneeling Cable Crunch', 'Ab Crunch Machine', 'Decline Weighted Crunch']
      }
    ]
  },

  day5: {
    id: 'day5',
    shortName: 'Opt. Day 5',
    dayLabel: 'Day 5 Opt: Aesthetic Pump',
    estMinutes: '38–42 min',
    focus: 'Upper Chest, Capped Delts, Arms & Back Width (2 RIR Cap)',
    hasShoulderPrehab: true,
    rirDefault: '2',
    isOptionalPumpDay: true,
    exercises: [
      {
        id: 'd5_fly',
        name: 'Incline Cable Chest Fly',
        sets: 3,
        repMin: 12,
        repMax: 15,
        restSec: 65,
        restLabel: '60–75s',
        isCompound: false,
        isBarbell: false,
        big3Key: null,
        rampUp: false,
        leftFirst: false,
        superset: null,
        phase2Cue: null,
        bonusWk10Set: false,
        defaultWeight: 25,
        note: 'Capped at 2 RIR (no failure) so Monday Bench stays 100% fresh.',
        swaps: ['Incline Cable Chest Fly', 'Pec Deck Machine Fly', 'Incline Dumbbell Fly']
      },
      {
        id: 'd5_pull',
        name: 'Neutral-Grip Lat Pulldown',
        sets: 3,
        repMin: 10,
        repMax: 12,
        restSec: 90,
        restLabel: '90s',
        isCompound: true,
        isBarbell: false,
        big3Key: null,
        rampUp: false,
        leftFirst: false,
        superset: null,
        phase2Cue: null,
        bonusWk10Set: false,
        defaultWeight: 120,
        note: 'Zero heavy spinal loading; smooth controlled reps at 2 RIR.',
        swaps: ['Neutral-Grip Lat Pulldown', 'Assisted Pull-Up Machine', 'Single-Arm Kneeling Lat Pulldown']
      },
      {
        id: 'd5_lat_raise',
        name: 'Dumbbell Lateral Raise',
        sets: 4,
        repMin: 12,
        repMax: 15,
        restSec: 60,
        restLabel: '60s',
        isCompound: false,
        isBarbell: false,
        big3Key: null,
        rampUp: false,
        leftFirst: false,
        superset: 'A1',
        phase2Cue: null,
        bonusWk10Set: true,
        defaultWeight: 17.5,
        note: 'Superset A1. 4 sets for capped side delts (stop at 2 RIR).',
        swaps: ['Dumbbell Lateral Raise', 'Single-Arm Cable Lateral Raise']
      },
      {
        id: 'd5_face_pull',
        name: 'Cable Face Pull',
        sets: 3,
        repMin: 12,
        repMax: 15,
        restSec: 60,
        restLabel: '60s',
        isCompound: false,
        isBarbell: false,
        big3Key: null,
        rampUp: false,
        leftFirst: false,
        superset: 'A2',
        phase2Cue: null,
        bonusWk10Set: true,
        defaultWeight: 40,
        note: 'Superset A2.',
        swaps: ['Cable Face Pull', 'Reverse Pec Deck']
      },
      {
        id: 'd5_curl',
        name: 'Incline Dumbbell Curl',
        sets: 3,
        repMin: 10,
        repMax: 12,
        restSec: 60,
        restLabel: '60s',
        isCompound: false,
        isBarbell: false,
        big3Key: null,
        rampUp: false,
        leftFirst: true,
        superset: 'B1',
        phase2Cue: null,
        bonusWk10Set: true,
        defaultWeight: 22.5,
        note: 'Superset B1. Left arm first.',
        swaps: ['Incline Dumbbell Curl', 'EZ-Bar Curl', 'Bayesian Cable Curl']
      },
      {
        id: 'd5_pushdown',
        name: 'Single-Arm Cable Tricep Pushdown',
        sets: 3,
        repMin: 10,
        repMax: 12,
        restSec: 60,
        restLabel: '60s',
        isCompound: false,
        isBarbell: false,
        big3Key: null,
        rampUp: false,
        leftFirst: true,
        superset: 'B2',
        phase2Cue: null,
        bonusWk10Set: true,
        defaultWeight: 20,
        note: 'Superset B2. Left arm first. NO skullcrushers.',
        swaps: ['Single-Arm Cable Tricep Pushdown', 'Rope Cable Pushdown', 'Overhead Cable Tricep Extension']
      }
    ]
  }
};

export const FULL_PLAN_MARKDOWN = `# 90-Day Body Recomposition & Aesthetic Plan

## Profile & Baseline
- Stats: 6'1", 185 lbs (34.0" starting waist placeholder)
- Current Lifts: Bench Press (~135 lbs), Squat (~225 lbs), Deadlift (~315 lbs), Pull-Ups (<5 strict)
- Schedule & Lift Window: Flexible rolling schedule (4-day base + optional 5th day), typically after work / evening (5:00-8:00 PM)
- Gym Equipment: Smallest barbell plates are 5 lbs (+10 lb total barbell jumps); small DBs/cables support 2.5 lb jumps
- Joint & Balance Notes: Slight right rotator cuff tightness, slight right-side strength dominance, NO skullcrushers
- Daily Targets: 8,000-10,000 steps/day, 7-8h sleep, 40-55 min sessions (<1 hr cap)

## Part 1: Nutrition & Calorie Cycling (Avg ~2,330-2,400 kcal/day)
- Lifting Days (4-5/wk): 2,500-2,550 kcal | 180-185g P | 65-70g F | 285-305g C
- Rest Days (2-3/wk): 2,050-2,100 kcal | 180-185g P | 65-70g F | 175-195g C (Tighter hunger option: 2,450 / 2,200)
- 4-Meal Protein Bolus: Meal 1 & 2 before 1 PM (75-85g P + 12-15g fiber), Meal 3 dinner/5-8 PM (55-65g P + 60-70% carbs), Meal 4 pre-sleep (35-40g casein/cottage cheese/Greek yogurt)
- Takeout Playbook: Double lean meat, sauces/dressings on side, veggies first (Chipotle, Sweetgreen/Cava, Panda Express, Poke/Sushi)
- Holiday 3-Plate Rule + Banking: Trim 150-200 kcal 2-3 days prior (+450-600 kcal buffer); half plate lean protein, half veggies; max 1-2 clear/dry drinks
- Supplements: Creatine 5g/day; Caffeine <2 PM only (use non-stim electrolytes for 5-8 PM lifts)

## Part 2: Training Execution Rules
- 2-Min Shoulder Prehab (Upper Days): 1-2x12-15/side external rotations + 15 band pull-aparts
- Unilateral Left-First Rule: Always start with LEFT arm and stop right arm at exact same reps
- 5-Min Compound Ramp-Up: Bar/light x 10 -> 50% x 5 -> 75% x 3 -> 90% x 1
- Double Progression: Hit repMax across all sets at 1-2 RIR -> +10 lb Barbells / +5 lb Compounds / +2.5 lb Isolations
- Phase 2 Intensifiers (Wks 8-13): Lengthened partials (3-4 bottom half-reps past failure) + Rest-Pause (15s rest + 3-5 reps)

## Part 3: 4-Day Upper/Lower Base Split + Optional 5th Day
- Upper A (~52-55m): Flat BB Bench 3x5-8 | 1-Arm DB Row 3x8-10 | 30° Incline DB Press 3x8-12 | Wide Lat Pulldown 3x10-12 | SS A: Cable Lat Raise + Face Pull 3x12-15 | SS B: Cable Pushdown + DB Hammer Curl 3x10-12
- Lower A (~50-52m): Back Squat 3x5-8 | RDL 3x8-10 | 45° Leg Press 3x8-12 | Seated Leg Curl 3x10-12 | SS A: Standing Calf 3x12-15 + Hanging Leg Raise 3x10-15
- Upper B (~50-53m): Strict Pull-Ups 1xAMRAP | Seated DB OHP 3x6-8 | Neutral Lat Pulldown 3x8-10 | Smith Incline 3x8-10 | Wide Cable Row 3x8-10 | SS A: DB Lat Raise + Rev Pec Deck 3x12-15 | SS B: Incline DB Curl + OH Cable Ext 3x10-12
- Lower B (~54m): Deadlift 3x5 | Leg Ext 3x12-15 | Lying Leg Curl 3x10-12 | SS A: Calf Raise 3x12-15 + Cable Crunch 3x10-15 | 15m Incline Walk (10% @ 3.2 mph)
- Opt. Day 5 (~38-42m, 2 RIR cap): Incline Cable Fly 3x12-15 | Neutral Pulldown 3x10-12 | SS A: DB Lat Raise 4x12-15 + Face Pull 3x12-15 | SS B: Incline Curl + 1-Arm Pushdown 3x10-12

## Part 5: 90-Day Milestones & Biweekly Rules (Through Feb 22, 2027)
- Phase 1 (Wks 1-6): Straight sets 1-2 RIR
- Mandatory Deload (Wk 7): Half sets, -10% load, maintenance (~2,650-2,750 kcal)
- Phase 2 (Wks 8-13): Full volume + finishers; Wks 10-13 add +1 set delts & arms
- Targets: 173-177 lbs (-1.5 to 2.5" waist) | Pull-Ups 8-10 strict | Bench 155-165 (175 stretch) | Squat 245-265 | Deadlift 335-355
- Biweekly Rules: Ignore scale Wks 1-3 (creatine); >1.2 lb/wk loss + stall -> +150 kcal lifting carbs; 2-wk flat after Wk 3 -> -150 kcal rest days or +1,500 steps`;
