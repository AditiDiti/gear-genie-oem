"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

/* ================= TYPES ================= */
type TempPerformance = {
  temperature: string
  wear: number
}

type WearDistribution = {
  label: string
  value: number
}

type RiskSummary = {
  risk: string
  confidence: number
}

/* ================= CONSTANTS ================= */
const COLORS = ["#22c55e", "#eab308", "#f97316", "#ef4444"]
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"

export default function BrakesPage() {
  const router = useRouter()

  const [tempPerf, setTempPerf] = useState<TempPerformance[]>([])
  const [distribution, setDistribution] = useState<WearDistribution[]>([])
  const [risk, setRisk] = useState<RiskSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    const brand = localStorage.getItem("brand")

    if (!token || !brand) {
      router.push("/login")
      return
    }

    if (!API_BASE) {
      setError("API base URL not configured")
      setLoading(false)
      return
    }

    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      /* 🔹 TEMP vs WEAR */
      fetch(`${API_BASE}/${brand}/brakes/temp-performance`, { headers })
        .then((r) => r.json())
        .then((data) => {
          if (!Array.isArray(data)) return []
          return data.map(
            (i: any): TempPerformance => ({
              temperature: String(i.temperature ?? i.temp_band ?? ""),
              wear: Number(i.wear ?? i.avg_brake_wear_percent ?? 0),
            })
          )
        }),

      /* 🔹 WEAR DISTRIBUTION */
      fetch(`${API_BASE}/${brand}/brakes/wear-distribution`, { headers })
        .then((r) => r.json())
        .then((data) => {
          if (!Array.isArray(data)) return []
          return data.map(
            (i: any): WearDistribution => ({
              label: String(Object.values(i)[0] ?? "Unknown"),
              value: Number(Object.values(i)[1] ?? 0),
            })
          )
        }),

      /* 🔹 RISK */
      fetch(`${API_BASE}/${brand}/brakes/risk`, { headers })
        .then((r) => r.json())
        .then((data) => {
          if (data && typeof data === "object") {
            return {
              risk: String(data.risk ?? "Unknown"),
              confidence: Number(data.confidence ?? 0),
            } as RiskSummary
          }
          return null
        }),
    ])
      .then(([t, d, r]) => {
        setTempPerf(t || [])
        setDistribution(d || [])
        setRisk(r)
      })
      .catch((err) => {
        console.error("Failed to load brake data:", err)
        setError("Failed to load brake data")
      })
      .finally(() => setLoading(false))
  }, [router])

  if (loading) return <p style={{ padding: 40 }}>Loading brake insights...</p>

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top right, #1f2933 0%, #000 65%)",
        color: "#fff",
        padding: "40px 60px",
      }}
    >
      <h1 style={{ fontSize: 34, marginBottom: 40 }}>Brake Insights</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* TOP SECTION */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 40 }}>
        {/* TEMP vs WEAR */}
        <div style={cardStyle}>
          <h2>Temperature vs Brake Wear</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={tempPerf}>
              <XAxis dataKey="temperature" stroke="#cbd5f5" />
              <YAxis stroke="#cbd5f5" />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="wear"
                stroke="#38bdf8"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* WEAR DISTRIBUTION */}
        <div style={cardStyle}>
          <h2>Brake Wear Distribution</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={distribution}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={95}
                label
              >
                {distribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RISK SUMMARY */}
      {risk && (
        <div style={{ ...cardStyle, marginTop: 50 }}>
          <h2 style={{ textAlign: "center" }}>Brake Risk Summary</h2>

          <div
            style={{
              marginTop: 22,
              fontSize: 34,
              fontWeight: 700,
              textAlign: "center",
              color: risk.risk === "High Risk" ? "#ef4444" : "#22c55e",
            }}
          >
            {risk.risk}
          </div>

          <div style={{ marginTop: 30 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 14,
                opacity: 0.8,
                marginBottom: 8,
              }}
            >
              <span>Confidence</span>
              <span>{risk.confidence}%</span>
            </div>

            <div
              style={{
                height: 12,
                width: "100%",
                background: "#020617",
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid #1e293b",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${risk.confidence}%`,
                  background:
                    risk.risk === "High Risk"
                      ? "linear-gradient(90deg, #ef4444, #b91c1c)"
                      : "linear-gradient(90deg, #22c55e, #16a34a)",
                  transition: "width 0.6s ease",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ================= STYLES ================= */
const cardStyle = {
  background: "rgba(2,6,23,0.85)",
  borderRadius: 18,
  padding: 30,
  boxShadow: "0 0 35px rgba(56,189,248,0.35)",
}

const tooltipStyle = {
  background: "#677098ff",
  border: "1px solid #38bdf8",
  boxShadow: "0 0 20px rgba(56,189,248,0.6)",
  color: "#fff",
}
