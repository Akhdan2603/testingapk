import {
  Todo,
  Goal,
  Expense,
  ExpenseCategory,
  AutoAllocationConfig,
  GymExercise,
  GymSessionRecord,
  TeachingSchedule,
  PomodoroSettings,
  AlarmItem,
  DeviceInfo,
  SyncConflict,
} from '../types';

const STORAGE_KEYS = {
  TODOS: 'sanctuary_todos',
  GOALS: 'sanctuary_goals',
  EXPENSES: 'sanctuary_expenses',
  CATEGORIES: 'sanctuary_categories',
  ALLOCATION: 'sanctuary_allocation',
  GYM_EXERCISES: 'sanctuary_gym_exercises',
  GYM_SESSIONS: 'sanctuary_gym_sessions',
  SCHEDULES: 'sanctuary_schedules',
  POMODORO: 'sanctuary_pomodoro',
  ALARMS: 'sanctuary_alarms',
  DEVICES: 'sanctuary_devices',
  CONFLICTS: 'sanctuary_conflicts',
};

// Pre-loaded gym routines explicitly requested in the PDF
export const PRELOADED_GYM_EXERCISES: GymExercise[] = [
  {
    id: 'gym-1',
    name: 'Seated Calf Raise',
    targetMuscle: 'Soleus',
    advancedFormCue: 'Regangan maksimal di soleus: Tahan 2 detik di bagian paling bawah regangan tanpa memantul, lalu kontraksikan penuh 1 detik di puncak.',
    defaultSets: 4,
    defaultReps: 15,
    defaultRestSeconds: 60,
  },
  {
    id: 'gym-2',
    name: 'Suitcase Carry',
    targetMuscle: 'Core & Obliques / Anti-lateral Flexion',
    advancedFormCue: 'Pegang dumbel di satu sisi; jaga bahu dan pinggul tetap sejajar tanpa miring. Kencangkan perut dan berjalan dengan langkah stabil.',
    defaultSets: 3,
    defaultReps: 40, // 40 meter / langkah
    defaultRestSeconds: 75,
  },
  {
    id: 'gym-3',
    name: 'Side Plank',
    targetMuscle: 'Quadratus Lumborum & Obliques',
    advancedFormCue: 'Garis lurus sempurna dari kepala hingga pergelangan kaki. Dorong pinggul ke atas dan aktifkan gluteus medius.',
    defaultSets: 3,
    defaultReps: 45, // 45 detik
    defaultRestSeconds: 60,
  },
  {
    id: 'gym-4',
    name: 'Incline Treadmill',
    targetMuscle: 'Cardio Posterior Chain & Calves',
    advancedFormCue: 'Incline sudut 12% - 15%, kecepatan 4.5 - 5.2 km/jam. Jangan berpegangan pada handrail untuk aktivasi postural penuh.',
    defaultSets: 1,
    defaultReps: 25, // 25 menit
    defaultRestSeconds: 0,
  },
  {
    id: 'gym-5',
    name: 'Dead Hang (Dekompresi)',
    targetMuscle: 'Spine Decompression & Grip Latissimus',
    advancedFormCue: 'Relaksasi total otot punggung bawah. Bernapas dalam melalui diafragma untuk meregangkan tulang belakang secara pasif.',
    defaultSets: 3,
    defaultReps: 60, // 60 detik
    defaultRestSeconds: 60,
  },
  {
    id: 'gym-6',
    name: 'Target Forearm / Brachialis',
    targetMuscle: 'Brachialis & Forearm Extensors',
    advancedFormCue: 'Reverse curl / Hammer curl dengan tempo eksentrik lambat (3 detik turun). Jaga siku tetap terkunci di samping tulang rusuk.',
    defaultSets: 3,
    defaultReps: 12,
    defaultRestSeconds: 60,
  },
];

export const PRELOADED_CATEGORIES: ExpenseCategory[] = [
  { id: 'cat-1', name: 'SPayLater', isFixed: true, color: '#E57373' },
  { id: 'cat-2', name: 'Tagihan Laptop', isFixed: true, color: '#E57373' },
  { id: 'cat-3', name: 'Gym Membership', isFixed: true, color: '#E57373' },
  { id: 'cat-4', name: 'Tabungan', isFixed: false, color: '#8FBC8F' },
  { id: 'cat-5', name: 'Bensin & Transport', isFixed: false, color: '#AAD8A9' },
  { id: 'cat-6', name: 'Makan & Minum', isFixed: false, color: '#FFB3B1' },
  { id: 'cat-7', name: 'Kebutuhan Harian', isFixed: false, color: '#C2C9BE' },
];

