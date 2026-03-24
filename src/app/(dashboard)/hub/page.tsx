"use client";



import { AgentHub } from "@/components/hub/agent-hub";


import { useState } from "react";
import { Network, CheckSquare, DollarSign, Heart, ChevronRight, Plus, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface HubTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const TABS: HubTab[] = [
  { id: "overview", label: "Overview", icon: <Network className="h-4 w-4" /> },
  { id: "org", label: "Org Chart", icon: <Network className="h-4 w-4" /> },
  { id: "tasks", label: "Tasks", icon: <CheckSquare className="h-4 w-4" /> },
  { id: "budgets", label: "Budgets", icon: <DollarSign className="h-4 w-4" /> },
  { id: "heartbeats", label: "Heartbeats", icon: <Heart className="h-4 w-4" /> },
];

interface AgentNode {
  id: string;
  name: string;
  role: string;
  parentId?: string;
  status: "active" | "idle" | "offline";
  model: string;
  monthlyBudget?: number;
  spentToday: number;
  lastActive: string;
}

const MOCK_AGENTS: AgentNode[] = [
  { id: "ceo", name: "Michael", role: "CEO / Founder", status: "active", model: "minimax-m2.7", spentToday: 0.12, lastActive: "now" },
  { id: "aiona", name: "Aiona Edge", role: "Chief of Staff", parentId: "ceo", status: "active", model: "minimax-m2.7", spentToday: 2.47, lastActive: "now" },
  { id: "writer", name: "Content Writer", role: "Content Lead", parentId: "aiona", status: "idle", model: "kimi-k2.5", spentToday: 1.20, lastActive: "2h ago" },
  { id: "coder", name: "Code Agent", role: "Engineering", parentId: "aiona", status: "active", model: "minimax-m2.7", monthlyBudget: 200, spentToday: 8.40, lastActive: "now" },
  { id: "marketer", name: "Marketing Agent", role: "Growth", parentId: "aiona", status: "offline", model: "kimi-k2.5", spentToday: 0, lastActive: "1d ago" },
];

interface TaskItem {
  id: string;
  title: string;
  assignedTo: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  due?: string;
}

const MOCK_TASKS: TaskItem[] = [
  { id: "t1", title: "Publish Q1 blog post", assignedTo: "writer", status: "done", priority: "high" },
  { id: "t2", title: "Fix dashboard bug", assignedTo: "coder", status: "in-progress", priority: "high", due: "today" },
  { id: "t3", title: "Schedule social posts", assignedTo: "marketer", status: "todo", priority: "medium", due: "tomorrow" },
  { id: "t4", title: "Review agent performance", assignedTo: "aiona", status: "todo", priority: "low" },
];

export default function AgentHubPage() {
  return <AgentHub />;
}
