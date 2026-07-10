"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, History, Database, Zap, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { FloatingElements } from "@/components/shared/FloatingElements";

const navItems = [
  { href: "/analyze", label: "Analyze", icon: Zap, color: "bg-[#FFD23F]" },
  { href: "/debate", label: "Debate", icon: Swords, color: "bg-[#FF6B6B]" },
  { href: "/history", label: "History", icon: History, color: "bg-[#88D498]" },
  { href: "/sources", label: "Sources", icon: Database, color: "bg-[#74B9FF]" },
];

const sidebarFloatingElements = [
  { shape: "square" as const, color: "#FFD23F", size: 16, x: "70%", y: "12%", rotation: 15, delay: 0, duration: 6 },
  { shape: "circle" as const, color: "#FF6B6B", size: 12, x: "80%", y: "35%", rotation: 0, delay: 0.8, duration: 7 },
  { shape: "cross" as const, color: "#88D498", size: 14, x: "65%", y: "55%", rotation: 45, delay: 1.2, duration: 5.5 },
  { shape: "triangle" as const, color: "#74B9FF", size: 18, x: "75%", y: "75%", rotation: -20, delay: 0.5, duration: 8 },
  { shape: "ring" as const, color: "#FFD23F", size: 10, x: "85%", y: "90%", rotation: 0, delay: 1.8, duration: 6.5 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[220px] border-r-[3px] border-black bg-[#FFD23F] overflow-hidden">
      {/* Floating shapes inside sidebar */}
      <FloatingElements elements={sidebarFloatingElements} />

      <div className="relative z-10 flex h-full flex-col">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center bg-black">
            <LayoutDashboard className="h-4 w-4 text-[#FFD23F]" />
          </div>
          <span className="font-display text-lg font-extrabold tracking-tight text-black">
            AGON
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/analyze" && pathname.startsWith("/analyze"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 text-sm font-bold transition-all",
                  isActive
                    ? "bg-black text-[#FFD23F] shadow-[3px_3px_0_0_#FFFDF5]"
                    : "text-black hover:bg-black/10"
                )}
              >
                <div className={cn("h-2 w-2 rounded-full", item.color, isActive && "bg-[#FFD23F]")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t-[3px] border-black px-5 py-4">
          <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-black">
            Adversarial Evidence Engine
          </p>
          <p className="font-mono text-[10px] text-black/50">
            v0.1.0
          </p>
        </div>
      </div>
    </aside>
  );
}