export const INITIAL_DEVICES: DeviceInfo[] = [
  { id: 'dev-1', name: 'Laptop Workstation (ThinkPad)', type: 'laptop', os: 'Linux / Web', lastSync: 'Baru saja', isOnline: true, isCurrentDevice: true },
  { id: 'dev-2', name: 'HP Utama (Pixel 8)', type: 'phone', os: 'Android', lastSync: '2 menit lalu', isOnline: true },
  { id: 'dev-3', name: 'HP Sekunder (Samsung S21)', type: 'phone', os: 'Android', lastSync: '10 menit lalu', isOnline: true },
];

// Calculate cycle key based on the 10th of every month
export function getCurrentCycle(date = new Date()): { cycleKey: string; startDate: string; endDate: string; cycleLabel: string } {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  const day = date.getDate();

  let cycleStartYear = year;
  let cycleStartMonth = month;
  let cycleEndYear = year;
  let cycleEndMonth = month + 1;

  if (day < 10) {
    // Falls into previous month's 10th cycle
    cycleStartMonth = month - 1;
    if (cycleStartMonth < 0) {
      cycleStartMonth = 11;
      cycleStartYear = year - 1;
    }
    cycleEndMonth = month;
    cycleEndYear = year;
  } else {
    // Current month 10th to next month 9th
    if (cycleEndMonth > 11) {
      cycleEndMonth = 0;
      cycleEndYear = year + 1;
    }
  }

  const startFormatted = `${cycleStartYear}-${String(cycleStartMonth + 1).padStart(2, '0')}-10`;
  const endFormatted = `${cycleEndYear}-${String(cycleEndMonth + 1).padStart(2, '0')}-09`;
  const cycleKey = `${cycleStartYear}-${String(cycleStartMonth + 1).padStart(2, '0')}`;
  
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const cycleLabel = `Siklus 10 ${monthNames[cycleStartMonth]} - 9 ${monthNames[cycleEndMonth]} ${cycleEndYear}`;

  return {
    cycleKey,
    startDate: startFormatted,
    endDate: endFormatted,
    cycleLabel,
  };
}

