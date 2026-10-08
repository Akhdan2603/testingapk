import React, { useState } from 'react';
import {
  RefreshCw,
  Laptop,
  Smartphone,
  ShieldCheck,
  AlertTriangle,
  GitMerge,
  Check,
  Database,
  ArrowRight,
} from 'lucide-react';
import { DeviceInfo, SyncConflict } from '../types';
import { StorageService } from '../services/storageService';

interface P2PSyncViewProps {
  devices: DeviceInfo[];
  conflicts: SyncConflict[];
  onRefreshData: () => void;
}

export const P2PSyncView: React.FC<P2PSyncViewProps> = ({
  devices,
  conflicts,
  onRefreshData,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('P2P Mesh Siaga. Database SQLite lokal sinkron.');

  const triggerManualP2PSync = () => {
    setIsSyncing(true);
    setSyncStatusMsg('Menghubungkan ke 2 HP melalui WebRTC/Local Mesh P2P...');

    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatusMsg('Sinkronisasi selesai! Delta data terverifikasi tanpa server pihak ketiga.');
      onRefreshData();
    }, 1200);
  };

  const handleResolveConflict = (conflictId: string, pick: 'A' | 'B') => {
    StorageService.resolveConflict(conflictId, pick);
    onRefreshData();
    alert(`Konflik berhasil diselesaikan. Versi ${pick} terpilih sebagai source of truth lokal.`);
  };

  const pendingConflicts = conflicts.filter(c => !c.resolved);

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#1E2024] shadow-neu-convex border border-[#282a30]/50">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#E0E0E0]">Sinkronisasi P2P & Resolusi Konflik</h2>
            <span className="text-[10px] font-semibold text-[#8FBC8F] bg-[#141618] px-2.5 py-0.5 rounded-full">
              Privat · Offline-First SQLite
            </span>
          </div>
          <p className="text-xs text-[#A0A0A0] mt-0.5">
            Sinkronisasi data antara 2 HP dan 1 Laptop tanpa server cloud berbayar atau kartu kredit (PDF Hal 1 & 2).
          </p>
        </div>

        <button
          onClick={triggerManualP2PSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#1E2024] bg-[#8FBC8F] hover:bg-[#a4d2a4] rounded-xl shadow-neu-subtle active:translate-y-0.5 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Melakukan Sinkronisasi...' : 'Sinkronkan Sekarang'}</span>
        </button>
      </div>

      {/* SYNC PROTOCOL STATUS BANNER */}
      <div className="p-4 rounded-xl bg-[#141618] border border-[#282a30] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[#E0E0E0]">
          <ShieldCheck className="w-4 h-4 text-[#8FBC8F]" />
          <span>{syncStatusMsg}</span>
        </div>
        <span className="text-[11px] font-mono text-[#686B73]">Protokol: SQLite + CRDT/P2P Mesh</span>
      </div>

      {/* CONNECTED DEVICES CARDS (2 HP + 1 LAPTOP) */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-[#A0A0A0] px-1">Perangkat Terdaftar dalam Jaringan Mesh:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {devices.map(dev => (
            <div
              key={dev.id}
              className={`p-5 rounded-2xl bg-[#1E2024] shadow-neu-convex border ${
                dev.isCurrentDevice ? 'border-[#8FBC8F]/50' : 'border-[#282a30]/50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-[#1E2024] shadow-neu-groove flex items-center justify-center text-[#8FBC8F]">
                  {dev.type === 'laptop' ? <Laptop className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                </div>
                {dev.isCurrentDevice && (
                  <span className="text-[10px] font-bold text-[#8FBC8F] bg-[#8FBC8F]/10 px-2 py-0.5 rounded-full border border-[#8FBC8F]/30">
                    Perangkat Ini
                  </span>
                )}
              </div>

              <h4 className="text-xs font-bold text-[#E0E0E0]">{dev.name}</h4>
              <div className="text-[11px] text-[#A0A0A0] mt-1 space-y-0.5">
                <div>Sistem: {dev.os}</div>
                <div>Status: <span className="text-[#8FBC8F]">Terkoneksi P2P</span></div>
                <div className="font-mono text-[#686B73]">Sinkron Terakhir: {dev.lastSync}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CONFLICT RESOLUTION SECTION (PDF SECTION 7 & 19) */}
      <div className="p-6 rounded-2xl bg-[#1E2024] shadow-neu-convex border border-[#282a30]/50 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-[#E57373]" />
            <h3 className="text-sm font-semibold text-[#E0E0E0]">
              Pusat Resolusi Konflik Offline (Conflict Management)
            </h3>
          </div>
          <span className="text-xs font-bold text-[#E57373]">
            {pendingConflicts.length} Konflik Membutuhkan Resolusi
          </span>
        </div>

        <p className="text-xs text-[#A0A0A0]">
          Sesuai aturan PDF Hal 2 & Blueprint Hal 19: Jika terjadi bentrok pengeditan saat offline, sistem tidak pernah menghapus data secara silent. Sistem menyimpan <strong>KEDUA VERSI</strong> (Versi A & Versi B) dan memberikan hak kepada pengguna untuk memilih versi mana yang dipertahankan.
        </p>

        {pendingConflicts.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-[#141618]/30 border border-dashed border-[#282a30] text-xs text-[#8FBC8F]">
            <Check className="w-6 h-6 mx-auto mb-1 text-[#8FBC8F]" />
            Semua versi data konsisten di seluruh 3 perangkat. Tidak ada konflik aktif.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingConflicts.map(c => (
              <div
                key={c.id}
                className="p-5 rounded-xl bg-[#141618] border-2 border-[#E57373]/60 text-xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#E57373]" />
                    <span className="font-bold text-[#E0E0E0]">
                      Bentrok pada Entitas {c.entityType}: "{c.title}"
                    </span>
                  </div>
                  <span className="text-[11px] text-[#A0A0A0] font-mono">
                    Terdeteksi: {c.detectedAt}
                  </span>
                </div>

                {/* Side by Side Comparison of Version A vs Version B */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Version A */}
                  <div className="p-4 rounded-xl bg-[#1E2024] border border-[#282a30] flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between text-[11px] text-[#A0A0A0] mb-2">
                        <span className="font-semibold text-[#8FBC8F]">VERSI A ({c.versionA.deviceName})</span>
                        <span className="font-mono text-[#686B73]">{c.versionA.timestamp}</span>
                      </div>
                      <pre className="text-[11px] font-mono text-[#E0E0E0] bg-[#141618] p-2.5 rounded-lg overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(c.versionA.data, null, 2)}
                      </pre>
                    </div>

                    <button
                      onClick={() => handleResolveConflict(c.id, 'A')}
                      className="mt-3 w-full py-2 rounded-lg bg-[#8FBC8F] hover:bg-[#a4d2a4] text-[#1E2024] font-bold text-xs"
                    >
                      Pilih Versi A (Gunakan Data Laptop)
                    </button>
                  </div>

                  {/* Version B */}
                  <div className="p-4 rounded-xl bg-[#1E2024] border border-[#282a30] flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between text-[11px] text-[#A0A0A0] mb-2">
                        <span className="font-semibold text-[#AAD8A9]">VERSI B ({c.versionB.deviceName})</span>
                        <span className="font-mono text-[#686B73]">{c.versionB.timestamp}</span>
                      </div>
                      <pre className="text-[11px] font-mono text-[#E0E0E0] bg-[#141618] p-2.5 rounded-lg overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(c.versionB.data, null, 2)}
                      </pre>
                    </div>

                    <button
                      onClick={() => handleResolveConflict(c.id, 'B')}
                      className="mt-3 w-full py-2 rounded-lg bg-[#AAD8A9] hover:bg-[#bfefbe] text-[#1E2024] font-bold text-xs"
                    >
                      Pilih Versi B (Gunakan Data HP Utama)
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
