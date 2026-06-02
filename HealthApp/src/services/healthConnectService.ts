import { Platform } from 'react-native';
import { logger } from '../utils/logger';

type HealthData = {
  steps: number;
  calories: number;
  heartRate: number;
  distance: number;
};

type HealthPermission = {
  accessType: 'read';
  recordType: 'Steps' | 'HeartRate' | 'TotalCaloriesBurned' | 'Distance' | 'RestingHeartRate';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let HealthConnect: any = null;

try {
  HealthConnect = require('react-native-health-connect');
} catch {}

export async function getTodayHealthData(): Promise<HealthData> {
  const empty: HealthData = { steps: 0, calories: 0, heartRate: 0, distance: 0 };

  if (Platform.OS !== 'android' || !HealthConnect) {
    return empty;
  }

  try {
    const isAvailable = await HealthConnect.getSdkStatus();
    if (isAvailable !== 3) {
      logger.warn('Health Connect not available');
      return empty;
    }

    await HealthConnect.initialize();

    const permissions: HealthPermission[] = [
      { accessType: 'read', recordType: 'Steps' },
      { accessType: 'read', recordType: 'HeartRate' },
      { accessType: 'read', recordType: 'TotalCaloriesBurned' },
      { accessType: 'read', recordType: 'Distance' },
    ];

    const granted = await HealthConnect.requestPermission(permissions);

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const timeFilter = {
      operator: 'between' as const,
      startTime: startOfDay.toISOString(),
      endTime: now.toISOString(),
    };

    const [stepsResult, heartRateResult, caloriesResult, distanceResult] = await Promise.all([
      HealthConnect.aggregateRecord({ recordType: 'Steps', timeRangeFilter: timeFilter }),
      HealthConnect.aggregateRecord({ recordType: 'HeartRate', timeRangeFilter: timeFilter }),
      HealthConnect.aggregateRecord({ recordType: 'TotalCaloriesBurned', timeRangeFilter: timeFilter }),
      HealthConnect.aggregateRecord({ recordType: 'Distance', timeRangeFilter: timeFilter }),
    ]);

    return {
      steps: (stepsResult as { COUNT_TOTAL?: number })?.COUNT_TOTAL ?? 0,
      heartRate: Math.round((heartRateResult as { BPM_AVG?: number })?.BPM_AVG ?? 0),
      calories: Math.round(
        (caloriesResult as { ENERGY_TOTAL?: { inCalories?: number } })?.ENERGY_TOTAL?.inCalories ?? 0,
      ),
      distance: Math.round(
        (distanceResult as { DISTANCE?: { inMeters?: number } })?.DISTANCE?.inMeters ?? 0,
      ),
    };
  } catch (error) {
    logger.warn('Health Connect error:', error);
    return empty;
  }
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${meters}m`;
}
