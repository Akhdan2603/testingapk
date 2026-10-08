import React, { useState } from 'react';
import { Target, Plus, Trash2, Calendar, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Goal } from '../types';
import { StorageService } from '../services/storageService';

interface GoalsViewProps {
  goals: Goal[];
  onRefreshGoals: () => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({ goals, onRefreshGoals }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Skill Tech');
  const [newTargetDate, setNewTargetDate] = useState('2026-12-31');
  const [newTargetMetric, setNewTargetMetric] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    StorageService.addGoal({
      title: newTitle.trim(),
      category: newCategory,
      targetDate: newTargetDate,
      currentProgress: 0,
      targetMetric: newTargetMetric,
      notes: newNotes,
    });

    setNewTitle('');
    setShowAddModal(false);
    onRefreshGoals();
  };

  const handleUpdateProgress = (id: string, delta: number) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    const newProgress = Math.max(0, Math.min(100, goal.currentProgress + delta));
    StorageService.updateGoal(id, { currentProgress: newProgress });
    onRefreshGoals();
  };

  const handleDelete = (id: string) => {
    StorageService.deleteGoal(id);
    onRefreshGoals();
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#1E2024] shadow-neu-convex border border-[#282a30]/50">
        <div>
          <h2 className="text-xl font-bold text-[#E0E0E0]">Goals & Target Masa Depan</h2>
          <p className="text-xs text-[#A0A0A0] mt-0.5">
            Pelacakan visual progres (0-100%) dengan batas waktu target yang fleksibel.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#1E2024] bg-[#8FBC8F] hover:bg-[#a4d2a4] rounded-xl shadow-neu-subtle active:translate-y-0.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Target</span>
        </button>
      </div>

      {/* Grid of Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => {
          const isComplete = goal.currentProgress >= 100;

          return (
            <div
              key={goal.id}
              className="p-6 rounded-2xl bg-[#1E2024] shadow-neu-convex border border-[#282a30]/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[11px] font-medium text-[#8FBC8F] uppercase tracking-wider px-2 py-0.5 rounded bg-[#141618]">
                    {goal.category}
                  </span>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-[#686B73] hover:text-[#E57373] transition-colors p-1"
                    title="Hapus Target"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-sm font-semibold text-[#E0E0E0] mb-2 leading-snug">
                  {goal.title}
                </h3>

                {goal.notes && (
                  <p className="text-xs text-[#A0A0A0] mb-4 line-clamp-2">
                    {goal.notes}
                  </p>
                )}

                {/* Progress Bar (0-100%) as per PDF Section 8 */}
                <div className="my-4">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-[#A0A0A0]">Progres Pencapaian</span>
                    <span className="font-mono font-bold text-[#8FBC8F] tabular-nums text-sm">
                      {goal.currentProgress}%
                    </span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-[#141618] shadow-neu-groove overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isComplete
                          ? 'bg-[#8FBC8F]'
                          : 'bg-gradient-to-r from-[#8FBC8F] to-[#AAD8A9]'
                      }`}
                      style={{ width: `${goal.currentProgress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#686B73] my-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#A0A0A0]" /> Target: {goal.targetDate}
                  </span>
                  {goal.targetMetric && (
                    <span className="font-mono text-[#A0A0A0]">{goal.targetMetric}</span>
                  )}
                </div>
              </div>

              {/* Progress Adjusters */}
              <div className="pt-4 border-t border-[#282a30] flex items-center justify-between gap-2 mt-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleUpdateProgress(goal.id, -10)}
                    className="px-2.5 py-1 rounded-lg bg-[#1E2024] shadow-neu-subtle text-xs text-[#A0A0A0] hover:text-[#E0E0E0]"
                    title="Kurang 10%"
                  >
                    -10%
                  </button>
                  <button
                    onClick={() => handleUpdateProgress(goal.id, 10)}
                    className="px-2.5 py-1 rounded-lg bg-[#1E2024] shadow-neu-subtle text-xs text-[#8FBC8F] hover:text-[#AAD8A9]"
                    title="Tambah 10%"
                  >
                    +10%
                  </button>
                  <button
                    onClick={() => handleUpdateProgress(goal.id, 5)}
                    className="px-2.5 py-1 rounded-lg bg-[#1E2024] shadow-neu-subtle text-xs text-[#E0E0E0]"
                    title="Tambah 5%"
                  >
                    +5%
                  </button>
                </div>

                {isComplete && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-[#8FBC8F]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Tercapai
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: TAMBAH TARGET BARU */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1E2024] border border-[#282a30] rounded-2xl shadow-neu-floating p-6 space-y-4">
            <h3 className="text-sm font-semibold text-[#E0E0E0]">Buat Target Masa Depan</h3>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs text-[#A0A0A0] mb-1">Judul Target</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Menguasai P2P Mesh, Capai Berat Badan Ideal..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E2024] shadow-neu-inset text-xs text-[#E0E0E0] outline-none border-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#A0A0A0] mb-1">Kategori</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1E2024] shadow-neu-inset text-xs text-[#E0E0E0] outline-none border-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#A0A0A0] mb-1">Target Batas Waktu</label>
                  <input
                    type="date"
                    value={newTargetDate}
                    onChange={e => setNewTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1E2024] shadow-neu-inset text-xs text-[#E0E0E0] outline-none border-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#A0A0A0] mb-1">Metrik Target (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: 10 Modul / Rp 20.000.000"
                  value={newTargetMetric}
                  onChange={e => setNewTargetMetric(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E2024] shadow-neu-inset text-xs text-[#E0E0E0] outline-none border-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#A0A0A0] mb-1">Catatan / Strategi</label>
                <textarea
                  rows={2}
                  placeholder="Catatan pelaksanaan..."
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E2024] shadow-neu-inset text-xs text-[#E0E0E0] outline-none border-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-[#A0A0A0] hover:text-[#E0E0E0]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-[#1E2024] bg-[#8FBC8F] hover:bg-[#a4d2a4] rounded-xl shadow-neu-subtle"
                >
                  Simpan Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
