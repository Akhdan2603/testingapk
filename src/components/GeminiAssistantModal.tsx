import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  AlertTriangle,
  CheckCircle2,
  X,
  Edit3,
  Calendar,
  Clock,
  Wallet,
  Dumbbell,
  CheckSquare,
} from 'lucide-react';
import { GeminiDraft } from '../types';
import { GeminiService } from '../services/geminiService';
import { StorageService } from '../services/storageService';

interface GeminiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataCommitted: () => void;
}

export const GeminiAssistantModal: React.FC<GeminiAssistantModalProps> = ({
  isOpen,
  onClose,
  onDataCommitted,
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeDraft, setActiveDraft] = useState<GeminiDraft | null>(null);

  // Editable draft fields
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editCategory, setEditCategory] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editDay, setEditDay] = useState('');

  if (!isOpen) return null;

  const handleProcessPrompt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    setIsLoading(true);
    try {
      const draft = await GeminiService.parseIntent(inputText.trim());
      setActiveDraft(draft);

      // Populate editable fields based on intent
      if (draft.intent === 'CREATE_TODO') {
        setEditTitle(draft.parameters.title || inputText);
        setEditDate(draft.parameters.date || new Date().toISOString().split('T')[0]);
        setEditTime(draft.parameters.timeLimit || '18:00');
      } else if (draft.intent === 'CREATE_EXPENSE') {
        setEditAmount(draft.parameters.amount || 50000);
        setEditCategory(draft.parameters.category || 'Makan & Minum');
        setEditTitle(draft.parameters.description || inputText);
      } else if (draft.intent === 'CREATE_SCHEDULE') {
        setEditSubject(draft.parameters.subject || 'Sesi Tambahan');
        setEditDay(draft.parameters.day || 'Senin');
        setEditTime(draft.parameters.startTime || '09:00');
      }
    } catch (err) {
      console.error('Failed to parse intent:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAndSave = () => {
    if (!activeDraft) return;

    if (activeDraft.intent === 'CREATE_TODO') {
      StorageService.addTodo({
        title: editTitle || activeDraft.parameters.title || inputText,
        date: editDate || activeDraft.parameters.date || new Date().toISOString().split('T')[0],
        timeLimit: editTime || activeDraft.parameters.timeLimit,
        completed: false,
        priority: 'medium',
      });
    } else if (activeDraft.intent === 'CREATE_EXPENSE') {
      StorageService.addExpense({
        amount: editAmount || activeDraft.parameters.amount || 50000,
        category: editCategory || activeDraft.parameters.category || 'Makan & Minum',
        description: editTitle || activeDraft.parameters.description || inputText,
        date: new Date().toISOString().split('T')[0],
        isFixed: false,
      });
    } else if (activeDraft.intent === 'CREATE_SCHEDULE') {
      StorageService.addTeachingSchedule({
        day: (editDay || activeDraft.parameters.day || 'Senin') as any,
        startTime: editTime || activeDraft.parameters.startTime || '09:00',
        endTime: activeDraft.parameters.endTime || '11:00',
        subject: editSubject || activeDraft.parameters.subject || 'Jadwal Baru',
        room: 'Ruang 301',
        isPermanent: false,
        notes: activeDraft.hasConflict ? `Bentrok: ${activeDraft.conflictWarning}` : 'Ditambahkan via Gemini AI',
      });
    } else if (activeDraft.intent === 'CREATE_GYM_SESSION') {
      StorageService.addGymSession({
        exerciseId: 'gym-1',
        exerciseName: activeDraft.parameters.exerciseName || 'Seated Calf Raise',
        date: new Date().toISOString().split('T')[0],
        sets: [
          { setNumber: 1, reps: activeDraft.parameters.reps || 15, weightKg: 40, completed: true },
          { setNumber: 2, reps: activeDraft.parameters.reps || 15, weightKg: 40, completed: true },
        ],
        restSeconds: activeDraft.parameters.restSeconds || 60,
        previousWeekReference: 'Sesi dicatat via Gemini Assistant',
        notes: activeDraft.parameters.targetNote || 'Form terjaga.',
      });
    }

    alert('Data berhasil disimpan ke database lokal setelah konfirmasi!');
    setActiveDraft(null);
    setInputText('');
    onDataCommitted();
    onClose();
  };

  const quickPrompts = [
    'Catat beli bensin 50 ribu',
    'Jadwal ngajar tambahan hari Senin jam 09:00 sampai 11:00', // Collision warning trigger!
    'Buat tugas periksa UTS mahasiswa batas waktu 16:00',
    'Catat latihan Seated Calf Raise regangan soleus',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-xl bg-[#1E2024] border border-[#282a30] rounded-2xl shadow-neu-floating p-6 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1E2024] shadow-neu-subtle flex items-center justify-center text-[#8FBC8F]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#E0E0E0]">Asisten Google Gemini In-App</h3>
              <p className="text-[11px] text-[#A0A0A0]">Input Teks Standar · Draft Pop-up & Validasi Wajib</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#A0A0A0] hover:text-[#E0E0E0]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Text Input (PDF: Teks Standar Tanpa Voice-to-Text) */}
        <form onSubmit={handleProcessPrompt} className="space-y-3">
          <div className="relative">
            <textarea
              rows={3}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Ketik instruksi Anda... (contoh: 'Catat beli bensin 50rb', 'Jadwal ngajar Senin jam 09:00')"
              className="w-full p-3.5 rounded-xl bg-[#1E2024] shadow-neu-inset text-xs text-[#E0E0E0] outline-none border-none resize-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-[11px] text-[#686B73]">
              Input teks murni (privat & terstruktur).
            </div>
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8FBC8F] hover:bg-[#a4d2a4] disabled:opacity-50 text-[#1E2024] font-bold text-xs shadow-neu-subtle active:translate-y-0.5 transition-all"
            >
              {isLoading ? (
                <span>Memproses Gemini...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Perintah</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Suggestion Chips */}
        {!activeDraft && (
          <div className="space-y-1.5 pt-2 border-t border-[#282a30]">
            <div className="text-[11px] text-[#686B73]">Contoh Perintah Cepat:</div>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setInputText(p)}
                  className="px-2.5 py-1 rounded-lg bg-[#141618] text-[#A0A0A0] hover:text-[#8FBC8F] text-[11px] transition-colors text-left"
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* EDITABLE DRAFT POP-UP (MANDATORY CONFIRMATION FLOW AS PER PDF SEC 9) */}
        {activeDraft && (
          <div className="p-5 rounded-xl bg-[#141618] border-2 border-[#8FBC8F]/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8FBC8F] flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" /> Draft Usulan Aksi (Wajib Konfirmasi)
              </span>
              <span className="text-[10px] text-[#A0A0A0] font-mono">
                Intent: {activeDraft.intent}
              </span>
            </div>

            {/* SCHEDULE COLLISION WARNING IN RED IF DETECTED (PDF SPEC) */}
            {activeDraft.hasConflict && (
              <div className="p-3.5 rounded-xl bg-[#E57373]/10 border-2 border-[#E57373] text-xs text-[#E57373] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  WARNING MERAH: JADWAL BENTROK DENGAN JAM MENGAJAR PERMANEN!
                </div>
                <div className="text-[11px] leading-relaxed">
                  {activeDraft.conflictWarning || 'Jadwal ini bertabrakan dengan jadwal mengajar permanen Anda.'}
                </div>
                <div className="text-[10px] text-[#A0A0A0] pt-1 italic">
                  Sesuai aturan PDF: Sistem memberikan warning visual ini, namun keputusan akhir untuk menyimpan tetap berada di tangan Anda.
                </div>
              </div>
            )}

            {/* Editable Fields depending on Intent */}
            <div className="space-y-3 text-xs">
              <div className="text-[#A0A0A0]">
                Ringkasan AI: <strong className="text-[#E0E0E0]">{activeDraft.summary}</strong>
              </div>

              {activeDraft.intent === 'CREATE_TODO' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#686B73] mb-1">Judul Tugas</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#1E2024] text-xs text-[#E0E0E0] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#686B73] mb-1">Batas Waktu</label>
                    <input
                      type="time"
                      value={editTime}
                      onChange={e => setEditTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#1E2024] text-xs text-[#E0E0E0] font-mono outline-none"
                    />
                  </div>
                </div>
              )}

              {activeDraft.intent === 'CREATE_EXPENSE' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#686B73] mb-1">Nominal (IDR)</label>
                    <input
                      type="number"
                      value={editAmount}
                      onChange={e => setEditAmount(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#1E2024] text-xs text-[#E0E0E0] font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#686B73] mb-1">Kategori</label>
                    <input
                      type="text"
                      value={editCategory}
                      onChange={e => setEditCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#1E2024] text-xs text-[#E0E0E0] outline-none"
                    />
                  </div>
                </div>
              )}

              {activeDraft.intent === 'CREATE_SCHEDULE' && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-[#686B73] mb-1">Hari</label>
                    <input
                      type="text"
                      value={editDay}
                      onChange={e => setEditDay(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-[#1E2024] text-xs text-[#E0E0E0] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#686B73] mb-1">Jam</label>
                    <input
                      type="time"
                      value={editTime}
                      onChange={e => setEditTime(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-[#1E2024] text-xs text-[#E0E0E0] font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#686B73] mb-1">Sesi / Mata Kuliah</label>
                    <input
                      type="text"
                      value={editSubject}
                      onChange={e => setEditSubject(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-[#1E2024] text-xs text-[#E0E0E0] outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons: Cancel vs Confirm and Commit */}
            <div className="flex justify-end gap-2 pt-2 border-t border-[#282a30]">
              <button
                onClick={() => setActiveDraft(null)}
                className="px-3.5 py-2 text-xs text-[#A0A0A0] hover:text-[#E0E0E0]"
              >
                Batal / Edit Ulang
              </button>
              <button
                onClick={handleConfirmAndSave}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8FBC8F] hover:bg-[#a4d2a4] text-[#1E2024] font-bold text-xs shadow-neu-subtle"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Konfirmasi & Simpan ke Database</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
