"use client";

import { motion } from "framer-motion";

interface FloatingElement {
  shape: "square" | "circle" | "triangle" | "cross" | "ring" | "dots" | "gavel" | "scales" | "speech" | "evidence" | "lightning" | "target";
  color: string;
  size: number;
  x: string;
  y: string;
  rotation: number;
  delay: number;
  duration: number;
}

const defaultElements: FloatingElement[] = [
  { shape: "square", color: "#FFD23F", size: 24, x: "8%", y: "15%", rotation: 15, delay: 0, duration: 6 },
  { shape: "circle", color: "#FF6B6B", size: 18, x: "85%", y: "20%", rotation: 0, delay: 0.5, duration: 7 },
  { shape: "cross", color: "#88D498", size: 20, x: "92%", y: "65%", rotation: 45, delay: 1, duration: 8 },
  { shape: "triangle", color: "#74B9FF", size: 22, x: "5%", y: "70%", rotation: -20, delay: 1.5, duration: 5.5 },
  { shape: "ring", color: "#B8A9FA", size: 16, x: "75%", y: "85%", rotation: 0, delay: 0.8, duration: 6.5 },
  { shape: "square", color: "#FFA552", size: 14, x: "15%", y: "45%", rotation: 30, delay: 2, duration: 7.5 },
  { shape: "dots", color: "#000000", size: 20, x: "88%", y: "40%", rotation: 0, delay: 0.3, duration: 9 },
  { shape: "circle", color: "#FFD23F", size: 12, x: "50%", y: "10%", rotation: 0, delay: 1.2, duration: 6 },
  { shape: "cross", color: "#FF6B6B", size: 16, x: "30%", y: "90%", rotation: 20, delay: 0.7, duration: 7 },
  { shape: "ring", color: "#88D498", size: 22, x: "65%", y: "8%", rotation: 0, delay: 1.8, duration: 8.5 },
];

const debateElements: FloatingElement[] = [
  { shape: "gavel", color: "#FFD23F", size: 28, x: "5%", y: "15%", rotation: -15, delay: 0, duration: 8 },
  { shape: "scales", color: "#88D498", size: 24, x: "90%", y: "20%", rotation: 0, delay: 0.5, duration: 9 },
  { shape: "speech", color: "#FF6B6B", size: 22, x: "8%", y: "75%", rotation: 10, delay: 1, duration: 7 },
  { shape: "evidence", color: "#74B9FF", size: 20, x: "85%", y: "65%", rotation: -5, delay: 1.5, duration: 8 },
  { shape: "lightning", color: "#FFD23F", size: 18, x: "15%", y: "40%", rotation: 0, delay: 0.8, duration: 6 },
  { shape: "target", color: "#FF6B6B", size: 24, x: "80%", y: "85%", rotation: 0, delay: 1.2, duration: 7 },
  { shape: "gavel", color: "#88D498", size: 16, x: "50%", y: "10%", rotation: 20, delay: 2, duration: 9 },
  { shape: "scales", color: "#74B9FF", size: 18, x: "30%", y: "90%", rotation: -10, delay: 0.3, duration: 8 },
  { shape: "speech", color: "#FFD23F", size: 20, x: "70%", y: "45%", rotation: 5, delay: 1.8, duration: 6 },
  { shape: "evidence", color: "#FF6B6B", size: 22, x: "25%", y: "55%", rotation: 0, delay: 0.7, duration: 7 },
];

