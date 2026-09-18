import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";

interface DarkModeToggleProps {
  onToggle: (isDark: boolean) => void;
  isDark: boolean;
}

function DarkModeToggle({ onToggle, isDark }: DarkModeToggleProps) {
  function handleToggle() {
    onToggle(!isDark);
  }

  return (
    <Button
      onClick={handleToggle}
      className={`w-10 h-10 rounded-full backdrop-blur-md shadow-lg transition-all flex items-center justify-center ${
        isDark
          ? "bg-slate-700/80 hover:bg-slate-600/80 border-2 border-red-700/50"
          : "bg-white/80 hover:bg-white border-2 border-red-300/50"
      }`}
      aria-label="Toggle dark mode"
    >
      <span className="text-xl">
        {isDark ? "☀️" : "🌙"}
      </span>
    </Button>
  );
}

export default DarkModeToggle;
