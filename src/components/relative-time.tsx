"use client";

import { useState, useEffect } from "react";

function formatAgo(ms: number): string {
  if (!ms) return "—";
  const diff = Date.now() - ms;
  if (diff < 0) return "just now";
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function RelativeTime({ timestamp }: { timestamp: number }) {
  const [text, setText] = useState(() => formatAgo(timestamp));

  useEffect(() => {
    const update = () => setText(formatAgo(timestamp));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [timestamp]);

  return <span>{text}</span>;
}
