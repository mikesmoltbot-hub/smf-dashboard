"use client";

import { useState } from "react";
import { CheckSquare, Clock, CheckCircle2, Plus, MoreHorizontal } from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: "todo" | "inprogress" | "done";
  priority: "high" | "medium" | "low";
  deadline?: string;
}

const INITIAL_TASKS: Task[] = [
  { id: "1", title: "Update homepage copy", status: "todo", priority: "high", deadline: "Today" },
  { id: "2", title: "Fix checkout bug", status: "todo", priority: "high", deadline: "Tomorrow" },
  { id: "3", title: "Design landing page", status: "inprogress", priority: "medium", deadline: "Friday" },
  { id: "4", title: "Write blog post", status: "done", priority: "low" },
];

const COLUMNS = [
  { id: "todo", title: "To Do", color: "var(--danger)" },
  { id: "inprogress", title: "In Progress", color: "var(--warning)" },
  { id: "done", title: "Done", color: "var(--success)" },
] as const;

export function TaskKanban() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  const getTasksByStatus = (status: "todo" | "inprogress" | "done") =>
    tasks.filter((t) => t.status === status);

  const moveTask = (taskId: string, newStatus: "todo" | "inprogress" | "done") => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const priorityColors = {
    high: "border-l-red-500",
    medium: "border-l-yellow-500",
    low: "border-l-green-500",
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-[var(--accent)]" />
          <h3 className="font-semibold">Tasks</h3>
          <span className="rounded bg-[var(--pro)]/20 px-1.5 py-0.5 text-xs font-medium text-[var(--pro)]">
            PRO
          </span>
        </div>
        <button className="flex items-center gap-1 rounded bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors">
          <Plus className="h-4 w-4" />
          Add Task
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-3 gap-3 p-4">
        {COLUMNS.map((col) => {
          const colTasks = getTasksByStatus(col.id);
          return (
            <div
              key={col.id}
              className="rounded-lg bg-[var(--bg-hover)] p-3"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const taskId = e.dataTransfer.getData("taskId");
                if (taskId) moveTask(taskId, col.id);
              }}
            >
              {/* Column Header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: col.color }}
                  />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    {col.title}
                  </span>
                </div>
                <span className="rounded bg-[var(--bg-card)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)]">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks */}
              <div className="space-y-2">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("taskId", task.id);
                    }}
                    className={`rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3 border-l-4 ${priorityColors[task.priority]} cursor-grab active:cursor-grabbing hover:border-[var(--accent)] transition-colors`}
                  >
                    <div className="text-sm font-medium mb-2">{task.title}</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <Clock className="h-3 w-3" />
                        {task.deadline || "No deadline"}
                      </div>
                      <button className="rounded p-1 hover:bg-[var(--bg-hover)] text-[var(--text-muted)]">
                        <MoreHorizontal className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
