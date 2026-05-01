export type RunLevel = "beginner" | "intermediate" | "advanced";
export type RaceGoal = "5k" | "10k" | "half" | "marathon";
export type WorkoutType = "easy" | "tempo" | "interval" | "long" | "rest" | "cross";

export interface WorkoutSession {
  id: string;
  date: string;
  type: WorkoutType;
  distanceKm: number;
  durationMin: number;
  paceMinKm: number;
  heartRateAvg?: number;
  notes?: string;
  completed: boolean;
}

export interface TrainingWeek {
  weekNumber: number;
  startDate: string;
  totalKm: number;
  sessions: WorkoutSession[];
}

export interface TrainingPlan {
  id: string;
  userId: string;
  level: RunLevel;
  goalRace?: RaceGoal;
  startDate: string;
  endDate: string;
  weeks: TrainingWeek[];
}
