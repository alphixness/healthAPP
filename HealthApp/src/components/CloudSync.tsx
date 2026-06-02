import React from 'react';
import { useNutritionStore } from '../store/nutritionStore';
import { useExerciseStore } from '../store/exerciseStore';
import { syncAll } from '../services/supabaseService';

function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T | undefined>(undefined);
  React.useEffect(() => { ref.current = value; });
  return ref.current;
}

export function CloudSync({ children }: { children: React.ReactNode }) {
  const user = useNutritionStore((s) => s.user);
  const mealRecords = useNutritionStore((s) => s.mealRecords);
  const exerciseLogs = useExerciseStore((s) => s.exerciseLogs);
  const prevUser = usePrevious(user);

  React.useEffect(() => {
    if (user && prevUser === undefined) {
      syncAll(
        user as unknown as Record<string, unknown>,
        mealRecords as unknown as Record<string, unknown>[],
        exerciseLogs as unknown as Record<string, unknown>[],
      );
    }
  }, [!!user]);

  return <>{children}</>;
}
