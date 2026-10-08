import React, { useState } from 'react';
import {
  Dumbbell,
  HelpCircle,
  Clock,
  Play,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Info,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { GymExercise, GymSessionRecord, GymSetRecord } from '../types';
import { StorageService } from '../services/storageService';

interface GymTrackerViewProps {
  gymSessions: GymSessionRecord[];
  onRefreshSessions: () => void;
}

export const GymTrackerView: React.FC<GymTrackerViewProps> = ({
  gymSessions,
  onRefreshSessions,
}) => {
  const exercises = StorageService.getGymExercises();
  const [selectedExercise, setSelectedExercise] = useState<GymExercise>(exercises[0]);

  // Form Cue Modal/Tooltip state (keeps screen clean as per PDF Section 8)
  const [activeFormCueModal, setActiveFormCueModal] = useState<GymExercise | null>(null);

  // Active workout session in-progress
  const [currentSets, setCurrentSets] = useState<GymSetRecord[]>([
    { setNumber: 1, reps: 15, weightKg: 40, completed: false },
    { setNumber: 2, reps: 15, weightKg: 40, completed: false },
    { setNumber: 3, reps: 12, weightKg: 45, completed: false },
  ]);
  const [sessionNotes, setSessionNotes] = useState('');

  // Static previous week reference (PDF: diletakkan sebagai teks statis berwarna abu-abu tepat di atas kotak input)
  const previousWeekBenchmarks: Record<string, string> = {
    'Seated Calf Raise': 'Minggu lalu: 4x15 @ 40kg (Tahan 2s di dasar)',
    'Suitcase Carry': 'Minggu lalu: 3x40m @ 24kg dumbbell',
    'Side Plank': 'Minggu lalu: 3x45 detik per sisi',
    'Incline Treadmill': 'Minggu lalu: Incline 12%, 25 min @ 4.8 km/h',
    'Dead Hang (Dekompresi)': 'Minggu lalu: 3x60 detik traksi pasif',
    'Target Forearm / Brachialis': 'Minggu lalu: 3x12 @ 12.5kg tempo 3-0-1',
  };

  // Rest Timer State
  const [restSecondsLeft, setRestSecondsLeft] = useState<number>(0);
  const [isRestTimerActive, setIsRestTimerActive] = useState<boolean>(false);

  React.useEffect(() => {
    let interval: any = null;
    if (isRestTimerActive && restSecondsLeft > 0) {
      interval = setInterval(() => {
        setRestSecondsLeft(s => s - 1);
      }, 1000);
    } else if (isRestTimerActive && restSecondsLeft === 0) {
      setIsRestTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isRestTimerActive, restSecondsLeft]);

  const startRestTimer = (seconds: number) => {
    setRestSecondsLeft(seconds);
    setIsRestTimerActive(true);
  };

  const handleToggleSetComplete = (setIndex: number) => {
    const updated = [...currentSets];
    updated[setIndex].completed = !updated[setIndex].completed;
    setCurrentSets(updated);

    if (updated[setIndex].completed && selectedExercise.defaultRestSeconds > 0) {
      startRestTimer(selectedExercise.defaultRestSeconds);
    }
  };

  const handleUpdateSet = (index: number, field: 'reps' | 'weightKg', value: number) => {
    const updated = [...currentSets];
    updated[index][field] = value;
    setCurrentSets(updated);
  };

  const handleAddSet = () => {
    const nextSetNumber = currentSets.length + 1;
    const lastSet = currentSets[currentSets.length - 1] || { reps: 12, weightKg: 30 };
    setCurrentSets([
      ...currentSets,
      { setNumber: nextSetNumber, reps: lastSet.reps, weightKg: lastSet.weightKg, completed: false },
    ]);
  };

  const handleSaveSession = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const prevRef = previousWeekBenchmarks[selectedExercise.name] || 'Minggu lalu: 3x12 standar';

    StorageService.addGymSession({
      exerciseId: selectedExercise.id,
      exerciseName: selectedExercise.name,
      date: todayStr,
      sets: currentSets,
      restSeconds: selectedExercise.defaultRestSeconds,
      previousWeekReference: prevRef,
      notes: sessionNotes.trim() || 'Sesi selesai.',
    });

    alert(`Sesi latihan ${selectedExercise.name} berhasil disimpan ke database lokal!`);
    setSessionNotes('');
    onRefreshSessions();
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#1E2024] shadow-neu-convex border border-[#282a30]/50">
        <div>
          <h2 className="text-xl font-bold text-[#E0E0E0]">Gym Tracker Khusus</h2>
          <p className="text-xs text-[#A0A0A0] mt-0.5">
            Pelacakan repetisi sangat detail, perbandingan minggu lalu tepat di atas input, dan panduan form tooltip.
          </p>
        </div>

        {/* Rest Timer Widget */}
        <div className="flex items-center gap-3 p-2 px-3 rounded-xl bg-[#141618] shadow-neu-groove">
          <Clock className="w-4 h-4 text-[#8FBC8F]" />
          <div className="text-xs">
            <span className="text-[#A0A0A0]">Waktu Istirahat: </span>
            <span className="font-mono font-bold text-[#8FBC8F] tabular-nums">
              {restSecondsLeft > 0 ? `${restSecondsLeft}s` : 'Siap'}
            </span>
          </div>
          {restSecondsLeft > 0 && (
            <button
              onClick={() => setIsRestTimerActive(false)}
              className="text-[10px] text-[#E57373] ml-1"
            >
              Lewati
            </button>
          )}
        </div>
      </div>

      {/* EXERCISE SELECTION CHIPS (6 PRELOADED SPECIFIC EXERCISES) */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-[#A0A0A0] px-1">
          Pilih Gerakan Terdaftar (Database Pre-load PDF):
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {exercises.map(ex => {
            const isSelected = selectedExercise.id === ex.id;
            return (
              <button
                key={ex.id}
                onClick={() => {
                  setSelectedExercise(ex);
                  // Reset sets for this exercise
                  setCurrentSets([
                    { setNumber: 1, reps: ex.defaultReps, weightKg: 40, completed: false },
                    { setNumber: 2, reps: ex.defaultReps, weightKg: 40, completed: false },
                    { setNumber: 3, reps: ex.defaultReps, weightKg: 40, completed: false },
                  ]);
                }}
                className={`p-3 rounded-xl text-left transition-all ${
                  isSelected
                    ? 'bg-[#1E2024] shadow-neu-inset border border-[#8FBC8F]/30 text-[#8FBC8F]'
                    : 'bg-[#1E2024] shadow-neu-subtle text-[#E0E0E0] hover:text-[#8FBC8F]'
                }`}
              >
                <div className="text-xs font-semibold truncate">{ex.name}</div>
                <div className="text-[10px] text-[#686B73] truncate mt-0.5">{ex.targetMuscle}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE WORKOUT TRACKER CARD */}
      <div className="p-6 rounded-2xl bg-[#1E2024] shadow-neu-convex border border-[#282a30]/50 space-y-6">
        {/* Title & Tooltip Trigger */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#E0E0E0]">{selectedExercise.name}</h3>

              {/* TOOLTIP BUTTON: Menampilkan panduan form tingkat lanjut dalam bentuk tooltip pop-up agar layar tracker repetisi tetap bersih */}
              <button
                onClick={() => setActiveFormCueModal(selectedExercise)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1E2024] shadow-neu-subtle text-[11px] font-medium text-[#8FBC8F] hover:text-[#a4d2a4] hover:shadow-neu-inset transition-all"
                title="Buka Panduan Form Lanjutan"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#8FBC8F]" />
                <span>Panduan Form</span>
              </button>
            </div>
            <p className="text-xs text-[#A0A0A0] mt-0.5">Target: {selectedExercise.targetMuscle}</p>
          </div>

          <div className="text-right text-xs text-[#A0A0A0]">
            <div>Istirahat Antar Set: <strong className="font-mono text-[#8FBC8F]">{selectedExercise.defaultRestSeconds}s</strong></div>
          </div>
        </div>

        {/* CRITICAL PDF SPEC: STATIC GRAY TEXT RIGHT ABOVE INPUT BOX
            "Perbandingan progres minggu sebelumnya akan diletakkan sebagai teks statis berwarna abu-abu tepat di atas kotak input, sehingga referensi angka tidak hilang saat pengguna mulai mengetik." */}
        <div className="p-3 rounded-xl bg-[#141618]/70 border border-[#282a30]">
          <div className="text-xs text-[#686B73] font-medium flex items-center gap-2">
            <Info className="w-4 h-4 text-[#8FBC8F]" />
            <span>
              Tolak Ukur Performa: <strong className="text-[#A0A0A0] font-mono">{previousWeekBenchmarks[selectedExercise.name] || 'Belum ada data'}</strong>
            </span>
          </div>
        </div>

        {/* SETS INPUT TABLE */}
        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-3 text-xs text-[#686B73] font-semibold px-2">
            <div className="col-span-2">SET</div>
            <div className="col-span-4">BEBAN (KG)</div>
            <div className="col-span-4">REPETISI</div>
            <div className="col-span-2 text-right">STATUS</div>
          </div>

          {currentSets.map((set, idx) => (
            <div
              key={set.setNumber}
              className={`p-3 rounded-xl bg-[#1E2024] shadow-neu-subtle border ${
                set.completed ? 'border-[#8FBC8F]/30 bg-[#1E2024]/50' : 'border-[#282a30]/60'
              } grid grid-cols-12 gap-3 items-center`}
            >
              {/* Set Label */}
              <div className="col-span-2 font-mono font-bold text-xs text-[#E0E0E0]">
                Set {set.setNumber}
              </div>

              {/* Weight Input with Static Gray Reference Above */}
              <div className="col-span-4">
                <div className="text-[10px] text-[#686B73] font-mono mb-0.5">
                  Ref: {set.setNumber === 1 ? '40kg' : '45kg'}
                </div>
                <div className="flex items-center px-3 py-1.5 rounded-lg bg-[#141618] shadow-neu-groove">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={set.weightKg}
                    onChange={e => handleUpdateSet(idx, 'weightKg', parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent border-none outline-none text-xs font-mono text-[#E0E0E0]"
                  />
                  <span className="text-[10px] text-[#686B73] ml-1">kg</span>
                </div>
              </div>

              {/* Reps Input with Static Gray Reference Above */}
              <div className="col-span-4">
                <div className="text-[10px] text-[#686B73] font-mono mb-0.5">
                  Ref: 15 reps
                </div>
                <div className="flex items-center px-3 py-1.5 rounded-lg bg-[#141618] shadow-neu-groove">
                  <input
                    type="number"
                    min="0"
                    value={set.reps}
                    onChange={e => handleUpdateSet(idx, 'reps', parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-transparent border-none outline-none text-xs font-mono text-[#E0E0E0]"
                  />
                  <span className="text-[10px] text-[#686B73] ml-1">reps</span>
                </div>
              </div>

              {/* Completed Button */}
              <div className="col-span-2 text-right">
                <button
                  onClick={() => handleToggleSetComplete(idx)}
                  className={`p-2 rounded-lg text-xs transition-all ${
                    set.completed
                      ? 'bg-[#8FBC8F] text-[#1E2024] font-bold shadow-neu-subtle'
                      : 'bg-[#1E2024] shadow-neu-subtle text-[#A0A0A0] hover:text-[#8FBC8F]'
                  }`}
                  title={set.completed ? 'Selesai' : 'Tandai Selesai & Mulai Istirahat'}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={handleAddSet}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#1E2024] shadow-neu-subtle hover:shadow-neu-inset text-xs text-[#8FBC8F] font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Set
            </button>

            <button
              onClick={handleSaveSession}
              className="px-5 py-2 rounded-xl bg-[#8FBC8F] hover:bg-[#a4d2a4] text-[#1E2024] font-bold text-xs shadow-neu-subtle active:translate-y-0.5 transition-all"
            >
              Simpan Sesi Latihan
            </button>
          </div>
        </div>
      </div>

      {/* PREVIOUS WORKOUT SESSIONS LOG */}
      <div className="p-6 rounded-2xl bg-[#1E2024] shadow-neu-convex border border-[#282a30]/50 space-y-4">
        <h3 className="text-sm font-semibold text-[#E0E0E0]">Riwayat Sesi Tersimpan ({gymSessions.length})</h3>

        <div className="space-y-3">
          {gymSessions.map(sess => (
            <div key={sess.id} className="p-4 rounded-xl bg-[#1E2024] shadow-neu-subtle text-xs">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-[#E0E0E0]">{sess.exerciseName}</span>
                <span className="font-mono text-[#686B73]">{sess.date}</span>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] text-[#A0A0A0] mb-2">
                {sess.sets.map(s => (
                  <span key={s.setNumber} className="px-2 py-0.5 rounded bg-[#141618] font-mono">
                    Set {s.setNumber}: {s.reps}x @ {s.weightKg}kg
                  </span>
                ))}
              </div>
              {sess.notes && <p className="text-[11px] text-[#686B73] italic">"{sess.notes}"</p>}
            </div>
          ))}
        </div>
      </div>

      {/* FORM CUE MODAL (POP-UP AS REQUIRED BY PDF HAL 2 SEC 8) */}
      {activeFormCueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1E2024] border border-[#282a30] rounded-2xl shadow-neu-floating p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#8FBC8F]">
              <HelpCircle className="w-5 h-5" />
              <h3 className="text-sm font-bold text-[#E0E0E0]">
                Panduan Form Lanjutan: {activeFormCueModal.name}
              </h3>
            </div>

            <div className="p-4 rounded-xl bg-[#141618] border border-[#282a30] text-xs text-[#E0E0E0] leading-relaxed space-y-3">
              <div>
                <span className="text-[#686B73] block text-[10px] uppercase font-semibold">Otot Target Primer</span>
                <span className="font-semibold text-[#8FBC8F]">{activeFormCueModal.targetMuscle}</span>
              </div>

              <div>
                <span className="text-[#686B73] block text-[10px] uppercase font-semibold">Instruksi Teknis & Cues</span>
                <p className="mt-1 text-xs text-[#E0E0E0] leading-normal font-sans">
                  {activeFormCueModal.advancedFormCue}
                </p>
              </div>

              <div className="pt-2 border-t border-[#282a30] grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[#686B73]">Target Repetisi:</span> {activeFormCueModal.defaultReps} reps
                </div>
                <div>
                  <span className="text-[#686B73]">Istirahat Ideal:</span> {activeFormCueModal.defaultRestSeconds} detik
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setActiveFormCueModal(null)}
                className="px-4 py-2 text-xs font-semibold text-[#1E2024] bg-[#8FBC8F] hover:bg-[#a4d2a4] rounded-xl shadow-neu-subtle"
              >
                Paham & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
