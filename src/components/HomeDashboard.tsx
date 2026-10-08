import React from 'react';
import {
  CheckSquare,
  Wallet,
  GraduationCap,
  Dumbbell,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { Todo, Expense, TeachingSchedule, GymSessionRecord, Goal, AutoAllocationConfig } from '../types';
import { getCurrentCycle, StorageService } from '../services/storageService';
import { TabType } from './Sidebar';

interface HomeDashboardProps {
  todos: Todo[];
  expenses: Expense[];
  schedules: TeachingSchedule[];
  gymSessions: GymSessionRecord[];
  goals: Goal[];
  allocationConfig: AutoAllocationConfig;
  onNavigate: (tab: TabType) => void;
  onOpenAI: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  todos,
  expenses,
  schedules,
  gymSessions,
  goals,
  allocationConfig,
  onNavigate,
  onOpenAI,
}) => {
  const cycle = getCurrentCycle();

  // 1. Remaining To-Do List today
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTodos = todos.filter(t => t.date === todayStr);
  const remainingTodos = todayTodos.filter(t => !t.completed);
  const overdueTodos = todayTodos.filter(t => t.isOverdue && !t.completed);

  // 2. Total Expense berjalan untuk siklus bulan ini (mulai tgl 10)
  const currentCycleExpenses = expenses.filter(e => e.cycleMonth === cycle.cycleKey);
  const totalExpenseAmount = currentCycleExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Allocation breakdown
  const breakdown = StorageService.calculateAllocationBreakdown(allocationConfig);
  const remainingBudget = Math.max(0, breakdown.monthlyIncome - totalExpenseAmount);

  // Today's day name in Indonesian
  const dayIndex = new Date().getDay();
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayDayName = dayNames[dayIndex];
  const todaySchedules = schedules.filter(s => s.day === todayDayName);

  // Next Gym Exercise Spotlight
  const gymExercises = StorageService.getGymExercises();
  const calfRaiseExercise = gymExercises.find(e => e.name.includes('Calf')) || gymExercises[0];

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Welcome Banner / Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#1E2024] shadow-neu-convex border border-[#282a30]/60">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#8FBC8F] font-semibold uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-[#8FBC8F]"></span>
            Command Center Aktif · Mode Privat Offline
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[#E0E0E0] tracking-tight">
            Selamat Datang di Ruang Kendali
          </h2>
          <p className="text-xs md:text-sm text-[#A0A0A0] mt-1 max-w-xl">
            Sistem mandiri terintegrasi: Tugas harian, siklus pengeluaran tgl 10, pelacak gym, jadwal mengajar, dan asisten Gemini.
          </p>
        </div>

        <button
          onClick={onOpenAI}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1E2024] shadow-neu-convex hover:shadow-neu-inset text-[#8FBC8F] text-xs font-semibold transition-all group shrink-0"
        >
          <Sparkles className="w-4 h-4 text-[#8FBC8F] group-hover:rotate-12 transition-transform" />
          <span>Beri Perintah AI (Input Teks)</span>
        </button>
      </div>

      {/* CORE HERO METRICS: SISA TO-DO & EXPENSE BERJALAN BULAN INI (SIKLUS 10) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Metric 1: To-Do List Hari Ini */}
        <div className="p-6 rounded-2xl bg-[#1E2024] shadow-neu-convex border border-[#282a30]/50 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1E2024] shadow-neu-groove flex items-center justify-center text-[#8FBC8F]">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#E0E0E0]">Sisa To-Do List Hari Ini</h3>
                <p className="text-[11px] text-[#A0A0A0]">Tugas aktif & evaluasi batas waktu</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('todos')}
              className="text-xs text-[#8FBC8F] hover:underline flex items-center gap-1"
            >
              Kelola <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-baseline gap-3 my-2">
            <span className="text-3xl font-bold font-mono text-[#E0E0E0] tabular-nums">
              {remainingTodos.length}
            </span>
            <span className="text-xs text-[#A0A0A0]">
              tugas tersisa dari {todayTodos.length} total tugas
            </span>
          </div>

          {/* Overdue Warning Callout */}
          {overdueTodos.length > 0 ? (
            <div className="mt-4 p-3 rounded-xl bg-[#282a30]/40 border-l-4 border-[#E57373] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#E57373]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>{overdueTodos.length} tugas lewat batas waktu (Overdue)</strong> — Otomatis dipindahkan (carry over) ke daftar berikutnya.
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-xs text-[#8FBC8F] flex items-center gap-1.5">
              <span>Semua tugas dalam koridor waktu aman.</span>
            </div>
          )}

          {/* Quick list preview */}
          <div className="mt-4 space-y-2">
            {todayTodos.slice(0, 3).map(todo => (
              <div
                key={todo.id}
                className={`p-2.5 rounded-lg text-xs flex items-center justify-between ${
                  todo.isOverdue && !todo.completed
                    ? 'bg-[#E57373]/10 text-[#E57373] border border-[#E57373]/30'
                    : todo.completed
                    ? 'line-through text-[#686B73] bg-[#1E2024]'
                    : 'bg-[#1E2024] shadow-neu-subtle text-[#E0E0E0]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-2 h-2 rounded-full ${todo.completed ? 'bg-[#8FBC8F]' : todo.isOverdue ? 'bg-[#E57373]' : 'bg-[#AAD8A9]'}`}></span>
                  <span className="truncate">{todo.title}</span>
                </div>
                <span className="text-[11px] font-mono shrink-0 ml-2">
                  {todo.timeLimit ? `Limit ${todo.timeLimit}` : 'Harian'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Metric 2: Total Expense Berjalan (Siklus Tanggal 10) */}
        <div className="p-6 rounded-2xl bg-[#1E2024] shadow-neu-convex border border-[#282a30]/50 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1E2024] shadow-neu-groove flex items-center justify-center text-[#AAD8A9]">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#E0E0E0]">Total Expense Berjalan</h3>
                <p className="text-[11px] text-[#8FBC8F] font-medium">{cycle.cycleLabel}</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('expenses')}
              className="text-xs text-[#8FBC8F] hover:underline flex items-center gap-1"
            >
              Rincian <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-baseline gap-3 my-2">
            <span className="text-2xl md:text-3xl font-bold font-mono text-[#E0E0E0] tabular-nums">
              Rp {totalExpenseAmount.toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-[#A0A0A0]">
              dari pemasukan Rp {breakdown.monthlyIncome.toLocaleString('id-ID')}
            </span>
          </div>

          {/* Budget progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-[#A0A0A0] mb-1">
              <span>Sisa Anggaran Tersedia</span>
              <span className="font-mono text-[#8FBC8F] font-semibold tabular-nums">
                Rp {remainingBudget.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-[#141618] shadow-neu-groove overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#8FBC8F] to-[#AAD8A9] transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.round((totalExpenseAmount / breakdown.monthlyIncome) * 100))}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Auto-Allocation Status summary */}
          <div className="mt-4 pt-3 border-t border-[#282a30] grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="p-2 rounded-lg bg-[#141618]/50">
              <div className="text-[#686B73]">Beban Tetap</div>
              <div className="font-mono font-semibold text-[#E57373]">
                Rp {(breakdown.totalFixed / 1000).toLocaleString('id-ID')}k
              </div>
            </div>
            <div className="p-2 rounded-lg bg-[#141618]/50">
              <div className="text-[#686B73]">Tabungan (40%)</div>
              <div className="font-mono font-semibold text-[#8FBC8F]">
                Rp {(breakdown.distribution.savingsAmount / 1000).toLocaleString('id-ID')}k
              </div>
            </div>
            <div className="p-2 rounded-lg bg-[#141618]/50">
              <div className="text-[#686B73]">Makan & Bensin</div>
              <div className="font-mono font-semibold text-[#E0E0E0]">
                Rp {((breakdown.distribution.foodAmount + breakdown.distribution.gasAmount) / 1000).toLocaleString('id-ID')}k
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECONDARY ROW: TEACHING SCHEDULE TODAY & GYM TRACKER SPOTLIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module 1: Jam Mengajar Hari Ini */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-[#1E2024] shadow-neu-convex border border-[#282a30]/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-5 h-5 text-[#8FBC8F]" />
              <h3 className="text-sm font-semibold text-[#E0E0E0]">Jam Mengajar Hari Ini</h3>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#1E2024] shadow-neu-subtle text-[#8FBC8F] font-mono">
              {todayDayName}
            </span>
          </div>

          {todaySchedules.length > 0 ? (
            <div className="space-y-3">
              {todaySchedules.map(sched => (
                <div key={sched.id} className="p-3.5 rounded-xl bg-[#1E2024] shadow-neu-subtle border-l-3 border-[#8FBC8F]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#E0E0E0]">{sched.subject}</span>
                    <span className="font-mono text-[#8FBC8F] bg-[#141618] px-2 py-0.5 rounded text-[11px]">
                      {sched.startTime} - {sched.endTime}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#A0A0A0] mt-1 flex items-center justify-between">
                    <span>Ruang: {sched.room}</span>
                    <span className="text-[#686B73]">{sched.isPermanent ? 'Permanen' : 'Tambahan'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center rounded-xl bg-[#141618]/30 border border-dashed border-[#282a30]">
              <Clock className="w-6 h-6 text-[#686B73] mx-auto mb-2" />
              <p className="text-xs text-[#A0A0A0]">Tidak ada jadwal mengajar tetap hari {todayDayName}.</p>
              <button
                onClick={() => onNavigate('schedule')}
                className="mt-3 text-xs text-[#8FBC8F] hover:underline"
              >
                Lihat Jadwal Lengkap Mingguan →
              </button>
            </div>
          )}
        </div>

        {/* Module 2: Gym Tracker Spotlight & Form Cue */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-[#1E2024] shadow-neu-convex border border-[#282a30]/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Dumbbell className="w-5 h-5 text-[#AAD8A9]" />
              <h3 className="text-sm font-semibold text-[#E0E0E0]">Rutinitas Gym Khusus</h3>
            </div>
            <button
              onClick={() => onNavigate('gym')}
              className="text-xs text-[#8FBC8F] hover:underline"
            >
              Buka Tracker →
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#1E2024] shadow-neu-subtle border border-[#282a30]">
            <div className="flex items-center justify-between text-xs font-semibold text-[#E0E0E0] mb-1">
              <span>{calfRaiseExercise.name}</span>
              <span className="text-[11px] text-[#8FBC8F]">{calfRaiseExercise.targetMuscle}</span>
            </div>

            {/* Advanced Form Cue Callout */}
            <div className="mt-2.5 p-2.5 rounded-lg bg-[#141618]/60 text-xs text-[#A0A0A0] border border-[#282a30]/60">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-[#8FBC8F] mb-1">
                <Info className="w-3.5 h-3.5" /> Panduan Form Lanjutan:
              </div>
              <p className="text-[11px] leading-relaxed italic">
                "{calfRaiseExercise.advancedFormCue}"
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-[#A0A0A0]">
              <span>Rekomendasi: {calfRaiseExercise.defaultSets} Set × {calfRaiseExercise.defaultReps} Reps</span>
              <span className="font-mono text-[#E0E0E0]">Istirahat {calfRaiseExercise.defaultRestSeconds}s</span>
            </div>
          </div>
        </div>

        {/* Module 3: Goals & Future Targets Progress */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-[#1E2024] shadow-neu-convex border border-[#282a30]/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-5 h-5 text-[#8FBC8F]" />
              <h3 className="text-sm font-semibold text-[#E0E0E0]">Goals & Target Masa Depan</h3>
            </div>
            <button
              onClick={() => onNavigate('goals')}
              className="text-xs text-[#8FBC8F] hover:underline"
            >
              Semua →
            </button>
          </div>

          <div className="space-y-3">
            {goals.slice(0, 2).map(goal => (
              <div key={goal.id} className="p-3 rounded-xl bg-[#1E2024] shadow-neu-subtle">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[#E0E0E0] truncate">{goal.title}</span>
                  <span className="font-mono text-[#8FBC8F] tabular-nums font-semibold ml-2">
                    {goal.currentProgress}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#141618] shadow-neu-groove overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#8FBC8F]"
                    style={{ width: `${goal.currentProgress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-[#686B73] mt-1">
                  <span>{goal.category}</span>
                  <span>Target: {goal.targetDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
