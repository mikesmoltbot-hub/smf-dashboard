"use client";

import { QuickStats } from "@/components/quick-stats";
import { CoffeeBriefing } from "@/components/coffee-briefing";
import { TaskKanban } from "@/components/task-kanban";
import { AgentGrid } from "@/components/agent-grid";
import { SkillsExplorer } from "@/components/skills-explorer";

export default function DashboardPage() {
  return (
    <div className="flex-1 overflow-auto p-6">
      {/* Quick Stats */}
      <div className="mb-6">
        <QuickStats />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Coffee Briefing */}
        <div className="lg:col-span-1">
          <CoffeeBriefing />
        </div>

        {/* Right Column - Tasks Kanban */}
        <div className="lg:col-span-2">
          <TaskKanban />
        </div>

        {/* Full Width - Agent Grid */}
        <div className="lg:col-span-2">
          <AgentGrid />
        </div>

        {/* Full Width - Skills Explorer */}
        <div className="lg:col-span-1">
          <SkillsExplorer />
        </div>
      </div>
    </div>
  );
}