function ShapeRenderer({ shape, color, size }: { shape: string; color: string; size: number }) {
  const s = size;
  const stroke = 3;

  switch (shape) {
    case "square":
      return (
        <div className="border-[3px] border-black" style={{ width: s, height: s, backgroundColor: color }} />
      );
    case "circle":
      return (
        <div className="rounded-full border-[3px] border-black" style={{ width: s, height: s, backgroundColor: color }} />
      );
    case "triangle":
      return (
        <div
          className="border-l-[3px] border-r-[3px] border-b-[3px] border-black"
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: s / 2,
            borderRightWidth: s / 2,
            borderBottomWidth: s,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: color,
          }}
        />
      );
    case "cross":
      return (
        <div className="relative" style={{ width: s, height: s }}>
          <div className="absolute top-1/2 left-0 -translate-y-1/2 bg-black" style={{ width: s, height: 3 }} />
          <div className="absolute left-1/2 top-0 -translate-x-1/2 bg-black" style={{ width: 3, height: s }} />
        </div>
      );
    case "ring":
      return (
        <div className="rounded-full border-[3px] border-black" style={{ width: s, height: s, backgroundColor: "transparent" }} />
      );
    case "dots":
      return (
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-full" style={{ width: 4, height: 4, backgroundColor: color }} />
          ))}
        </div>
      );
    case "gavel":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{ transform: "rotate(-30deg)" }}>
          {/* Handle */}
          <rect x={10} y={4} width={4} height={14} rx={1} fill={color} stroke="#000" strokeWidth="1.5" />
          {/* Head */}
          <rect x={4} y={2} width={16} height={6} rx={1} fill={color} stroke="#000" strokeWidth="1.5" />
          <rect x={6} y={4} width={12} height={2} fill="#000" />
        </svg>
      );
    case "scales":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          {/* Stand */}
          <path d="M12 2v6M12 8v10" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
          <ellipse cx={12} cy={18} rx={6} ry={2} stroke="#000" strokeWidth="1.5" fill="transparent" />
          {/* Left pan */}
          <path d="M6 8c0-4 4-6 6-6" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx={6} cy={8} r={3} fill={color} stroke="#000" strokeWidth="1.5" />
          {/* Right pan */}
          <path d="M18 8c0-4-4-6-6-6" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx={18} cy={8} r={3} fill={color} stroke="#000" strokeWidth="1.5" />
          {/* Center */}
          <circle cx={12} cy={8} r={1.5} fill="#000" />
        </svg>
      );
    case "speech":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M21 15c0 3-3 5-7 5s-7-2-7-5" stroke="#000" strokeWidth="2" fill={color} />
          <path d="M14 15l-3 5 3-5" stroke="#000" strokeWidth="2" fill="transparent" />
        </svg>
      );
    case "evidence":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          {/* Document */}
          <rect x={3} y={3} width={18} height={18} rx={2} fill={color} stroke="#000" strokeWidth="1.5" />
          {/* Checkmark */}
          <path d="M8 12l3 3 6-6" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Lines */}
          <line x1={8} y1={7} x2={16} y2={7} stroke="#000" strokeWidth="1" opacity="0.5" />
          <line x1={8} y1={10} x2={14} y2={10} stroke="#000" strokeWidth="1" opacity="0.5" />
        </svg>
      );
    case "lightning":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <polygon points="13 2 18 14 11 14 16 22 8 12 15 12 13 2" fill={color} stroke="#000" strokeWidth="1.5" />
        </svg>
      );
    case "target":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <circle cx={12} cy={12} r={10} stroke={color} strokeWidth="2" fill="transparent" />
          <circle cx={12} cy={12} r={6} stroke={color} strokeWidth="2" fill="transparent" />
          <circle cx={12} cy={12} r={2} fill={color} />
          <line x1={12} y1={2} x2={12} y2={5} stroke={color} strokeWidth="2" />
          <line x1={12} y1={19} x2={12} y2={22} stroke={color} strokeWidth="2" />
          <line x1={2} y1={12} x2={5} y2={12} stroke={color} strokeWidth="2" />
          <line x1={19} y1={12} x2={22} y2={12} stroke={color} strokeWidth="2" />
        </svg>
      );
    default:
      return null;
  }
}

interface FloatingElementsProps {
  elements?: FloatingElement[];
  className?: string;
}

export function FloatingElements({ elements = defaultElements, className = "" }: FloatingElementsProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {elements.map((el, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: el.x, top: el.y }}
          initial={{ opacity: 0, scale: 0, rotate: el.rotation }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1, 1, 0.5],
            rotate: [el.rotation, el.rotation + 10, el.rotation - 5, el.rotation],
            y: [0, -8, 5, 0],
          }}
          transition={{
            duration: el.duration,
            delay: el.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <ShapeRenderer shape={el.shape} color={el.color} size={el.size} />
        </motion.div>
      ))}
    </div>
  );
}

export { debateElements };