export class StorageService {
  // Initialize storage with seeds
  static init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.GYM_EXERCISES)) {
      localStorage.setItem(STORAGE_KEYS.GYM_EXERCISES, JSON.stringify(PRELOADED_GYM_EXERCISES));
    }

    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(PRELOADED_CATEGORIES));
    }

    if (!localStorage.getItem(STORAGE_KEYS.ALLOCATION)) {
      const initialAllocation: AutoAllocationConfig = {
        monthlyIncome: 8500000,
        fixedExpenses: {
          spayLater: 750000,
          laptopBill: 1200000,
          gym: 350000,
        },
        remainderPercentages: {
          savings: 40,
          gas: 20,
          food: 40,
        },
        lastResetCycle: getCurrentCycle().cycleKey,
      };
      localStorage.setItem(STORAGE_KEYS.ALLOCATION, JSON.stringify(initialAllocation));
    }

    if (!localStorage.getItem(STORAGE_KEYS.SCHEDULES)) {
      const initialSchedules: TeachingSchedule[] = [
        {
          id: 'sched-1',
          day: 'Senin',
          startTime: '08:00',
          endTime: '10:30',
          subject: 'Pemrograman Web & Arsitektur',
          room: 'Lab Komputer 2',
          isPermanent: true,
          notes: 'Materi TypeScript & React Dasar',
        },
        {
          id: 'sched-2',
          day: 'Rabu',
          startTime: '13:00',
          endTime: '15:30',
          subject: 'Rekayasa Perangkat Lunak',
          room: 'Ruang Teori 301',
          isPermanent: true,
          notes: 'Presentasi Proyek Mahasiswa',
        },
        {
          id: 'sched-3',
          day: 'Jumat',
          startTime: '09:00',
          endTime: '11:30',
          subject: 'Sistem Basis Data & SQLite',
          room: 'Lab Database 102',
          isPermanent: true,
          notes: 'Praktikum Normalisasi & Query Relasional',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(initialSchedules));
    }

    if (!localStorage.getItem(STORAGE_KEYS.POMODORO)) {
      const initialPomodoro: PomodoroSettings = {
        studyMinutes: 45, // Sesuai PDF: misal 45 menit untuk belajar
        workMinutes: 60,  // Sesuai PDF: 1 jam untuk kerja
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
      };
      localStorage.setItem(STORAGE_KEYS.POMODORO, JSON.stringify(initialPomodoro));
    }

    if (!localStorage.getItem(STORAGE_KEYS.ALARMS)) {
      const initialAlarms: AlarmItem[] = [
        {
          id: 'alarm-1',
          label: 'Bangun Tidur Pagi (Serentak 3 Perangkat)',
          time: '05:00',
          type: 'morning',
          isSyncedAllDevices: true,
          enabled: true,
          days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
        },
        {
          id: 'alarm-2',
          label: 'Power Nap / Tidur Siang (Serentak 3 Perangkat)',
          time: '13:00',
          type: 'nap',
          isSyncedAllDevices: true,
          enabled: false,
          days: ['Senin', 'Rabu', 'Kamis'],
        },
        {
          id: 'alarm-3',
          label: 'Reminder Minum Air & Regangan Postur',
          time: '11:00',
          type: 'general',
          isSyncedAllDevices: false,
          enabled: true,
          days: ['Setiap Hari'],
        },
      ];
      localStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(initialAlarms));
    }

    if (!localStorage.getItem(STORAGE_KEYS.DEVICES)) {
      localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(INITIAL_DEVICES));
    }

    if (!localStorage.getItem(STORAGE_KEYS.TODOS)) {
      const todayStr = new Date().toISOString().split('T')[0];
      const initialTodos: Todo[] = [
        {
          id: 'td-1',
          title: 'Review slide kuliah Pemrograman Web',
          date: todayStr,
          timeLimit: '14:00',
          completed: false,
          priority: 'high',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'td-2',
          title: 'Sesi Latihan Gym Leg & Core (Calf Raise fokus soleus)',
          date: todayStr,
          timeLimit: '17:30',
          completed: false,
          priority: 'medium',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'td-3',
          title: 'Sinkronisasi offline backup SQLite ke Laptop',
          date: todayStr,
          timeLimit: '21:00',
          completed: true,
          priority: 'low',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(initialTodos));
    }

    if (!localStorage.getItem(STORAGE_KEYS.GOALS)) {
      const initialGoals: Goal[] = [
        {
          id: 'gl-1',
          title: 'Kuasai Arsitektur P2P & SQLite Offline-First',
          category: 'Skill Tech',
          targetDate: '2026-12-31',
          currentProgress: 75,
          targetMetric: '3 Modul Teruji',
          notes: 'Mendukung sinkronisasi mesh lokal tanpa cloud berbayar',
        },
        {
          id: 'gl-2',
          title: 'Mencapai Dead Hang 2 Menit & Calf Raise 60kg',
          category: 'Kebugaran',
          targetDate: '2026-11-30',
          currentProgress: 60,
          targetMetric: 'Form Sempurna',
          notes: 'Dekompresi tulang belakang & ketahanan soleus',
        },
        {
          id: 'gl-3',
          title: 'Dana Darurat 6 Bulan Pengeluaran Tetap',
          category: 'Finansial',
          targetDate: '2027-03-31',
          currentProgress: 45,
          targetMetric: 'Rp 25.000.000',
          notes: 'Alokasi 40% sisa gaji setiap tanggal 10',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(initialGoals));
    }

    if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const cycle = getCurrentCycle(today);

      const initialExpenses: Expense[] = [
        {
          id: 'exp-1',
          date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-02`,
          amount: 750000,
          category: 'SPayLater',
          description: 'Cicilan Bulanan SPayLater (Beban Tetap)',
          isFixed: true,
          cycleMonth: cycle.cycleKey,
        },
        {
          id: 'exp-2',
          date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-03`,
          amount: 1200000,
          category: 'Tagihan Laptop',
          description: 'Cicilan Laptop Kerja (Beban Tetap)',
          isFixed: true,
          cycleMonth: cycle.cycleKey,
        },
        {
          id: 'exp-3',
          date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-04`,
          amount: 350000,
          category: 'Gym Membership',
          description: 'Iuran Gym Bulanan (Beban Tetap)',
          isFixed: true,
          cycleMonth: cycle.cycleKey,
        },
        {
          id: 'exp-4',
          date: todayStr,
          amount: 45000,
          category: 'Makan & Minum',
          description: 'Makan Siang Nasi Ayam + Air Mineral',
          isFixed: false,
          cycleMonth: cycle.cycleKey,
        },
        {
          id: 'exp-5',
          date: todayStr,
          amount: 50000,
          category: 'Bensin & Transport',
          description: 'Isi Pertamax Motor',
          isFixed: false,
          cycleMonth: cycle.cycleKey,
        },
      ];
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(initialExpenses));
    }

    if (!localStorage.getItem(STORAGE_KEYS.GYM_SESSIONS)) {
      const todayStr = new Date().toISOString().split('T')[0];
      const initialSessions: GymSessionRecord[] = [
        {
          id: 'sess-1',
          exerciseId: 'gym-1',
          exerciseName: 'Seated Calf Raise',
          date: todayStr,
          sets: [
            { setNumber: 1, reps: 15, weightKg: 40, completed: true },
            { setNumber: 2, reps: 15, weightKg: 45, completed: true },
            { setNumber: 3, reps: 12, weightKg: 50, completed: false },
          ],
          restSeconds: 60,
          previousWeekReference: 'Minggu lalu: 4x15 @ 40kg (RPE 8)',
          notes: 'Regangan maksimal di soleus terasa optimal, tahan 2 detik di dasar.',
        },
        {
          id: 'sess-2',
          exerciseId: 'gym-5',
          exerciseName: 'Dead Hang (Dekompresi)',
          date: todayStr,
          sets: [
            { setNumber: 1, reps: 60, weightKg: 0, completed: true },
            { setNumber: 2, reps: 60, weightKg: 0, completed: true },
          ],
          restSeconds: 60,
          previousWeekReference: 'Minggu lalu: 3x45 detik',
          notes: 'Traksi tulang belakang lumbal sangat terasa meringankan pegal duduk ngajar.',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.GYM_SESSIONS, JSON.stringify(initialSessions));
    }

    if (!localStorage.getItem(STORAGE_KEYS.CONFLICTS)) {
      // Sample conflict demonstrating rule 7 & 19 (Preserve A + B, notify user)
      const sampleConflict: SyncConflict[] = [
        {
          id: 'conf-1',
          entityType: 'Todo',
          entityId: 'td-1',
          title: 'Review slide kuliah Pemrograman Web',
          versionA: {
            deviceId: 'dev-1',
            deviceName: 'Laptop Workstation',
            data: { timeLimit: '14:00', priority: 'high', title: 'Review slide kuliah Pemrograman Web (Modul 4-5)' },
            timestamp: '2026-10-08 10:15',
          },
          versionB: {
            deviceId: 'dev-2',
            deviceName: 'HP Utama (Pixel 8)',
            data: { timeLimit: '16:00', priority: 'medium', title: 'Review slide kuliah Pemrograman Web (Semua Bab)' },
            timestamp: '2026-10-08 10:20',
          },
          detectedAt: '2026-10-08 10:22',
          resolved: false,
        },
      ];
      localStorage.setItem(STORAGE_KEYS.CONFLICTS, JSON.stringify(sampleConflict));
    }

    // Run business logic check: overdue carry over & cycle 10th check
    StorageService.processOverdueTasks();
  }

  // --- TODOS ---
  static getTodos(): Todo[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TODOS);
    const todos: Todo[] = raw ? JSON.parse(raw) : [];
    return todos;
  }

  static saveTodos(todos: Todo[]): void {
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
  }

  static addTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Todo {
    const todos = StorageService.getTodos();
    const newTodo: Todo = {
      ...todo,
      id: `td-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    todos.unshift(newTodo);
    StorageService.saveTodos(todos);
    return newTodo;
  }

  static updateTodo(id: string, updates: Partial<Todo>): Todo | null {
    const todos = StorageService.getTodos();
    const index = todos.findIndex(t => t.id === id);
    if (index === -1) return null;
    todos[index] = { ...todos[index], ...updates, updatedAt: new Date().toISOString() };
    StorageService.saveTodos(todos);
    return todos[index];
  }

  static deleteTodo(id: string): void {
    const todos = StorageService.getTodos().filter(t => t.id !== id);
    StorageService.saveTodos(todos);
  }

  // Business Rule: Overdue logic
  // "Tugas harian yang melewati batas waktu (time limit) akan berubah warna menjadi merah dan sistem akan otomatis memindahkannya (carry over) ke daftar To-Do hari berikutnya."
  static processOverdueTasks(): void {
    const todos = StorageService.getTodos();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const nowTimeStr = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

    let hasChanges = false;
    const updated = todos.map(todo => {
      if (todo.completed) return todo;

      const isDatePast = todo.date < todayStr;
      const isTimePastToday = todo.date === todayStr && todo.timeLimit && todo.timeLimit < nowTimeStr;

      if (isDatePast) {
        // Carry over to today, mark overdue
        hasChanges = true;
        return {
          ...todo,
          carriedOverFrom: todo.date,
          date: todayStr,
          isOverdue: true,
          updatedAt: new Date().toISOString(),
        };
      } else if (isTimePastToday) {
        if (!todo.isOverdue) {
          hasChanges = true;
          return {
            ...todo,
            isOverdue: true,
            updatedAt: new Date().toISOString(),
          };
        }
      }

      return todo;
    });

    if (hasChanges) {
      StorageService.saveTodos(updated);
    }
  }

  // --- GOALS ---
  static getGoals(): Goal[] {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    return raw ? JSON.parse(raw) : [];
  }

  static saveGoals(goals: Goal[]): void {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }

  static addGoal(goal: Omit<Goal, 'id'>): Goal {
    const goals = StorageService.getGoals();
    const newGoal: Goal = { ...goal, id: `gl-${Date.now()}` };
    goals.push(newGoal);
    StorageService.saveGoals(goals);
    return newGoal;
  }

  static updateGoal(id: string, updates: Partial<Goal>): Goal | null {
    const goals = StorageService.getGoals();
    const idx = goals.findIndex(g => g.id === id);
    if (idx === -1) return null;
    goals[idx] = { ...goals[idx], ...updates };
    StorageService.saveGoals(goals);
    return goals[idx];
  }

  static deleteGoal(id: string): void {
    const goals = StorageService.getGoals().filter(g => g.id !== id);
    StorageService.saveGoals(goals);
  }

  // --- EXPENSES ---
  static getExpenses(): Expense[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return raw ? JSON.parse(raw) : [];
  }

  static saveExpenses(expenses: Expense[]): void {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }

  static addExpense(expense: Omit<Expense, 'id' | 'cycleMonth'>): Expense {
    const expenses = StorageService.getExpenses();
    const expenseDate = expense.date ? new Date(expense.date) : new Date();
    const cycle = getCurrentCycle(expenseDate);

    const newExpense: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
      cycleMonth: cycle.cycleKey,
    };
    expenses.unshift(newExpense);
    StorageService.saveExpenses(expenses);
    return newExpense;
  }

  static deleteExpense(id: string): void {
    const expenses = StorageService.getExpenses().filter(e => e.id !== id);
    StorageService.saveExpenses(expenses);
  }

  // Categories
  static getCategories(): ExpenseCategory[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return raw ? JSON.parse(raw) : PRELOADED_CATEGORIES;
  }

  static addCategory(name: string, isFixed = false): ExpenseCategory {
    const categories = StorageService.getCategories();
    const newCat: ExpenseCategory = {
      id: `cat-${Date.now()}`,
      name,
      isFixed,
      color: isFixed ? '#E57373' : '#8FBC8F',
    };
    categories.push(newCat);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    return newCat;
  }

  static deleteCategory(id: string): void {
    const categories = StorageService.getCategories().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }

  // Auto-Allocation Configuration
  static getAllocationConfig(): AutoAllocationConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.ALLOCATION);
    return raw ? JSON.parse(raw) : {
      monthlyIncome: 8500000,
      fixedExpenses: { spayLater: 750000, laptopBill: 1200000, gym: 350000 },
      remainderPercentages: { savings: 40, gas: 20, food: 40 },
      lastResetCycle: getCurrentCycle().cycleKey,
    };
  }

  static saveAllocationConfig(config: AutoAllocationConfig): void {
    localStorage.setItem(STORAGE_KEYS.ALLOCATION, JSON.stringify(config));
  }

  // Calculate auto-allocation distribution amounts
  static calculateAllocationBreakdown(config: AutoAllocationConfig) {
    const totalFixed = (config.fixedExpenses.spayLater || 0) +
                       (config.fixedExpenses.laptopBill || 0) +
                       (config.fixedExpenses.gym || 0);

    const remainder = Math.max(0, config.monthlyIncome - totalFixed);

    const savingsAmount = Math.round(remainder * (config.remainderPercentages.savings / 100));
    const gasAmount = Math.round(remainder * (config.remainderPercentages.gas / 100));
    const foodAmount = Math.round(remainder * (config.remainderPercentages.food / 100));

    return {
      monthlyIncome: config.monthlyIncome,
      totalFixed,
      remainder,
      distribution: {
        savingsAmount,
        gasAmount,
        foodAmount,
      },
    };
  }

  // --- GYM TRACKER ---
  static getGymExercises(): GymExercise[] {
    const raw = localStorage.getItem(STORAGE_KEYS.GYM_EXERCISES);
    return raw ? JSON.parse(raw) : PRELOADED_GYM_EXERCISES;
  }

  static getGymSessions(): GymSessionRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.GYM_SESSIONS);
    return raw ? JSON.parse(raw) : [];
  }

  static saveGymSessions(sessions: GymSessionRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.GYM_SESSIONS, JSON.stringify(sessions));
  }

  static addGymSession(session: Omit<GymSessionRecord, 'id'>): GymSessionRecord {
    const sessions = StorageService.getGymSessions();
    const newSession: GymSessionRecord = {
      ...session,
      id: `sess-${Date.now()}`,
    };
    sessions.unshift(newSession);
    StorageService.saveGymSessions(sessions);
    return newSession;
  }

  // --- TEACHING SCHEDULE ---
  static getTeachingSchedules(): TeachingSchedule[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
    return raw ? JSON.parse(raw) : [];
  }

  static saveTeachingSchedules(schedules: TeachingSchedule[]): void {
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
  }

  static addTeachingSchedule(schedule: Omit<TeachingSchedule, 'id'>): TeachingSchedule {
    const schedules = StorageService.getTeachingSchedules();
    const newSched: TeachingSchedule = { ...schedule, id: `sched-${Date.now()}` };
    schedules.push(newSched);
    StorageService.saveTeachingSchedules(schedules);
    return newSched;
  }

  static updateTeachingSchedule(id: string, updates: Partial<TeachingSchedule>): TeachingSchedule | null {
    const schedules = StorageService.getTeachingSchedules();
    const idx = schedules.findIndex(s => s.id === id);
    if (idx === -1) return null;
    schedules[idx] = { ...schedules[idx], ...updates };
    StorageService.saveTeachingSchedules(schedules);
    return schedules[idx];
  }

  static deleteTeachingSchedule(id: string): void {
    const schedules = StorageService.getTeachingSchedules().filter(s => s.id !== id);
    StorageService.saveTeachingSchedules(schedules);
  }

  // --- POMODORO ---
  static getPomodoroSettings(): PomodoroSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.POMODORO);
    return raw ? JSON.parse(raw) : { studyMinutes: 45, workMinutes: 60, shortBreakMinutes: 5, longBreakMinutes: 15 };
  }

  static savePomodoroSettings(settings: PomodoroSettings): void {
    localStorage.setItem(STORAGE_KEYS.POMODORO, JSON.stringify(settings));
  }

  // --- ALARMS ---
  static getAlarms(): AlarmItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ALARMS);
    return raw ? JSON.parse(raw) : [];
  }

  static saveAlarms(alarms: AlarmItem[]): void {
    localStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(alarms));
  }

  static toggleAlarm(id: string): void {
    const alarms = StorageService.getAlarms();
    const idx = alarms.findIndex(a => a.id === id);
    if (idx !== -1) {
      alarms[idx].enabled = !alarms[idx].enabled;
      StorageService.saveAlarms(alarms);
    }
  }

  // --- DEVICES & P2P SYNC ---
  static getDevices(): DeviceInfo[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DEVICES);
    return raw ? JSON.parse(raw) : INITIAL_DEVICES;
  }

  static saveDevices(devices: DeviceInfo[]): void {
    localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices));
  }

  static getConflicts(): SyncConflict[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFLICTS);
    return raw ? JSON.parse(raw) : [];
  }

  static saveConflicts(conflicts: SyncConflict[]): void {
    localStorage.setItem(STORAGE_KEYS.CONFLICTS, JSON.stringify(conflicts));
  }

  static resolveConflict(conflictId: string, chosenVersion: 'A' | 'B'): void {
    const conflicts = StorageService.getConflicts();
    const idx = conflicts.findIndex(c => c.id === conflictId);
    if (idx === -1) return;

    const conflict = conflicts[idx];
    const winningData = chosenVersion === 'A' ? conflict.versionA.data : conflict.versionB.data;

    // Apply winning version to local entity
    if (conflict.entityType === 'Todo') {
      StorageService.updateTodo(conflict.entityId, winningData);
    }

    conflicts[idx].resolved = true;
    StorageService.saveConflicts(conflicts);
  }
}
