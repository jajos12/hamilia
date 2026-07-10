"use client";

import { cn } from "@/lib/utils";

export interface AvatarOption {
  id: string;
  name: string;
  file: string;
  emoji: string;
}

export const AVATARS: AvatarOption[] = [
  { id: "astronaut", name: "Astronaut", file: "/models/Astronaut.vrm", emoji: "🚀" },
  { id: "baldman", name: "Baldman", file: "/models/Baldman.vrm", emoji: "🧑" },
  { id: "cactusboy", name: "CactusBoy", file: "/models/CactusBoy.vrm", emoji: "🌵" },
  { id: "coffee", name: "Coffee", file: "/models/Coffee.vrm", emoji: "☕" },
  { id: "eyesummoner", name: "EyeSummoner", file: "/models/EYESummoner.vrm", emoji: "👁️" },
  { id: "franky", name: "Franky", file: "/models/Franky.vrm", emoji: "💪" },
  { id: "froggy", name: "Froggy", file: "/models/Froggy.vrm", emoji: "🐸" },
  { id: "hotdog", name: "Hotdog", file: "/models/Hotdog.vrm", emoji: "🌭" },
];

interface AvatarPickerProps {
  label: string;
  selected: AvatarOption;
  onSelect: (avatar: AvatarOption) => void;
  accentClass: string;
}

export function AvatarPicker({
  label,
  selected,
  onSelect,
  accentClass,
}: AvatarPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="grid grid-cols-4 gap-2">
        {AVATARS.map((avatar) => (
          <button
            key={avatar.id}
            onClick={() => onSelect(avatar)}
            className={cn(
              "flex flex-col items-center gap-1 border-[3px] border-black bg-white p-2 transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#000]",
              selected.id === avatar.id
                ? cn("shadow-[3px_3px_0_0_#000]", accentClass)
                : "shadow-none"
            )}
          >
            <span className="text-2xl">{avatar.emoji}</span>
            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              {avatar.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
