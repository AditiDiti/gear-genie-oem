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

/* ✅ TYPES (MATCHING BACKEND RESPONSE) */
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

const COLORS = ["#22c55e", "#eab308", "#f97316", "#ef4444"]

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

    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      fetch(`http://127.0.0.1:8000/${brand}/brakes/temp-performance`, { headers })
        .then((r) => r.json())
        .then((data) => {
          console.log("Brakes temp-perf:", data)
          setTempPerf(Array.isArray(data) ? data : [])
        }),

      fetch(`http://127.0.0.1:8000/${brand}/brakes/wear-distribution`, { headers })
        .then((r) => r.json())
        .then((data) => {
          console.log("Brakes distribution:", data)
          setDistribution(Array.isArray(data) ? data : [])
        }),

      fetch(`http://127.0.0.1:8000/${brand}/brakes/risk`, { headers })
        .then((r) => r.json())
        .then((data) => {
          console.log("Brakes risk:", data)
          if (data && typeof data === 'object') {
            setRisk(data as RiskSummary)
          }
        }),
    ])
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

      {/* ✅ TOP SECTION */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 40 }}>
        {/* ✅ TEMP vs WEAR */}
        <div style={cardStyle}>
          <h2>Temperature vs Brake Wear</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={tempPerf}>
              <XAxis dataKey="temperature" stroke="#cbd5f5" />
              <YAxis stroke="#cbd5f5" />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: "#e5e7eb", fontWeight: 600 }}
                formatter={(v) => [`${v}`, "Wear"]}
                cursor={{ stroke: "#9ca3af", strokeWidth: 1 }}
              />
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

        {/* ✅ WEAR DISTRIBUTION */}
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
                {(distribution || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>

              {/* ✅ FIXED TOOLTIP */}
              <Tooltip
                contentStyle={{
                  ...tooltipStyle,
                  color: "#735c5cff",
                  fontSize: 14,
                }}
                formatter={(value, name) => [
                  `${value} vehicles`,
                  name,
                ]}
                labelStyle={{ color: "#4e6ba7ff", fontWeight: 600 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ✅ RISK SUMMARY WITH PROGRESS BAR */}
      <div style={{ ...cardStyle, marginTop: 50 }}>
        <h2 style={{ textAlign: "center" }}>Brake Risk Summary</h2>

        {risk && (
          <>
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

              {/* ✅ PROGRESS BAR */}
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
                    boxShadow:
                      risk.risk === "High Risk"
                        ? "0 0 12px rgba(239,68,68,0.7)"
                        : "0 0 12px rgba(34,197,94,0.7)",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ✅ STYLES */
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
}
