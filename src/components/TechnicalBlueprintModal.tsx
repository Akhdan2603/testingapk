import React, { useState } from 'react';
import { FileText, Copy, Check, X, Download, Shield, Cpu, Database, Network } from 'lucide-react';

interface TechnicalBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TechnicalBlueprintModal: React.FC<TechnicalBlueprintModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const blueprintMarkdown = `# TECHNICAL SPECIFICATION & IMPLEMENTATION BLUEPRINT
## Personal Multi-Purpose Command Center ("Obsidian Sanctuary")
### Source of Truth: PDF Specification + Google Stitch Design System

---

### 1. EXECUTIVE SUMMARY
Aplikasi "Personal Multi-Purpose Command Center" adalah sistem operasi produktivitas mandiri (self-hosted / offline-first) yang menggabungkan:
1. To-Do List & Pomodoro Timer (overdue auto-carry over, presisi batas waktu, preset durasi permanen).
2. Goals (Pelacakan progres masa depan 0-100%).
3. Expense Tracker (Siklus pengeluaran bulanan tgl 10, auto-allocation beban tetap & sisa gaji).
4. Gym Tracker (6 rutinitas preloaded, panduan form via tooltip, perbandingan minggu lalu statis di atas kotak input).
5. Jam Mengajar (3 aksi: set permanen, edit jam, hapus jam; murni indikator visual tanpa kalkulasi gaji).
6. Alarm & Notifikasi Lokal (Bangun tidur serentak 2 HP + 1 Laptop; reminder lokal).
7. In-App Gemini AI Automation (Teks standar, draft pop-up wajib konfirmasi, red warning bila bentrok).
8. P2P Sync & Conflict Management (SQLite local mesh tanpa server berbayar/kartu kredit, dual-version preservation).
9. PDF & CSV Export (Laporan bulanan otomatis dan manual).

---

### 2. PDF REQUIREMENT ANALYSIS
- Data & Sync: Privat, offline accessible (bahkan saat laptop mati), sinkronisasi 2 HP + 1 Laptop tanpa cloud berbayar/kartu kredit via SQLite & P2P.
- To-Do: Tugas melewati batas waktu (time limit) berubah merah dan otomatis carry-over ke hari berikutnya.
- Pomodoro: Terintegrasi langsung dengan tiap tugas, preset default (45m belajar, 60m kerja) persisten.
- Gym: Sangat detail (gerakan, set, rep, istirahat, panduan form pop-up/tooltip). Preloaded: Seated Calf Raise (soleus stretch), Suitcase Carry, Side Plank, Incline Treadmill, Dead Hang (dekompresi), Forearm/Brachialis. Perbandingan minggu lalu diletakkan sebagai teks statis abu-abu tepat di atas input.
- Jam Mengajar: 3 aksi (set permanen, edit spesifik, hapus). Murni indikator visual. Bentrok jadwal dari AI menghasilkan Warning Merah (tetap disimpan, hak di tangan user).
- Expense & Auto-Allocation: Siklus tgl 10. Tanggal 10 otomatis reset & ekspor PDF rekapan bulan lalu. Potong beban tetap (SPayLater, laptop, gym), sisa disebar ke tabungan, bensin, makan (persentase editable).
- Alarms: Bangun tidur berdering serentak di 3 perangkat (2 HP + 1 laptop).

---

### 3. GOOGLE STITCH DESIGN SPECIFICATION ("Obsidian Sanctuary")
- Background: #1E2024 (Slate Substrate)
- Shadow Dark: #141618 (-135° illumination)
- Shadow Light: #282A30 (Diffuse highlight)
- Accent: #8FBC8F (Sage Green)
- Warning: #E57373 (Muted Red)
- Text: #E0E0E0 (Primary), #A0A0A0 (Secondary), #686B73 (Muted)
- Surfaces: Extruded (cards), Sunken/Inset (inputs/checkboxes), Floating (pill dock).

---

### 4. RECONCILIATION: PDF × STITCH
- MATCHED: Dark mode default, To-Do overview & running expenses di dashboard, tooltip panduan form gym, progress bar goals 0-100%, mobile dock + desktop rail.
- PDF ONLY (Architecturally Added): Siklus tgl 10 reset logic, auto-allocation formula, carry-over date tracking, P2P mesh state indicator, dual-version conflict record.
- STITCH ONLY: Neumorphic token system, layout rhythm, tabular numeric alignment.

---

### 5. DATA SCHEMA (SQLite / Local Engine)
- Todo: { id, title, date, timeLimit, completed, priority, isOverdue, carriedOverFrom, createdAt, updatedAt }
- Goal: { id, title, category, targetDate, currentProgress, targetMetric, notes }
- Expense: { id, date, amount, category, description, isFixed, cycleMonth }
- AutoAllocationConfig: { monthlyIncome, fixedExpenses: { spayLater, laptopBill, gym }, remainderPercentages: { savings, gas, food }, lastResetCycle }
- GymExercise: { id, name, targetMuscle, advancedFormCue, defaultSets, defaultReps, defaultRestSeconds }
- GymSessionRecord: { id, exerciseId, exerciseName, date, sets: [{ setNumber, reps, weightKg, completed }], restSeconds, previousWeekReference, notes }
- TeachingSchedule: { id, day, startTime, endTime, subject, room, isPermanent, notes }
- AlarmItem: { id, label, time, type, isSyncedAllDevices, enabled, days }
- SyncConflict: { id, entityType, entityId, versionA, versionB, detectedAt, resolved }

---

### 6. AI WORKFLOW & SAFETY CONTRACT
1. User Text Input -> No voice-to-text.
2. Server Proxy / Gemini API -> Intent classification + structured JSON extraction.
3. Teaching Schedule Conflict Check -> Overlap detection with permanent slots.
4. Draft Proposal Pop-up -> Visual Warning Merah if conflict detected.
5. User Confirmation & Editing -> Data ONLY written to local SQLite after explicit user click.

---

### 7. P2P SYNC & CONFLICT MANAGEMENT
- Conflict Rule: Zero silent data loss.
- Detection: Vector timestamp / modification divergence across devices.
- Storage: System preserves Version A and Version B simultaneously in SyncConflict table.
- Resolution: Interactive UI side-by-side modal. User explicitly commits winner.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(blueprintMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-3xl bg-[#1E2024] border border-[#282a30] rounded-2xl shadow-neu-floating p-6 space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#282a30] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1E2024] shadow-neu-subtle flex items-center justify-center text-[#8FBC8F]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#E0E0E0]">
                Technical Product Specification & Antigravity IDE Blueprint
              </h3>
              <p className="text-[11px] text-[#A0A0A0]">Source of Truth Teknis: PDF + Google Stitch</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1E2024] bg-[#8FBC8F] hover:bg-[#a4d2a4] rounded-xl transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin untuk Antigravity'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#A0A0A0] hover:text-[#E0E0E0]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#141618] rounded-xl border border-[#282a30] text-xs font-mono text-[#E0E0E0] leading-relaxed space-y-4">
          <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-[#E0E0E0]">
            {blueprintMarkdown}
          </pre>
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-[#686B73]">
          <span>Obsidian Sanctuary OS · Validated for Antigravity IDE Implementation</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#1E2024] text-[#E0E0E0] hover:bg-[#282a30]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
