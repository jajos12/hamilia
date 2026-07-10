"use client";

import { motion } from "framer-motion";

interface FloatingElement {
  shape: "square" | "circle" | "triangle" | "cross" | "ring" | "dots";
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

function ShapeRenderer({ shape, color, size }: { shape: string; color: string; size: number }) {
  switch (shape) {
    case "square":
      return (
        <div
          className="border-[3px] border-black"
          style={{ width: size, height: size, backgroundColor: color }}
        />
      );
    case "circle":
      return (
        <div
          className="rounded-full border-[3px] border-black"
          style={{ width: size, height: size, backgroundColor: color }}
        />
      );
    case "triangle":
      return (
        <div
          className="border-l-[3px] border-r-[3px] border-b-[3px] border-black"
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: size / 2,
            borderRightWidth: size / 2,
            borderBottomWidth: size,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: color,
          }}
        />
      );
    case "cross":
      return (
        <div className="relative" style={{ width: size, height: size }}>
          <div
            className="absolute top-1/2 left-0 -translate-y-1/2 bg-black"
            style={{ width: size, height: 3 }}
          />
          <div
            className="absolute left-1/2 top-0 -translate-x-1/2 bg-black"
            style={{ width: 3, height: size }}
          />
        </div>
      );
    case "ring":
      return (
        <div
          className="rounded-full border-[3px] border-black"
          style={{ width: size, height: size, backgroundColor: "transparent" }}
        />
      );
    case "dots":
      return (
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="rounded-full"
              style={{ width: 4, height: 4, backgroundColor: color }}
            />
          ))}
        </div>
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
