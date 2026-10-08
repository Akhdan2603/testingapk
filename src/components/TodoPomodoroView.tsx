import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Square,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Timer,
  Settings,
  Flame,
} from 'lucide-react';
import { Todo, PomodoroSettings } from '../types';
import { StorageService } from '../services/storageService';

interface TodoPomodoroViewProps {
  todos: Todo[];
  onRefreshTodos: () => void;
}

export const TodoPomodoroView: React.FC<TodoPomodoroViewProps> = ({
  todos,
  onRefreshTodos,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [pomodoroSettings, setPomodoroSettings] = useState<PomodoroSettings>(
    StorageService.getPomodoroSettings()
  );

  // Active Task attached to Pomodoro
  const [activeTodoForPomodoro, setActiveTodoForPomodoro] = useState<Todo | null>(null);

  // Pomodoro State
  const [timerMode, setTimerMode] = useState<'study' | 'work' | 'shortBreak' | 'longBreak'>('study');
  const [timeLeft, setTimeLeft] = useState<number>(pomodoroSettings.studyMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // New Todo Form State
  const [newTitle, setNewTitle] = useState('');
  const [newTimeLimit, setNewTimeLimit] = useState('17:00');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [showAddForm, setShowAddForm] = useState(false);

  // Update Pomodoro timer duration when mode or settings change
  useEffect(() => {
    let minutes = pomodoroSettings.studyMinutes;
    if (timerMode === 'work') minutes = pomodoroSettings.workMinutes;
    else if (timerMode === 'shortBreak') minutes = pomodoroSettings.shortBreakMinutes;
    else if (timerMode === 'longBreak') minutes = pomodoroSettings.longBreakMinutes;

    setTimeLeft(minutes * 60);
    setIsRunning(false);
  }, [timerMode, pomodoroSettings]);

  // Pomodoro Tick
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      // Play web audio alert sound
      playBeepNotification();
      alert(`Sesi Pomodoro selesai! Waktu untuk istirahat atau tugas berikutnya.`);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const playBeepNotification = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.warn('AudioContext not supported or blocked:', e);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleToggleComplete = (todo: Todo) => {
    StorageService.updateTodo(todo.id, { completed: !todo.completed });
    onRefreshTodos();
  };

  const handleDelete = (id: string) => {
    StorageService.deleteTodo(id);
    if (activeTodoForPomodoro?.id === id) {
      setActiveTodoForPomodoro(null);
    }
    onRefreshTodos();
  };

  const handleCreateTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    StorageService.addTodo({
      title: newTitle.trim(),
      date: selectedDate,
      timeLimit: newTimeLimit || undefined,
      completed: false,
      priority: newPriority,
    });

    setNewTitle('');
    setShowAddForm(false);
    onRefreshTodos();
  };

  const handleSavePomodoroSettings = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.savePomodoroSettings(pomodoroSettings);
    setShowSettingsModal(false);
  };

  // Filter todos by selected date
  const filteredTodos = todos.filter(t => t.date === selectedDate);
  const overdueCount = filteredTodos.filter(t => t.isOverdue && !t.completed).length;

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#1E2024] shadow-neu-convex border border-[#282a30]/50">
        <div>
          <h2 className="text-xl font-bold text-[#E0E0E0]">To-Do List & Integrasi Pomodoro</h2>
          <p className="text-xs text-[#A0A0A0] mt-0.5">
            Tugas harian dengan batas waktu (overdue auto-carry over) dan timer fokus terintegrasi.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1E2024] shadow-neu-inset text-xs text-[#E0E0E0]">
            <Calendar className="w-3.5 h-3.5 text-[#8FBC8F]" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-[#E0E0E0] cursor-pointer"
            />
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#1E2024] bg-[#8FBC8F] hover:bg-[#a4d2a4] rounded-xl shadow-neu-subtle active:translate-y-0.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tugas Baru</span>
          </button>
        </div>
      </div>

      {/* TWO COLUMNS: POMODORO TIMER PANEL (LEFT) & TODO LIST (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* POMODORO INTEGRATED PANEL */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#1E2024] shadow-neu-convex border border-[#282a30]/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-[#8FBC8F]" />
                <h3 className="text-sm font-semibold text-[#E0E0E0]">Pomodoro Focus Timer</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-1.5 rounded-lg bg-[#1E2024] shadow-neu-subtle text-[#A0A0A0] hover:text-[#E0E0E0]"
                title="Atur Durasi Default Pomodoro"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Attached Task Indicator */}
            <div className="p-3 rounded-xl bg-[#141618] shadow-neu-groove mb-6 text-xs">
              <div className="text-[11px] text-[#686B73] mb-1">Tugas Terhubung:</div>
              {activeTodoForPomodoro ? (
                <div className="flex items-center justify-between text-[#8FBC8F] font-medium">
                  <span className="truncate">{activeTodoForPomodoro.title}</span>
                  <button
                    onClick={() => setActiveTodoForPomodoro(null)}
                    className="text-[10px] text-[#A0A0A0] hover:text-[#E57373] ml-2 shrink-0"
                  >
                    Lepas
                  </button>
                </div>
              ) : (
                <div className="text-[#A0A0A0] italic">
                  Belum memilih tugas. Klik ikon timer pada tugas di daftar kanan.
                </div>
              )}
            </div>

            {/* Mode Presets (PDF: 45 min study, 1 hr work) */}
            <div className="grid grid-cols-3 gap-2 mb-6 text-xs">
              <button
                onClick={() => setTimerMode('study')}
                className={`py-2 px-2 rounded-xl text-center transition-all ${
                  timerMode === 'study'
                    ? 'text-[#8FBC8F] bg-[#1E2024] shadow-neu-inset font-semibold'
                    : 'text-[#A0A0A0] bg-[#1E2024] shadow-neu-subtle hover:text-[#E0E0E0]'
                }`}
              >
                Belajar ({pomodoroSettings.studyMinutes}m)
              </button>
              <button
                onClick={() => setTimerMode('work')}
                className={`py-2 px-2 rounded-xl text-center transition-all ${
                  timerMode === 'work'
                    ? 'text-[#8FBC8F] bg-[#1E2024] shadow-neu-inset font-semibold'
                    : 'text-[#A0A0A0] bg-[#1E2024] shadow-neu-subtle hover:text-[#E0E0E0]'
                }`}
              >
                Kerja ({pomodoroSettings.workMinutes}m)
              </button>
              <button
                onClick={() => setTimerMode('shortBreak')}
                className={`py-2 px-2 rounded-xl text-center transition-all ${
                  timerMode === 'shortBreak'
                    ? 'text-[#8FBC8F] bg-[#1E2024] shadow-neu-inset font-semibold'
                    : 'text-[#A0A0A0] bg-[#1E2024] shadow-neu-subtle hover:text-[#E0E0E0]'
                }`}
              >
                Istirahat ({pomodoroSettings.shortBreakMinutes}m)
              </button>
            </div>

            {/* Giant Circular Digital Display */}
            <div className="my-6 text-center">
              <div className="inline-flex items-center justify-center w-52 h-52 rounded-full bg-[#1E2024] shadow-neu-convex border border-[#282a30]/50 relative">
                <div className="w-44 h-44 rounded-full bg-[#1E2024] shadow-neu-inset flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold font-mono tracking-tight text-[#E0E0E0] tabular-nums">
                    {formatTimer(timeLeft)}
                  </span>
                  <span className="text-[11px] text-[#8FBC8F] mt-1 uppercase tracking-wider font-semibold">
                    {timerMode === 'study' ? 'Sesi Belajar' : timerMode === 'work' ? 'Sesi Kerja' : 'Istirahat'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-xs transition-all ${
                isRunning
                  ? 'bg-[#E57373] text-[#1E2024] hover:bg-[#ff9e9c]'
                  : 'bg-[#8FBC8F] text-[#1E2024] hover:bg-[#a4d2a4]'
              } shadow-neu-subtle active:translate-y-0.5`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? 'Jeda' : 'Mulai Fokus'}</span>
            </button>

            <button
              onClick={() => {
                setIsRunning(false);
                let minutes = pomodoroSettings.studyMinutes;
                if (timerMode === 'work') minutes = pomodoroSettings.workMinutes;
                else if (timerMode === 'shortBreak') minutes = pomodoroSettings.shortBreakMinutes;
                else if (timerMode === 'longBreak') minutes = pomodoroSettings.longBreakMinutes;
                setTimeLeft(minutes * 60);
              }}
              className="p-3 rounded-xl bg-[#1E2024] shadow-neu-convex hover:shadow-neu-inset text-[#A0A0A0] hover:text-[#E0E0E0] transition-all"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TO-DO LIST PANEL */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#1E2024] shadow-neu-convex border border-[#282a30]/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[#8FBC8F]" />
              <h3 className="text-sm font-semibold text-[#E0E0E0]">
                Daftar Tugas ({filteredTodos.length})
              </h3>
            </div>
            {overdueCount > 0 && (
              <span className="text-[11px] font-semibold text-[#E57373] bg-[#E57373]/10 px-2.5 py-1 rounded-full border border-[#E57373]/20">
                {overdueCount} Tugas Overdue
              </span>
            )}
          </div>

          {/* List of Tasks */}
          <div className="space-y-3">
            {filteredTodos.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-[#141618]/30 border border-dashed border-[#282a30]">
                <Clock className="w-6 h-6 text-[#686B73] mx-auto mb-2" />
                <p className="text-xs text-[#A0A0A0]">Belum ada tugas untuk tanggal {selectedDate}.</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-3 text-xs text-[#8FBC8F] hover:underline"
                >
                  + Tambah Tugas Sekarang
                </button>
              </div>
            ) : (
              filteredTodos.map(todo => {
                const isOverdue = todo.isOverdue && !todo.completed;
                const isAttached = activeTodoForPomodoro?.id === todo.id;

                return (
                  <div
                    key={todo.id}
                    className={`p-4 rounded-xl transition-all ${
                      isOverdue
                        ? 'bg-[#1E2024] border-2 border-[#E57373] shadow-neu-subtle text-[#E57373]'
                        : todo.completed
                        ? 'bg-[#141618]/50 text-[#686B73]'
                        : 'bg-[#1E2024] shadow-neu-subtle text-[#E0E0E0]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Checkbox */}
                        <button
                          onClick={() => handleToggleComplete(todo)}
                          className="mt-0.5 text-[#8FBC8F] hover:scale-110 transition-transform shrink-0"
                        >
                          {todo.completed ? (
                            <CheckSquare className="w-5 h-5 text-[#8FBC8F]" />
                          ) : (
                            <Square className="w-5 h-5 text-[#686B73] hover:text-[#8FBC8F]" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs md:text-sm font-medium break-words ${
                              todo.completed ? 'line-through text-[#686B73]' : ''
                            }`}
                          >
                            {todo.title}
                          </p>

                          {/* Meta labels (PDF Overdue & Carry Over) */}
                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px]">
                            {todo.timeLimit && (
                              <span className="flex items-center gap-1 font-mono text-[#A0A0A0]">
                                <Clock className="w-3 h-3" />
                                Limit: {todo.timeLimit}
                              </span>
                            )}

                            {isOverdue && (
                              <span className="font-semibold text-[#E57373] bg-[#E57373]/10 px-1.5 py-0.5 rounded text-[10px]">
                                MELEWATI BATAS WAKTU (OVERDUE)
                              </span>
                            )}

                            {todo.carriedOverFrom && (
                              <span className="text-[#A0A0A0] text-[10px] italic">
                                Carry-over dari {todo.carriedOverFrom}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setActiveTodoForPomodoro(todo)}
                          className={`p-2 rounded-lg text-xs transition-all ${
                            isAttached
                              ? 'bg-[#8FBC8F] text-[#1E2024] font-bold'
                              : 'bg-[#1E2024] shadow-neu-subtle text-[#A0A0A0] hover:text-[#8FBC8F]'
                          }`}
                          title="Hubungkan ke Timer Pomodoro"
                        >
                          <Timer className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(todo.id)}
                          className="p-2 rounded-lg bg-[#1E2024] shadow-neu-subtle text-[#686B73] hover:text-[#E57373] transition-colors"
                          title="Hapus Tugas"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* MODAL: TAMBAH TUGAS BARU */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1E2024] border border-[#282a30] rounded-2xl shadow-neu-floating p-6 space-y-4">
            <h3 className="text-sm font-semibold text-[#E0E0E0]">Buat Tugas Baru</h3>

            <form onSubmit={handleCreateTodo} className="space-y-4">
              <div>
                <label className="block text-xs text-[#A0A0A0] mb-1">Judul Tugas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Buat modul praktikum, Gym Leg Day..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E2024] shadow-neu-inset text-xs text-[#E0E0E0] outline-none border-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#A0A0A0] mb-1">Batas Waktu (Time Limit)</label>
                  <input
                    type="time"
                    value={newTimeLimit}
                    onChange={e => setNewTimeLimit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1E2024] shadow-neu-inset text-xs text-[#E0E0E0] outline-none border-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#A0A0A0] mb-1">Prioritas</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1E2024] shadow-neu-inset text-xs text-[#E0E0E0] outline-none border-none"
                  >
                    <option value="high">Tinggi (High)</option>
                    <option value="medium">Sedang (Medium)</option>
                    <option value="low">Rendah (Low)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-xs text-[#A0A0A0] hover:text-[#E0E0E0]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-[#1E2024] bg-[#8FBC8F] hover:bg-[#a4d2a4] rounded-xl shadow-neu-subtle"
                >
                  Simpan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PENGATURAN DURASI DEFAULT POMODORO */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1E2024] border border-[#282a30] rounded-2xl shadow-neu-floating p-6 space-y-4">
            <h3 className="text-sm font-semibold text-[#E0E0E0]">Pengaturan Durasi Default Pomodoro</h3>
            <p className="text-[11px] text-[#A0A0A0]">
              Durasi ini akan disimpan secara permanen di database lokal hingga Anda mengubahnya secara manual (PDF Hal 3).
            </p>

            <form onSubmit={handleSavePomodoroSettings} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#A0A0A0] mb-1">Durasi Belajar (Menit)</label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={pomodoroSettings.studyMinutes}
                    onChange={e => setPomodoroSettings({ ...pomodoroSettings, studyMinutes: parseInt(e.target.value, 10) || 45 })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1E2024] shadow-neu-inset text-xs text-[#E0E0E0] outline-none border-none font-mono"
                  />
                  <span className="text-[10px] text-[#686B73]">Default PDF: 45 Menit</span>
                </div>

                <div>
                  <label className="block text-xs text-[#A0A0A0] mb-1">Durasi Kerja (Menit)</label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={pomodoroSettings.workMinutes}
                    onChange={e => setPomodoroSettings({ ...pomodoroSettings, workMinutes: parseInt(e.target.value, 10) || 60 })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1E2024] shadow-neu-inset text-xs text-[#E0E0E0] outline-none border-none font-mono"
                  />
                  <span className="text-[10px] text-[#686B73]">Default PDF: 60 Menit</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 text-xs text-[#A0A0A0] hover:text-[#E0E0E0]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-[#1E2024] bg-[#8FBC8F] hover:bg-[#a4d2a4] rounded-xl shadow-neu-subtle"
                >
                  Simpan Durasi Permanen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
