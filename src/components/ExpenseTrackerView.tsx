import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Trash2,
  Calendar,
  Layers,
  FileDown,
  RefreshCw,
  PieChart,
  Tag,
  Check,
} from 'lucide-react';
import { Expense, ExpenseCategory, AutoAllocationConfig } from '../types';
import { StorageService, getCurrentCycle } from '../services/storageService';
import { ExportService } from '../services/exportService';

interface ExpenseTrackerViewProps {
  expenses: Expense[];
  categories: ExpenseCategory[];
  allocationConfig: AutoAllocationConfig;
  onRefreshExpenses: () => void;
}

export const ExpenseTrackerView: React.FC<ExpenseTrackerViewProps> = ({
  expenses,
  categories,
  allocationConfig,
  onRefreshExpenses,
}) => {
  const cycle = getCurrentCycle();

  // Modals
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // New Expense Form State
  const [amount, setAmount] = useState<string>('50000');
  const [category, setCategory] = useState<string>(categories[0]?.name || 'Makan & Minum');
  const [description, setDescription] = useState<string>('');
  const [expenseDate, setExpenseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isFixed, setIsFixed] = useState<boolean>(false);

  // Editable Allocation Config in state
  const [editableConfig, setEditableConfig] = useState<AutoAllocationConfig>(allocationConfig);

  // New Category State
  const [newCatName, setNewCatName] = useState('');
  const [newCatIsFixed, setNewCatIsFixed] = useState(false);

  // Filter expenses by current cycle (10th of this month to 9th of next month)
  const cycleExpenses = expenses.filter(e => e.cycleMonth === cycle.cycleKey);
  const totalSpentInCycle = cycleExpenses.reduce((sum, e) => sum + e.amount, 0);

  const breakdown = StorageService.calculateAllocationBreakdown(allocationConfig);
  const remainingBudget = Math.max(0, breakdown.monthlyIncome - totalSpentInCycle);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseInt(amount.replace(/[^\d]/g, ''), 10);
    if (!parsedAmount || isNaN(parsedAmount)) return;

    StorageService.addExpense({
      amount: parsedAmount,
      category,
      description: description.trim() || category,
      date: expenseDate,
      isFixed,
    });

    setAmount('50000');
    setDescription('');
    setShowAddExpenseModal(false);
    onRefreshExpenses();
  };

  const handleDeleteExpense = (id: string) => {
    StorageService.deleteExpense(id);
    onRefreshExpenses();
  };

  const handleSaveAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveAllocationConfig(editableConfig);
    setShowAllocationModal(false);
    onRefreshExpenses();
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    StorageService.addCategory(newCatName.trim(), newCatIsFixed);
    setNewCatName('');
    onRefreshExpenses();
  };

  const handleDeleteCategory = (id: string) => {
    StorageService.deleteCategory(id);
    onRefreshExpenses();
  };

  // Simulate Date 10 Cycle Reset & PDF Export as per PDF Section 9
  const handleSimulateCycle10Reset = () => {
    const confirm = window.confirm(
      `Siklus Tanggal 10: Sistem akan melakukan reset auto-allocation untuk siklus baru dan mengunduh rekapan PDF bulan sebelumnya. Lanjutkan?`
    );
    if (confirm) {
      ExportService.exportToPDF();
      alert('Siklus Tanggal 10 berhasil dijalankan! Rekapan PDF telah diproses dan auto-allocation gaji baru telah aktif.');
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header and Core Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#1E2024] shadow-neu-convex border border-[#282a30]/50">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#E0E0E0]">Expense Tracker & Alokasi Gaji</h2>
            <span className="text-[10px] font-mono font-bold text-[#8FBC8F] bg-[#141618] px-2.5 py-0.5 rounded-full shadow-neu-subtle">
              Siklus Tanggal 10
            </span>
          </div>
          <p className="text-xs text-[#A0A0A0] mt-0.5">
            {cycle.cycleLabel} (Dihitung dari tanggal 10 setiap bulannya).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#E0E0E0] bg-[#1E2024] shadow-neu-convex hover:shadow-neu-inset rounded-xl transition-all"
            title="Kelola Kategori Beban Tetap & Harian"
          >
            <Tag className="w-3.5 h-3.5 text-[#8FBC8F]" />
            <span>Kategori</span>
          </button>

          <button
            onClick={() => setShowAllocationModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#E0E0E0] bg-[#1E2024] shadow-neu-convex hover:shadow-neu-inset rounded-xl transition-all"
            title="Atur Potongan Beban Tetap & Persentase Sisa Gaji"
          >
            <PieChart className="w-3.5 h-3.5 text-[#AAD8A9]" />
            <span>Atur Alokasi</span>
          </button>

          <button
            onClick={handleSimulateCycle10Reset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#8FBC8F] bg-[#1E2024] shadow-neu-convex hover:shadow-neu-inset rounded-xl transition-all"
            title="Simulasi Reset Siklus Tanggal 10 & Auto-Ekspor PDF"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#8FBC8F]" />
            <span>Simulasi Tgl 10</span>
          </button>

          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#1E2024] bg-[#8FBC8F] hover:bg-[#a4d2a4] rounded-xl shadow-neu-subtle active:translate-y-0.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Pengeluaran</span>
          </button>
        </div>
      </div>

      {/* THREE-COLUMN SUMMARY: INCOME / FIXED CHARGES / REMAINDER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-[#1E2024] shadow-neu-convex border border-[#282a30]/50">
          <div className="text-xs text-[#A0A0A0] mb-1">Gaji Masuk (Siklus Tgl 10)</div>
          <div className="text-2xl font-bold font-mono text-[#E0E0E0] tabular-nums">
            Rp {allocationConfig.monthlyIncome.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-[#8FBC8F] mt-2 flex items-center justify-between">
            <span>Sisa Anggaran Belum Terpakai</span>
            <span className="font-mono font-semibold">Rp {remainingBudget.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#1E2024] shadow-neu-convex border border-[#282a30]/50">
          <div className="text-xs text-[#A0A0A0] mb-1">Potongan Beban Tetap (Wajib)</div>
          <div className="text-2xl font-bold font-mono text-[#E57373] tabular-nums">
            Rp {breakdown.totalFixed.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-[#A0A0A0] mt-2 flex items-center justify-between">
            <span>SPayLater, Laptop, Gym</span>
            <span className="font-mono text-[#686B73]">Dipotong di awal</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#1E2024] shadow-neu-convex border border-[#282a30]/50">
          <div className="text-xs text-[#A0A0A0] mb-1">Total Pengeluaran Berjalan</div>
          <div className="text-2xl font-bold font-mono text-[#E0E0E0] tabular-nums">
            Rp {totalSpentInCycle.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-[#A0A0A0] mt-2 flex items-center justify-between">
            <span>{cycleExpenses.length} Transaksi Tercatat</span>
            <span className="font-mono text-[#8FBC8F]">
              {Math.round((totalSpentInCycle / allocationConfig.monthlyIncome) * 100)}% dari Gaji
            </span>
          </div>
        </div>
      </div>

      {/* AUTO-ALLOCATION SCHEME DISPLAY (AS SPECIFIED IN PDF HAL 2 & 3) */}
      <div className="p-6 rounded-2xl bg-[#1E2024] shadow-neu-convex border border-[#282a30]/50 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#8FBC8F]" />
            <h3 className="text-sm font-semibold text-[#E0E0E0]">
              Skema Alokasi Otomatis (Auto-Allocation Sisa Gaji)
            </h3>
          </div>
          <span className="text-[11px] text-[#A0A0A0]">
            Sisa Gaji Bersih: <strong className="font-mono text-[#8FBC8F]">Rp {breakdown.remainder.toLocaleString('id-ID')}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#141618]/50 border border-[#282a30] text-xs">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-[#8FBC8F]">Tabungan ({allocationConfig.remainderPercentages.savings}%)</span>
              <span className="font-mono font-bold text-[#E0E0E0]">
                Rp {breakdown.distribution.savingsAmount.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#1E2024] overflow-hidden mt-2">
              <div
                className="h-full bg-[#8FBC8F]"
                style={{ width: `${allocationConfig.remainderPercentages.savings}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-[#686B73] mt-2">Dana darurat, tabungan masa depan, investasi.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#141618]/50 border border-[#282a30] text-xs">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-[#AAD8A9]">Bensin & Transport ({allocationConfig.remainderPercentages.gas}%)</span>
              <span className="font-mono font-bold text-[#E0E0E0]">
                Rp {breakdown.distribution.gasAmount.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#1E2024] overflow-hidden mt-2">
              <div
                className="h-full bg-[#AAD8A9]"
                style={{ width: `${allocationConfig.remainderPercentages.gas}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-[#686B73] mt-2">Bahan bakar motor/mobil, parkir, servis.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#141618]/50 border border-[#282a30] text-xs">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-[#FFB3B1]">Makan & Minum ({allocationConfig.remainderPercentages.food}%)</span>
              <span className="font-mono font-bold text-[#E0E0E0]">
                Rp {breakdown.distribution.foodAmount.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#1E2024] overflow-hidden mt-2">
              <div
                className="h-full bg-[#FFB3B1]"
                style={{ width: `${allocationConfig.remainderPercentages.food}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-[#686B73] mt-2">Makan harian, belanja bahan pokok, groceries.</p>
          </div>
        </div>
      </div>

      {/* EXPENSE TRANSACTION HISTORY */}
      <div className="p-6 rounded-2xl bg-[#1E2024] shadow-neu-convex border border-[#282a30]/50 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#8FBC8F]" />
            <h3 className="text-sm font-semibold text-[#E0E0E0]">
              Riwayat Pengeluaran ({cycleExpenses.length} Catatan)
            </h3>
          </div>
          <button
            onClick={() => ExportService.exportToCSV()}
            className="flex items-center gap-1 text-xs text-[#8FBC8F] hover:underline"
          >
            <FileDown className="w-3.5 h-3.5" /> Unduh CSV
          </button>
        </div>

        <div className="space-y-2">
          {cycleExpenses.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-[#141618]/30 border border-dashed border-[#282a30] text-xs text-[#A0A0A0]">
              Belum ada pengeluaran tercatat pada siklus ini.
            </div>
          ) : (
            cycleExpenses.map(expense => (
              <div
                key={expense.id}
                className="p-3.5 rounded-xl bg-[#1E2024] shadow-neu-subtle flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-2 h-8 rounded-full ${
                      expense.isFixed ? 'bg-[#E57373]' : 'bg-[#8FBC8F]'
                    }`}
                  ></div>
                  <div className="min-w-0">
                    <div className="font-semibold text-[#E0E0E0] truncate">
                      {expense.description}
                    </div>
                    <div className="text-[11px] text-[#A0A0A0] flex items-center gap-2 mt-0.5">
                      <span>{expense.category}</span>
                      <span aria-hidden="true" className="text-[#686B73]">·</span>
                      <span className="font-mono">{expense.date}</span>
                      {expense.isFixed && (
                        <span className="text-[10px] text-[#E57373] bg-[#E57373]/10 px-1.5 py-0.2 rounded font-medium">
                          Beban Tetap
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-mono font-bold text-sm text-[#E0E0E0] tabular-nums">
                    Rp {expense.amount.toLocaleString('id-ID')}
                  </span>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="p-1.5 rounded-lg text-[#686B73] hover:text-[#E57373] transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL: TAMBAH PENGELUARAN */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1E2024] border border-[#282a30] rounded-2xl shadow-neu-floating p-6 space-y-4">
            <h3 className="text-sm font-semibold text-[#E0E0E0]">Catat Pengeluaran Baru</h3>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block text-xs text-[#A0A0A0] mb-1">Nominal (IDR)</label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="500"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E2024] shadow-neu-inset text-xs text-[#E0E0E0] outline-none border-none font-mono text-base"
                />
              </div>

              <div>
                <label className="block text-xs text-[#A0A0A0] mb-1">Kategori</label>
                <select
                  value={category}
                  onChange={e => {
                    const sel = e.target.value;
                    setCategory(sel);
                    const catObj = categories.find(c => c.name === sel);
                    if (catObj) setIsFixed(catObj.isFixed);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E2024] shadow-neu-inset text-xs text-[#E0E0E0] outline-none border-none"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name} {c.isFixed ? '(Beban Tetap)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#A0A0A0] mb-1">Deskripsi / Keterangan</label>
                <input
                  type="text"
                  placeholder="Contoh: Beli bensin, Nasi Padang siang..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E2024] shadow-neu-inset text-xs text-[#E0E0E0] outline-none border-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#A0A0A0] mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={e => setExpenseDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1E2024] shadow-neu-inset text-xs text-[#E0E0E0] outline-none border-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="fixedCheckbox"
                    checked={isFixed}
                    onChange={e => setIsFixed(e.target.checked)}
                    className="accent-[#8FBC8F]"
                  />
                  <label htmlFor="fixedCheckbox" className="text-xs text-[#A0A0A0] cursor-pointer">
                    Beban Tetap
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 text-xs text-[#A0A0A0] hover:text-[#E0E0E0]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-[#1E2024] bg-[#8FBC8F] hover:bg-[#a4d2a4] rounded-xl shadow-neu-subtle"
                >
                  Simpan Pengeluaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PENGATURAN ALOKASI OTOMATIS (EDITABLE AS PER PDF) */}
      {showAllocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#1E2024] border border-[#282a30] rounded-2xl shadow-neu-floating p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-semibold text-[#E0E0E0]">
              Konfigurasi Alokasi Otomatis Gaji
            </h3>
            <p className="text-[11px] text-[#A0A0A0]">
              Sesuai spesifikasi PDF Hal 2: Beban tetap dipotong terlebih dahulu, sisa gaji otomatis disebar ke tabungan, bensin, dan makan (sifatnya fully editable).
            </p>

            <form onSubmit={handleSaveAllocation} className="space-y-4">
              <div>
                <label className="block text-xs text-[#A0A0A0] mb-1">Total Gaji Bulanan (IDR)</label>
                <input
                  type="number"
                  step="50000"
                  value={editableConfig.monthlyIncome}
                  onChange={e => setEditableConfig({ ...editableConfig, monthlyIncome: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E2024] shadow-neu-inset text-xs text-[#E0E0E0] font-mono outline-none border-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#141618] border border-[#282a30] space-y-3">
                <span className="text-xs font-semibold text-[#E57373] block">Beban Tetap Bulanan</span>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-[#A0A0A0] mb-1">SPayLater</label>
                    <input
                      type="number"
                      value={editableConfig.fixedExpenses.spayLater}
                      onChange={e => setEditableConfig({
                        ...editableConfig,
                        fixedExpenses: { ...editableConfig.fixedExpenses, spayLater: parseInt(e.target.value, 10) || 0 },
                      })}
                      className="w-full px-2 py-1.5 rounded-lg bg-[#1E2024] shadow-neu-inset text-xs text-[#E0E0E0] font-mono outline-none border-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#A0A0A0] mb-1">Tagihan Laptop</label>
                    <input
                      type="number"
                      value={editableConfig.fixedExpenses.laptopBill}
                      onChange={e => setEditableConfig({
                        ...editableConfig,
                        fixedExpenses: { ...editableConfig.fixedExpenses, laptopBill: parseInt(e.target.value, 10) || 0 },
                      })}
                      className="w-full px-2 py-1.5 rounded-lg bg-[#1E2024] shadow-neu-inset text-xs text-[#E0E0E0] font-mono outline-none border-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#A0A0A0] mb-1">Iuran Gym</label>
                    <input
                      type="number"
                      value={editableConfig.fixedExpenses.gym}
                      onChange={e => setEditableConfig({
                        ...editableConfig,
                        fixedExpenses: { ...editableConfig.fixedExpenses, gym: parseInt(e.target.value, 10) || 0 },
                      })}
                      className="w-full px-2 py-1.5 rounded-lg bg-[#1E2024] shadow-neu-inset text-xs text-[#E0E0E0] font-mono outline-none border-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#141618] border border-[#282a30] space-y-3">
                <span className="text-xs font-semibold text-[#8FBC8F] block">Persentase Pembagian Sisa Gaji</span>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-[#A0A0A0] mb-1">Tabungan (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editableConfig.remainderPercentages.savings}
                      onChange={e => setEditableConfig({
                        ...editableConfig,
                        remainderPercentages: { ...editableConfig.remainderPercentages, savings: parseInt(e.target.value, 10) || 0 },
                      })}
                      className="w-full px-2 py-1.5 rounded-lg bg-[#1E2024] shadow-neu-inset text-xs text-[#E0E0E0] font-mono outline-none border-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#A0A0A0] mb-1">Bensin (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editableConfig.remainderPercentages.gas}
                      onChange={e => setEditableConfig({
                        ...editableConfig,
                        remainderPercentages: { ...editableConfig.remainderPercentages, gas: parseInt(e.target.value, 10) || 0 },
                      })}
                      className="w-full px-2 py-1.5 rounded-lg bg-[#1E2024] shadow-neu-inset text-xs text-[#E0E0E0] font-mono outline-none border-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#A0A0A0] mb-1">Makan (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editableConfig.remainderPercentages.food}
                      onChange={e => setEditableConfig({
                        ...editableConfig,
                        remainderPercentages: { ...editableConfig.remainderPercentages, food: parseInt(e.target.value, 10) || 0 },
                      })}
                      className="w-full px-2 py-1.5 rounded-lg bg-[#1E2024] shadow-neu-inset text-xs text-[#E0E0E0] font-mono outline-none border-none"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-[#686B73] text-right">
                  Total Persentase: {editableConfig.remainderPercentages.savings + editableConfig.remainderPercentages.gas + editableConfig.remainderPercentages.food}%
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAllocationModal(false)}
                  className="px-4 py-2 text-xs text-[#A0A0A0] hover:text-[#E0E0E0]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-[#1E2024] bg-[#8FBC8F] hover:bg-[#a4d2a4] rounded-xl shadow-neu-subtle"
                >
                  Simpan Konfigurasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KELOLA KATEGORI */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1E2024] border border-[#282a30] rounded-2xl shadow-neu-floating p-6 space-y-4">
            <h3 className="text-sm font-semibold text-[#E0E0E0]">Kelola Kategori Pengeluaran</h3>

            {/* Add Category Form */}
            <form onSubmit={handleAddCategory} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Nama kategori baru..."
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-[#1E2024] shadow-neu-inset text-xs text-[#E0E0E0] outline-none border-none"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-[#8FBC8F] text-[#1E2024] font-semibold text-xs shrink-0"
              >
                + Tambah
              </button>
            </form>

            {/* Category List */}
            <div className="max-h-60 overflow-y-auto space-y-2 pt-2">
              {categories.map(cat => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#141618] text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cat.color || '#8FBC8F' }}
                    ></span>
                    <span className="text-[#E0E0E0]">{cat.name}</span>
                    {cat.isFixed && (
                      <span className="text-[10px] text-[#E57373] bg-[#E57373]/10 px-1.5 py-0.2 rounded">
                        Beban Tetap
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-[#686B73] hover:text-[#E57373]"
                    title="Hapus Kategori"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#8FBC8F] bg-[#1E2024] shadow-neu-convex rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
