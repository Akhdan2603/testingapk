import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Clock,
  MapPin,
  Check,
  BookOpen,
} from 'lucide-react';
import { TeachingSchedule } from '../types';
import { StorageService } from '../services/storageService';

interface TeachingScheduleViewProps {
  schedules: TeachingSchedule[];
  onRefreshSchedules: () => void;
}

export const TeachingScheduleView: React.FC<TeachingScheduleViewProps> = ({
  schedules,
  onRefreshSchedules,
}) => {
  const daysOrder: TeachingSchedule['day'][] = [
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu',
    'Minggu',
  ];

  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('Semua');

  // Modal State for Add / Edit (Action 1 & 2)
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [day, setDay] = useState<TeachingSchedule['day']>('Senin');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:30');
  const [subject, setSubject] = useState('');
  const [room, setRoom] = useState('Lab Komputer 2');
  const [isPermanent, setIsPermanent] = useState(true);
  const [notes, setNotes] = useState('');

  // Conflict Testing Simulation State
  const [collisionTestTime, setCollisionTestTime] = useState('09:00');
  const [collisionTestDay, setCollisionTestDay] = useState<TeachingSchedule['day']>('Senin');
  const [detectedCollision, setDetectedCollision] = useState<TeachingSchedule | null>(null);

  const openAddModal = () => {
    setEditingId(null);
    setSubject('');
    setStartTime('08:00');
    setEndTime('10:30');
    setRoom('Lab 2');
    setIsPermanent(true);
    setNotes('');
    setShowModal(true);
  };

  const openEditModal = (sched: TeachingSchedule) => {
    setEditingId(sched.id);
    setDay(sched.day);
    setStartTime(sched.startTime);
    setEndTime(sched.endTime);
    setSubject(sched.subject);
    setRoom(sched.room);
    setIsPermanent(sched.isPermanent);
    setNotes(sched.notes || '');
    setShowModal(true);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    if (editingId) {
      // Action 2: Edit jam spesifik
      StorageService.updateTeachingSchedule(editingId, {
        day,
        startTime,
        endTime,
        subject: subject.trim(),
        room: room.trim(),
        isPermanent,
        notes: notes.trim(),
      });
    } else {
      // Action 1: Set jadwal permanen
      StorageService.addTeachingSchedule({
        day,
        startTime,
        endTime,
        subject: subject.trim(),
        room: room.trim(),
        isPermanent,
        notes: notes.trim(),
      });
    }

    setShowModal(false);
    onRefreshSchedules();
  };

  const handleDelete = (id: string) => {
    // Action 3: Hapus jam
    if (window.confirm('Hapus jam mengajar ini?')) {
      StorageService.deleteTeachingSchedule(id);
      onRefreshSchedules();
    }
  };

  const testCollision = () => {
    const conflict = schedules.find(
      s =>
        s.day === collisionTestDay &&
        collisionTestTime >= s.startTime &&
        collisionTestTime < s.endTime
    );
    setDetectedCollision(conflict || null);
  };

  const filteredSchedules =
    selectedDayFilter === 'Semua'
      ? schedules
      : schedules.filter(s => s.day === selectedDayFilter);

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#1E2024] shadow-neu-convex border border-[#282a30]/50">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#E0E0E0]">Manajemen Jam Mengajar</h2>
            <span className="text-[10px] font-semibold text-[#8FBC8F] bg-[#141618] px-2.5 py-0.5 rounded-full">
              Murni Indikator Visual (Tanpa Hitungan Gaji)
            </span>
          </div>
          <p className="text-xs text-[#A0A0A0] mt-0.5">
            3 Aksi Utama: (1) Set jadwal permanen, (2) Edit jam spesifik, (3) Hapus jam.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#1E2024] bg-[#8FBC8F] hover:bg-[#a4d2a4] rounded-xl shadow-neu-subtle active:translate-y-0.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Set Jadwal Baru</span>
        </button>
      </div>

      {/* FILTER HARI (SEGMENTED TABS) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['Semua', ...daysOrder].map(d => (
          <button
            key={d}
            onClick={() => setSelectedDayFilter(d)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              selectedDayFilter === d
                ? 'bg-[#1E2024] shadow-neu-inset text-[#8FBC8F] font-semibold'
                : 'bg-[#1E2024] shadow-neu-subtle text-[#A0A0A0] hover:text-[#E0E0E0]'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* TEACHING SCHEDULE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchedules.map(sched => (
          <div
            key={sched.id}
            className="p-6 rounded-2xl bg-[#1E2024] shadow-neu-convex border border-[#282a30]/50 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-xs font-bold font-mono text-[#8FBC8F] bg-[#141618] px-2.5 py-0.5 rounded-md">
                  {sched.day}
                </span>

                <div className="flex items-center gap-1">
                  {/* Action 2: Edit jam spesifik */}
                  <button
                    onClick={() => openEditModal(sched)}
                    className="p-1.5 text-[#A0A0A0] hover:text-[#E0E0E0] rounded-lg bg-[#1E2024] shadow-neu-subtle"
                    title="Edit Jam Spesifik"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Action 3: Hapus jam */}
                  <button
                    onClick={() => handleDelete(sched.id)}
                    className="p-1.5 text-[#686B73] hover:text-[#E57373] rounded-lg bg-[#1E2024] shadow-neu-subtle"
                    title="Hapus Jam"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-[#E0E0E0] mb-2 leading-snug">
                {sched.subject}
              </h3>

              <div className="space-y-1.5 text-xs text-[#A0A0A0] my-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#8FBC8F]" />
                  <span className="font-mono text-[#E0E0E0]">
                    {sched.startTime} - {sched.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#686B73]" />
                  <span>Ruangan: {sched.room}</span>
                </div>
              </div>

              {sched.notes && (
                <p className="text-[11px] text-[#686B73] italic border-t border-[#282a30] pt-2 mt-2">
                  {sched.notes}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-[#282a30] flex items-center justify-between text-[11px] text-[#686B73] mt-2">
              <span className="flex items-center gap-1 text-[#8FBC8F]">
                <Check className="w-3 h-3" />
                {sched.isPermanent ? 'Jadwal Mengajar Permanen' : 'Sesi Tambahan'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* SCHEDULE CONFLICT DETECTION DEMO BOX (PDF SECTION 8 & 9) */}
      <div className="p-6 rounded-2xl bg-[#1E2024] shadow-neu-convex border border-[#282a30]/50 space-y-4">
        <div className="flex items-center gap-2 text-[#E57373]">
          <AlertTriangle className="w-5 h-5 text-[#E57373]" />
          <h3 className="text-sm font-semibold text-[#E0E0E0]">
            Peringatan Jadwal Bentrok (Collision Detection)
          </h3>
        </div>
        <p className="text-xs text-[#A0A0A0]">
          Sesuai PDF Hal 3: "Jika jadwal baru dari AI bentrok dengan jam mengajar permanen, sistem hanya akan memberikan <strong>Warning Merah</strong> sebagai peringatan visual, namun tetap menyimpan jadwal tersebut (keputusan akhir tetap di tangan pengguna)."
        </p>

        {/* Conflict Simulation Controls */}
        <div className="p-4 rounded-xl bg-[#141618] border border-[#282a30] flex flex-wrap items-center gap-3 text-xs">
          <span className="text-[#A0A0A0]">Uji Bentrok Waktu:</span>
          <select
            value={collisionTestDay}
            onChange={e => setCollisionTestDay(e.target.value as any)}
            className="px-2 py-1 rounded bg-[#1E2024] text-[#E0E0E0] outline-none"
          >
            {daysOrder.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <input
            type="time"
            value={collisionTestTime}
            onChange={e => setCollisionTestTime(e.target.value)}
            className="px-2 py-1 rounded bg-[#1E2024] text-[#E0E0E0] outline-none font-mono"
          />
          <button
            onClick={testCollision}
            className="px-3 py-1 rounded-lg bg-[#8FBC8F] text-[#1E2024] font-semibold"
          >
            Deteksi Bentrok
          </button>
        </div>

        {detectedCollision ? (
          <div className="p-4 rounded-xl bg-[#E57373]/10 border-2 border-[#E57373] text-xs text-[#E57373] space-y-1">
            <div className="font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              WARNING MERAH: JADWAL BENTROK TERDETEKSI!
            </div>
            <div>
              Waktu yang dipilih ({collisionTestDay} {collisionTestTime}) bertabrakan dengan kelas permanen:{' '}
              <strong>"{detectedCollision.subject}" ({detectedCollision.startTime} - {detectedCollision.endTime})</strong> di {detectedCollision.room}.
            </div>
            <div className="text-[11px] text-[#A0A0A0] pt-1">
              Catatan Sistem: Peringatan visual diberikan, namun sistem tidak menolak entri jadwal (otoritas tetap milik pengguna).
            </div>
          </div>
        ) : (
          <div className="text-xs text-[#8FBC8F]">
            Status: Bebas bentrok untuk waktu pengujian saat ini.
          </div>
        )}
      </div>

      {/* MODAL: SET / EDIT JADWAL MENGAJAR */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1E2024] border border-[#282a30] rounded-2xl shadow-neu-floating p-6 space-y-4">
            <h3 className="text-sm font-semibold text-[#E0E0E0]">
              {editingId ? 'Edit Jam Spesifik' : 'Set Jadwal Mengajar Permanen'}
            </h3>

            <form onSubmit={handleSaveSchedule} className="space-y-4">
              <div>
                <label className="block text-xs text-[#A0A0A0] mb-1">Mata Kuliah / Sesi</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pemrograman Web & Algoritma"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E2024] shadow-neu-inset text-xs text-[#E0E0E0] outline-none border-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-[#A0A0A0] mb-1">Hari</label>
                  <select
                    value={day}
                    onChange={e => setDay(e.target.value as any)}
                    className="w-full px-2 py-2 rounded-xl bg-[#1E2024] shadow-neu-inset text-xs text-[#E0E0E0] outline-none border-none"
                  >
                    {daysOrder.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[#A0A0A0] mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-[#1E2024] shadow-neu-inset text-xs text-[#E0E0E0] font-mono outline-none border-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#A0A0A0] mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-[#1E2024] shadow-neu-inset text-xs text-[#E0E0E0] font-mono outline-none border-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#A0A0A0] mb-1">Ruangan / Lab</label>
                <input
                  type="text"
                  value={room}
                  onChange={e => setRoom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E2024] shadow-neu-inset text-xs text-[#E0E0E0] outline-none border-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#A0A0A0] mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Materi kuliah atau instruksi..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E2024] shadow-neu-inset text-xs text-[#E0E0E0] outline-none border-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="permanentCheck"
                  checked={isPermanent}
                  onChange={e => setIsPermanent(e.target.checked)}
                  className="accent-[#8FBC8F]"
                />
                <label htmlFor="permanentCheck" className="text-xs text-[#A0A0A0] cursor-pointer">
                  Tandai sebagai Jadwal Permanen (Acuan Bentrok AI)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs text-[#A0A0A0] hover:text-[#E0E0E0]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-[#1E2024] bg-[#8FBC8F] hover:bg-[#a4d2a4] rounded-xl shadow-neu-subtle"
                >
                  {editingId ? 'Simpan Perubahan Jam' : 'Simpan Jadwal Permanen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
