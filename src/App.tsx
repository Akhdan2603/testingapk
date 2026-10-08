/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storageService';
import {
  Todo,
  Goal,
  Expense,
  ExpenseCategory,
  AutoAllocationConfig,
  TeachingSchedule,
  GymSessionRecord,
  AlarmItem,
  DeviceInfo,
  SyncConflict,
} from './types';
import { TopBar } from './components/TopBar';
import { Sidebar, TabType } from './components/Sidebar';
import { HomeDashboard } from './components/HomeDashboard';
import { TodoPomodoroView } from './components/TodoPomodoroView';
import { GoalsView } from './components/GoalsView';
import { ExpenseTrackerView } from './components/ExpenseTrackerView';
import { GymTrackerView } from './components/GymTrackerView';
import { TeachingScheduleView } from './components/TeachingScheduleView';
import { AlarmSyncView } from './components/AlarmSyncView';
import { P2PSyncView } from './components/P2PSyncView';
import { GeminiAssistantModal } from './components/GeminiAssistantModal';
import { TechnicalBlueprintModal } from './components/TechnicalBlueprintModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Application Data States
  const [todos, setTodos] = useState<Todo[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [allocationConfig, setAllocationConfig] = useState<AutoAllocationConfig>(
    StorageService.getAllocationConfig()
  );
  const [schedules, setSchedules] = useState<TeachingSchedule[]>([]);
  const [gymSessions, setGymSessions] = useState<GymSessionRecord[]>([]);
  const [alarms, setAlarms] = useState<AlarmItem[]>([]);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);

  // Modals
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState(false);

  // Initialize and load all data on mount
  useEffect(() => {
    StorageService.init();
    refreshAllData();
  }, []);

  const refreshAllData = () => {
    StorageService.processOverdueTasks();
    setTodos(StorageService.getTodos());
    setGoals(StorageService.getGoals());
    setExpenses(StorageService.getExpenses());
    setCategories(StorageService.getCategories());
    setAllocationConfig(StorageService.getAllocationConfig());
    setSchedules(StorageService.getTeachingSchedules());
    setGymSessions(StorageService.getGymSessions());
    setAlarms(StorageService.getAlarms());
    setDevices(StorageService.getDevices());
    setConflicts(StorageService.getConflicts());
  };

  // Overdue count for sidebar badge
  const overdueCount = todos.filter(t => t.isOverdue && !t.completed).length;
  const pendingConflictsCount = conflicts.filter(c => !c.resolved).length;

  return (
    <div className="min-h-screen bg-[#1E2024] text-[#E0E0E0] flex flex-col font-sans antialiased selection:bg-[#8FBC8F]/30 selection:text-white">
      {/* TOP BAR */}
      <TopBar
        onOpenAI={() => setIsAIModalOpen(true)}
        onOpenBlueprint={() => setIsBlueprintModalOpen(true)}
      />

      {/* WORKSPACE LAYOUT (DESKTOP RAIL + MAIN VIEWPORT + MOBILE DOCK) */}
      <div className="flex-1 flex w-full max-w-[1720px] mx-auto overflow-hidden">
        {/* SIDEBAR NAVIGATION */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          overdueCount={overdueCount}
          conflictCount={pendingConflictsCount}
        />

        {/* MAIN VIEWPORT */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <HomeDashboard
              todos={todos}
              expenses={expenses}
              schedules={schedules}
              gymSessions={gymSessions}
              goals={goals}
              allocationConfig={allocationConfig}
              onNavigate={setActiveTab}
              onOpenAI={() => setIsAIModalOpen(true)}
            />
          )}

          {activeTab === 'todos' && (
            <TodoPomodoroView
              todos={todos}
              onRefreshTodos={refreshAllData}
            />
          )}

          {activeTab === 'goals' && (
            <GoalsView
              goals={goals}
              onRefreshGoals={refreshAllData}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpenseTrackerView
              expenses={expenses}
              categories={categories}
              allocationConfig={allocationConfig}
              onRefreshExpenses={refreshAllData}
            />
          )}

          {activeTab === 'gym' && (
            <GymTrackerView
              gymSessions={gymSessions}
              onRefreshSessions={refreshAllData}
            />
          )}

          {activeTab === 'schedule' && (
            <TeachingScheduleView
              schedules={schedules}
              onRefreshSchedules={refreshAllData}
            />
          )}

          {activeTab === 'alarms' && (
            <AlarmSyncView
              alarms={alarms}
              devices={devices}
              onRefreshAlarms={refreshAllData}
            />
          )}

          {activeTab === 'sync' && (
            <P2PSyncView
              devices={devices}
              conflicts={conflicts}
              onRefreshData={refreshAllData}
            />
          )}
        </main>
      </div>

      {/* GEMINI AI ASSISTANT MODAL */}
      <GeminiAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onDataCommitted={refreshAllData}
      />

      {/* TECHNICAL BLUEPRINT & ANTIGRAVITY BRIEF MODAL */}
      <TechnicalBlueprintModal
        isOpen={isBlueprintModalOpen}
        onClose={() => setIsBlueprintModalOpen(false)}
      />
    </div>
  );
}
