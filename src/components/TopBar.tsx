import React from 'react';
import { Sparkles, FileText, Download, Laptop, Smartphone, Wifi } from 'lucide-react';
import { getCurrentCycle } from '../services/storageService';
import { ExportService } from '../services/exportService';

interface TopBarProps {
  onOpenAI: () => void;
  onOpenBlueprint: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenAI, onOpenBlueprint }) => {
  const cycle = getCurrentCycle();
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 bg-[#1E2024]/95 backdrop-blur-md border-b border-[#282a30] px-4 md:px-8 py-3.5 flex items-center justify-between">
      {/* Zone 1: Single text wordmark */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#1E2024] shadow-neu-subtle flex items-center justify-center text-[#8FBC8F] font-semibold text-sm">
          OS
        </div>
        <div>
          <h1 className="text-base md:text-lg font-semibold tracking-tight text-[#E0E0E0] leading-none">
            Obsidian Sanctuary
          </h1>
          <p className="text-[11px] text-[#A0A0A0] mt-0.5 hidden sm:block">
            Personal Multi-Purpose Command Center
          </p>
        </div>
      </div>

      {/* Zone 2: System Telemetry & Cycle Context */}
      <div className="hidden lg:flex items-center gap-4 text-xs text-[#A0A0A0]">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E2024] shadow-neu-subtle text-[#E0E0E0]">
          <span className="w-2 h-2 rounded-full bg-[#8FBC8F] animate-pulse"></span>
          <span>{cycle.cycleLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{today}</span>
          <span aria-hidden="true" className="text-[#686B73]">·</span>
          <span className="flex items-center gap-1 text-[#8FBC8F]">
            <Wifi className="w-3.5 h-3.5" /> P2P Mesh (3 Perangkat)
          </span>
        </div>
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={onOpenBlueprint}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#E0E0E0] bg-[#1E2024] shadow-neu-convex hover:shadow-neu-inset active:shadow-neu-inset rounded-lg transition-all duration-150"
          title="Buka Dokumen Arsitektur & Antigravity IDE Blueprint"
        >
          <FileText className="w-3.5 h-3.5 text-[#8FBC8F]" />
          <span className="hidden sm:inline">Blueprint Arsitektur</span>
        </button>

        <div className="relative group">
          <button
            onClick={() => ExportService.exportToPDF()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#E0E0E0] bg-[#1E2024] shadow-neu-convex hover:shadow-neu-inset active:shadow-neu-inset rounded-lg transition-all duration-150"
            title="Ekspor Laporan Bulanan (PDF / Cetak)"
          >
            <Download className="w-3.5 h-3.5 text-[#8FBC8F]" />
            <span className="hidden md:inline">Ekspor PDF</span>
          </button>
        </div>

        <button
          onClick={onOpenAI}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-[#1E2024] bg-[#8FBC8F] hover:bg-[#a4d2a4] rounded-lg shadow-neu-subtle active:translate-y-0.5 transition-all duration-150"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#1E2024]" />
          <span>Gemini AI</span>
        </button>
      </div>
    </header>
  );
};
