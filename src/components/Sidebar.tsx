import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  Wallet,
  Dumbbell,
  GraduationCap,
  Bell,
  RefreshCw,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'todos'
  | 'goals'
  | 'expenses'
  | 'gym'
  | 'schedule'
  | 'alarms'
  | 'sync';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  overdueCount?: number;
  conflictCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  overdueCount = 0,
  conflictCount = 0,
}) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'Dasbor Utama', icon: LayoutDashboard },
    { id: 'todos' as TabType, label: 'To-Do & Pomodoro', icon: CheckSquare, badge: overdueCount > 0 ? overdueCount : undefined, badgeColor: 'bg-[#E57373]' },
    { id: 'goals' as TabType, label: 'Goals & Target', icon: Target },
    { id: 'expenses' as TabType, label: 'Expense Tracker', icon: Wallet },
    { id: 'gym' as TabType, label: 'Gym Tracker', icon: Dumbbell },
    { id: 'schedule' as TabType, label: 'Jam Mengajar', icon: GraduationCap },
    { id: 'alarms' as TabType, label: 'Alarm & Notifikasi', icon: Bell },
    { id: 'sync' as TabType, label: 'P2P Sync & Konflik', icon: RefreshCw, badge: conflictCount > 0 ? conflictCount : undefined, badgeColor: 'bg-[#E57373]' },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR RAIL */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1E2024] border-r border-[#282a30] p-4 shrink-0 select-none">
        <div className="text-xs uppercase tracking-wider font-semibold text-[#686B73] px-3 mb-3">
          Command Rail
        </div>

        <nav className="space-y-1.5 flex-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-[#8FBC8F] bg-[#1E2024] shadow-neu-inset'
                    : 'text-[#A0A0A0] hover:text-[#E0E0E0] hover:bg-[#282a30]/30 shadow-none'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-[#1E2024] text-[#8FBC8F] shadow-neu-groove'
                        : 'text-[#A0A0A0]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full text-white ${item.badgeColor || 'bg-[#8FBC8F]'}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Rail Info */}
        <div className="p-3 rounded-xl bg-[#1E2024] shadow-neu-subtle border border-[#282a30]/40 text-xs">
          <div className="flex items-center justify-between text-[#A0A0A0] mb-1">
            <span>P2P Sync State</span>
            <span className="text-[#8FBC8F]">Tersinkron</span>
          </div>
          <div className="text-[11px] text-[#686B73]">
            2 HP + 1 Laptop terkoneksi via Local Mesh SQLite.
          </div>
        </div>
      </aside>

      {/* MOBILE FLOATING BOTTOM DOCK */}
      <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-[420px]">
        <div className="flex items-center justify-around bg-[#1E2024]/95 backdrop-blur-lg border border-[#282a30] rounded-full p-2 shadow-neu-floating">
          {navItems.slice(0, 5).map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative flex flex-col items-center justify-center p-2 rounded-full transition-all ${
                  isActive
                    ? 'text-[#8FBC8F] bg-[#1E2024] shadow-neu-inset scale-105'
                    : 'text-[#A0A0A0] hover:text-[#E0E0E0]'
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5" />
                {item.badge !== undefined && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#E57373]"></span>
                )}
              </button>
            );
          })}

          {/* Quick Menu Toggle for Remaining Tabs */}
          <div className="relative group">
            <button
              onClick={() => onSelectTab(activeTab === 'schedule' ? 'alarms' : 'schedule')}
              className={`flex flex-col items-center justify-center p-2 rounded-full transition-all ${
                activeTab === 'schedule' || activeTab === 'alarms' || activeTab === 'sync'
                  ? 'text-[#8FBC8F] bg-[#1E2024] shadow-neu-inset'
                  : 'text-[#A0A0A0]'
              }`}
              title="Fitur Lainnya (Jadwal, Alarm, Sync)"
            >
              <GraduationCap className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
