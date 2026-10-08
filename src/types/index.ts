export interface Todo {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  timeLimit?: string; // HH:mm
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  isOverdue?: boolean;
  carriedOverFrom?: string; // previous date if auto-carried over
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  title: string;
  category: string;
  targetDate: string;
  currentProgress: number; // 0 - 100
  targetMetric?: string;
  notes?: string;
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  category: string;
  description: string;
  isFixed: boolean;
  cycleMonth: string; // YYYY-MM (calculated from 10th)
}

export interface ExpenseCategory {
  id: string;
  name: string;
  isFixed: boolean;
  color?: string;
}

export interface AutoAllocationConfig {
  monthlyIncome: number;
  fixedExpenses: {
    spayLater: number;
    laptopBill: number;
    gym: number;
  };
  remainderPercentages: {
    savings: number; // % e.g. 40
    gas: number;     // % e.g. 20
    food: number;    // % e.g. 40
  };
  lastResetCycle: string; // YYYY-MM
}

export interface GymExercise {
  id: string;
  name: string;
  targetMuscle: string;
  advancedFormCue: string;
  defaultSets: number;
  defaultReps: number;
  defaultRestSeconds: number;
}

export interface GymSetRecord {
  setNumber: number;
  reps: number;
  weightKg: number;
  completed: boolean;
}

export interface GymSessionRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  date: string;
  sets: GymSetRecord[];
  restSeconds: number;
  previousWeekReference: string; // e.g. "Minggu lalu: 3x12 @ 45kg"
  notes: string;
}

export interface TeachingSchedule {
  id: string;
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  subject: string;
  room: string;
  isPermanent: boolean;
  notes?: string;
}

export interface PomodoroSettings {
  studyMinutes: number; // e.g. 45
  workMinutes: number;  // e.g. 60
  shortBreakMinutes: number; // 5
  longBreakMinutes: number;  // 15
}

export interface AlarmItem {
  id: string;
  label: string;
  time: string; // HH:mm
  type: 'morning' | 'nap' | 'general';
  isSyncedAllDevices: boolean; // 2 HP + 1 Laptop
  enabled: boolean;
  days: string[];
}

export interface DeviceInfo {
  id: string;
  name: string;
  type: 'phone' | 'laptop';
  os: string;
  lastSync: string;
  isOnline: boolean;
  isCurrentDevice?: boolean;
}

export interface SyncConflict {
  id: string;
  entityType: 'Todo' | 'Expense' | 'Schedule' | 'Gym';
  entityId: string;
  title: string;
  versionA: {
    deviceId: string;
    deviceName: string;
    data: any;
    timestamp: string;
  };
  versionB: {
    deviceId: string;
    deviceName: string;
    data: any;
    timestamp: string;
  };
  detectedAt: string;
  resolved: boolean;
}

export interface GeminiDraft {
  intent: string;
  summary: string;
  parameters: Record<string, any>;
  hasConflict: boolean;
  conflictWarning: string;
  requiresConfirmation: boolean;
}
