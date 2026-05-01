import type { RunLevel, RaceGoal } from "./training";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  level: RunLevel;
  weeklyKmGoal: number;
  goalRace?: RaceGoal;
  createdAt: string;
}

export interface CoachMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
