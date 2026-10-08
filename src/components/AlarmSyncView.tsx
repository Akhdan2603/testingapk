import React, { useState } from 'react';
import {
  Bell,
  Clock,
  Laptop,
  Smartphone,
  Volume2,
  VolumeX,
  Plus,
  CheckCircle2,
  AlertCircle,
  Radio,
} from 'lucide-react';
import { AlarmItem, DeviceInfo } from '../types';
import { StorageService } from '../services/storageService';

interface AlarmSyncViewProps {
  alarms: AlarmItem[];
  devices: DeviceInfo[];
  onRefreshAlarms: () => void;
}

export const AlarmSyncView: React.FC<AlarmSyncViewProps> = ({
  alarms,
  devices,
  onRefreshAlarms,
}) => {
  const [isPlayingTestTone, setIsPlayingTestTone] = useState(false);
  const [activeAlarmTestLabel, setActiveAlarmTestLabel] = useState<string | null>(null);

  // Audio Context Tone Synthesizer for Synchronized Alarm Sound
  const playSynchronizedAlarmSound = (label: string) => {
    setActiveAlarmTestLabel(label);
    setIsPlayingTestTone(true);

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;

      // Play chime sequence: C5 - E5 - G5 - C6
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.25);
        gain.gain.setValueAtTime(0.2, now + i * 0.25);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.25 + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + i * 0.25);
        osc.stop(now + i * 0.25 + 0.45);
      });

      setTimeout(() => {
        setIsPlayingTestTone(false);
        setActiveAlarmTestLabel(null);
      }, 1500);
    } catch (e) {
      console.warn('AudioContext failed:', e);
      setIsPlayingTestTone(false);
    }
  };

  const handleToggle = (id: string) => {
    StorageService.toggleAlarm(id);
    onRefreshAlarms();
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#1E2024] shadow-neu-convex border border-[#282a30]/50">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#E0E0E0]">Alarm & Notifikasi Lokal</h2>
            <span className="text-[10px] font-semibold text-[#8FBC8F] bg-[#141618] px-2.5 py-0.5 rounded-full">
              Sinkronisasi 3 Perangkat
            </span>
          </div>
          <p className="text-xs text-[#A0A0A0] mt-0.5">
            Sesuai PDF Hal 3: Alarm bangun tidur (pagi/tidur siang) dibunyikan serentak di 2 HP dan 1 Laptop. Reminder lainnya berupa notifikasi push standar.
          </p>
        </div>

        <button
          onClick={() => playSynchronizedAlarmSound('Simulasi Alarm Pagi')}
          disabled={isPlayingTestTone}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#1E2024] bg-[#8FBC8F] hover:bg-[#a4d2a4] rounded-xl shadow-neu-subtle active:translate-y-0.5 transition-all self-start sm:self-auto"
        >
          {isPlayingTestTone ? <Volume2 className="w-4 h-4 animate-bounce" /> : <Volume2 className="w-4 h-4" />}
          <span>{isPlayingTestTone ? 'Membunyikan Serentak...' : 'Tes Bunyi Serentak'}</span>
        </button>
      </div>

      {/* DEVICE MESH STATUS (2 HP + 1 LAPTOP) */}
      <div className="p-6 rounded-2xl bg-[#1E2024] shadow-neu-convex border border-[#282a30]/50 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#8FBC8F] animate-pulse" />
            <h3 className="text-sm font-semibold text-[#E0E0E0]">Status Mesh Sinkronisasi Alarm Perangkat</h3>
          </div>
          <span className="text-xs text-[#8FBC8F] font-mono">3 / 3 Terhubung</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {devices.map(dev => (
            <div
              key={dev.id}
              className={`p-4 rounded-xl bg-[#141618]/50 border transition-all ${
                isPlayingTestTone ? 'border-[#8FBC8F] bg-[#8FBC8F]/5' : 'border-[#282a30]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-[#E0E0E0] text-xs font-semibold">
                  {dev.type === 'laptop' ? <Laptop className="w-4 h-4 text-[#8FBC8F]" /> : <Smartphone className="w-4 h-4 text-[#8FBC8F]" />}
                  <span className="truncate">{dev.name}</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#8FBC8F]"></span>
              </div>
              <div className="text-[11px] text-[#A0A0A0] flex justify-between">
                <span>OS: {dev.os}</span>
                <span className="font-mono text-[#686B73]">{dev.lastSync}</span>
              </div>
              {isPlayingTestTone && (
                <div className="mt-2 text-[10px] text-[#8FBC8F] font-mono flex items-center gap-1">
                  <Volume2 className="w-3 h-3" /> Membunyikan nada serentak...
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* LIST OF ALARMS */}
      <div className="space-y-4">
        <div className="text-xs font-semibold text-[#A0A0A0] px-1">
          Daftar Alarm & Pengingat Aktif:
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alarms.map(alarm => (
            <div
              key={alarm.id}
              className={`p-6 rounded-2xl bg-[#1E2024] shadow-neu-convex border transition-all flex flex-col justify-between ${
                alarm.enabled ? 'border-[#282a30]/80' : 'border-[#282a30]/30 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                      alarm.isSyncedAllDevices
                        ? 'bg-[#8FBC8F]/10 text-[#8FBC8F] border border-[#8FBC8F]/30'
                        : 'bg-[#141618] text-[#A0A0A0]'
                    }`}
                  >
                    {alarm.isSyncedAllDevices ? 'Serentak 3 Perangkat' : 'Push Lokal Standar'}
                  </span>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => handleToggle(alarm.id)}
                    className={`w-11 h-6 rounded-full transition-colors p-1 flex items-center ${
                      alarm.enabled ? 'bg-[#8FBC8F]' : 'bg-[#141618] shadow-neu-groove'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        alarm.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    ></div>
                  </button>
                </div>

                <div className="my-2">
                  <span className="text-3xl font-bold font-mono text-[#E0E0E0] tabular-nums tracking-tight">
                    {alarm.time}
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-[#E0E0E0] mt-1">{alarm.label}</h4>

                <div className="text-[11px] text-[#686B73] mt-2">
                  Hari: {alarm.days.join(', ')}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#282a30] flex items-center justify-between mt-4">
                <button
                  onClick={() => playSynchronizedAlarmSound(alarm.label)}
                  className="flex items-center gap-1.5 text-xs text-[#8FBC8F] hover:underline"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Uji Bunyi
                </button>

                <span className="text-[11px] text-[#A0A0A0]">
                  {alarm.enabled ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
