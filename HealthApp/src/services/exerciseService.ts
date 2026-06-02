import { exerciseSuggestions, weeklyExercisePlans } from '../constants/mockData';

type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
type Goal = 'lose' | 'maintain' | 'gain';
type ExerciseType = 'cardio' | 'strength' | 'flexibility' | 'hiit';

export interface WorkoutExercise {
  id: string;
  name: string;
  type: string;
  icon: string;
  duration: number;
  calories: number;
}

const TYPE_ICONS: Record<string, string> = {
  cardio: '🏃',
  strength: '💪',
  flexibility: '🧘',
  hiit: '⚡',
};

const ACTIVITY_FREQUENCY: Record<ActivityLevel, number> = {
  sedentary: 3,
  light: 4,
  moderate: 5,
  active: 6,
  very_active: 7,
};

function getFocusByGoal(activityLevel: ActivityLevel, goal: Goal): { primary: ExerciseType; secondary: ExerciseType } {
  if (goal === 'lose') return { primary: 'cardio', secondary: 'hiit' };
  if (goal === 'gain') return { primary: 'strength', secondary: 'hiit' };
  // maintain
  if (activityLevel === 'sedentary' || activityLevel === 'light') return { primary: 'cardio', secondary: 'flexibility' };
  return { primary: 'strength', secondary: 'cardio' };
}

function getFocusLabel(plan: { primary: ExerciseType; secondary: ExerciseType }): string {
  const labels: Record<string, string> = {
    cardio: '有氧燃脂',
    strength: '力量增肌',
    flexibility: '柔韧恢复',
    hiit: '高效燃脂',
  };
  return `${labels[plan.primary] || plan.primary}+${labels[plan.secondary] || plan.secondary}`;
}

function mapToWorkoutExercise(suggestion: typeof exerciseSuggestions[0]): WorkoutExercise {
  const id = suggestion.name;
  return {
    id,
    name: suggestion.name,
    type: suggestion.type,
    icon: TYPE_ICONS[suggestion.type] || '🏃',
    duration: suggestion.duration,
    calories: suggestion.caloriesBurned,
  };
}

export function generateWeeklyPlan(
  activityLevel: ActivityLevel,
  goal: Goal,
): { day: string; exercises: WorkoutExercise[]; focus: string }[] {
  const frequency = ACTIVITY_FREQUENCY[activityLevel];
  const focus = getFocusByGoal(activityLevel, goal);
  const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  const cardioExercises = exerciseSuggestions.filter(e => e.type === 'cardio').map(mapToWorkoutExercise);
  const strengthExercises = exerciseSuggestions.filter(e => e.type === 'strength').map(mapToWorkoutExercise);
  const flexibilityExercises = exerciseSuggestions.filter(e => e.type === 'flexibility').map(mapToWorkoutExercise);
  const hiitExercises = exerciseSuggestions.filter(e => e.type === 'hiit').map(mapToWorkoutExercise);

  const pool: Record<string, WorkoutExercise[]> = {
    cardio: cardioExercises,
    strength: strengthExercises,
    flexibility: flexibilityExercises,
    hiit: hiitExercises,
  };

  const plan: { day: string; exercises: WorkoutExercise[]; focus: string }[] = [];

  for (let i = 0; i < 7; i++) {
    const isWorkoutDay = i < frequency;

    if (!isWorkoutDay) {
      // Rest day — light stretching
      plan.push({
        day: dayNames[i],
        exercises: flexibilityExercises.slice(0, 1),
        focus: '休息恢复',
      });
      continue;
    }

    // Generate workout day
    const dayExercises: WorkoutExercise[] = [];
    const primaryPool = pool[focus.primary];
    const secondaryPool = pool[focus.secondary];

    // Pick primary exercise (cycling through pool)
    const primaryIdx = (i * 2) % primaryPool.length;
    dayExercises.push(primaryPool[primaryIdx]);

    // Pick secondary exercise if available and different from primary
    if (secondaryPool.length > 0 && secondaryPool !== primaryPool) {
      const secIdx = (i * 3) % secondaryPool.length;
      const secExercise = secondaryPool[secIdx];
      if (secExercise.id !== primaryPool[primaryIdx].id) {
        dayExercises.push(secExercise);
      }
    }

    plan.push({
      day: dayNames[i],
      exercises: dayExercises,
      focus: getFocusLabel(focus),
    });
  }

  return plan;
}

export function getTodaysPlan(
  weeklyPlan: { day: string; exercises: WorkoutExercise[]; focus: string }[],
): { day: string; exercises: WorkoutExercise[]; focus: string } {
  const dayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  return weeklyPlan[dayIndex] || weeklyPlan[0];
}

export function getExercisePool() {
  return exerciseSuggestions;
}
