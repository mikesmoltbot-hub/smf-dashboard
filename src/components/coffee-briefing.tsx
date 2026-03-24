"use client";

import { useState, useEffect } from "react";
import { useDashboard } from "@/contexts/DashboardContext";
import { Cloud, Calendar, CheckSquare, TrendingUp, RefreshCw, Star, Coffee } from "lucide-react";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  deadline?: string;
}

interface BriefingData {
  weather: {
    temp: number;
    condition: string;
    location: string;
    icon: string;
  };
  meetings: number;
  tasks: Task[];
  mtdSpend: string;
}

export function CoffeeBriefing() {
  const { settings } = useDashboard();
  const [data, setData] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState(true);

  // Map weather condition code to icon
  const getWeatherIcon = (code: number): string => {
    if (code === 113) return "☀️";
    if (code >= 116 && code <= 119) return "⛅";
    if (code >= 120 && code <= 122) return "🌤️";
    if (code >= 124 && code <= 128) return "☀️";
    if (code >= 143 && code <= 176) return "🌫️";
    if (code >= 179 && code <= 182) return "🌨️";
    if (code >= 185 && code <= 200) return "🌧️";
    if (code >= 227 && code <= 248) return "❄️";
    if (code >= 260 && code <= 263) return "🌧️";
    if (code >= 266 && code <= 299) return "🌧️";
    if (code >= 302 && code <= 359) return "🌧️";
    if (code >= 362 && code <= 377) return "🌨️";
    if (code >= 386 && code <= 395) return "⛈️";
    if (code >= 398 && code <= 399) return "🌨️";
    if (code >= 500 && code <= 531) return "🌧️";
    if (code >= 600 && code <= 622) return "🌨️";
    if (code >= 701 && code <= 781) return "🌫️";
    return "🌡️";
  };

  // Fetch briefing data
  useEffect(() => {
    const fetchBriefing = async () => {
      setLoading(true);
      const location = settings.branding.weatherLocation || "New York, NY";

      // Fetch real weather from wttr.in
      let weatherData = {
        temp: 72,
        condition: "Clear",
        location: location,
        icon: "☀️",
      };

      try {
        const weatherRes = await fetch(
          `https://wttr.in/${encodeURIComponent(location)}?format=j1`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (weatherRes.ok) {
          const w = await weatherRes.json();
          const current = w.current_condition?.[0];
          if (current) {
            weatherData = {
              temp: parseInt(current.temp_F || "72"),
              condition: current.weatherDesc?.[0]?.value || "Clear",
              location: w.nearest_area?.[0]?.areaName?.[0]?.value || location,
              icon: getWeatherIcon(parseInt(current.weatherCode || "113")),
            };
          }
        }
      } catch {
        // Keep defaults on error
      }

      setData({
        weather: weatherData,
        meetings: 3,
        tasks: [
          { id: "1", text: "Review Q1 marketing report", completed: false, priority: "high" },
          { id: "2", text: "Prepare investor update", completed: true, priority: "medium" },
          { id: "3", text: "Call with engineering team", completed: false, priority: "low" },
        ],
        mtdSpend: "$47",
      });
      setLoading(false);
    };

    fetchBriefing();
  }, []);

  if (loading || !data) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-5 animate-pulse rounded bg-[var(--bg-hover)]" />
          <div className="h-5 w-32 animate-pulse rounded bg-[var(--bg-hover)]" />
        </div>
        <div className="space-y-3">
          <div className="h-20 animate-pulse rounded bg-[var(--bg-hover)]" />
          <div className="h-16 animate-pulse rounded bg-[var(--bg-hover)]" />
        </div>
      </div>
    );
  }

  const priorityColors = {
    high: "bg-red-500/20 text-red-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    low: "bg-green-500/20 text-green-400",
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
        <div className="flex items-center gap-2">
          <Coffee className="h-5 w-5 text-[var(--accent)]" />
          <h3 className="font-semibold">Coffee Briefing</h3>
          <span className="rounded bg-[var(--pro)]/20 px-1.5 py-0.5 text-xs font-medium text-[var(--pro)]">
            PRO
          </span>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="rounded p-1.5 hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors"
          title="Refresh briefing"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Weather */}
        <div className="flex items-center gap-4 border-b border-[var(--border)] pb-5 mb-5">
          <div className="text-5xl">{data.weather.icon}</div>
          <div>
            <div className="text-4xl font-bold">{data.weather.temp}°F</div>
            <div className="text-sm text-[var(--text-secondary)]">{data.weather.condition}</div>
            <div className="text-xs text-[var(--text-muted)]">{data.weather.location}</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="rounded-lg bg-[var(--bg-hover)] p-3 text-center">
            <Calendar className="mx-auto mb-1 h-4 w-4 text-[var(--text-muted)]" />
            <div className="text-xl font-bold">{data.meetings}</div>
            <div className="text-xs text-[var(--text-muted)]">Meetings</div>
          </div>
          <div className="rounded-lg bg-[var(--bg-hover)] p-3 text-center">
            <CheckSquare className="mx-auto mb-1 h-4 w-4 text-[var(--text-muted)]" />
            <div className="text-xl font-bold">
              {data.tasks.filter((t) => !t.completed).length}
            </div>
            <div className="text-xs text-[var(--text-muted)]">Open Tasks</div>
          </div>
          <div className="rounded-lg bg-[var(--bg-hover)] p-3 text-center">
            <TrendingUp className="mx-auto mb-1 h-4 w-4 text-[var(--text-muted)]" />
            <div className="text-xl font-bold">{data.mtdSpend}</div>
            <div className="text-xs text-[var(--text-muted)]">MTD Spend</div>
          </div>
        </div>

        {/* Top Tasks */}
        <div>
          <div className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
            Top Tasks
          </div>
          <div className="space-y-2">
            {data.tasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3"
              >
                <div
                  className={`h-4 w-4 rounded border-2 ${
                    task.completed
                      ? "border-green-500 bg-green-500"
                      : "border-[var(--border)]"
                  }`}
                />
                <span
                  className={`flex-1 text-sm ${
                    task.completed ? "text-[var(--text-muted)] line-through" : ""
                  }`}
                >
                  {task.text}
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                    priorityColors[task.priority]
                  }`}
                >
                  {task.priority.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
