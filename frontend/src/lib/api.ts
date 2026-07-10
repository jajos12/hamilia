import { buildHeaders } from "@/lib/apiKeys";

// On Vercel: use relative URLs (rewrites route /api/* to backend service)
// Local dev: set NEXT_PUBLIC_API_URL=http://localhost:8000 in .env.local
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export interface Argument {
  claim: string;
  sources: string[];
  stance: "FOR" | "AGAINST";
  strength: "strong" | "moderate" | "weak";
  verification_status: "VALID" | "PARTIAL" | "INVALID";
}

export interface Source {
  title: string;
  authors: string[];
  year: number;
  url: string;
  doi: string | null;
  journal: string | null;
}

export interface DebateResponse {
  original_claim: string;
  for_arguments: Argument[];
  against_arguments: Argument[];
  crux: string;
  sources_used: Source[];
  verification_score: number;
}

export async function analyzeClaim(claim: string): Promise<DebateResponse> {
  const url = API_BASE
    ? `${API_BASE}/api/v1/analyze-claim`
    : `/api/v1/analyze-claim`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...buildHeaders() },
    body: JSON.stringify({ claim }),
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}
