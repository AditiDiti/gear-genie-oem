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

/* ✅ COLORS */
const COLORS = ["#22c55e", "#eab308", "#f97316", "#ef4444"]

type TempPerf = {
  temperature: string
  performance: number
}

type DistributionItem = {
  label: string
  value: number
}

type RiskSummary = {
  risk: string
  confidence: number
}

export default function EnginePage() {
  const router = useRouter()

  const [tempPerf, setTempPerf] = useState<TempPerf[]>([])
  const [distribution, setDistribution] = useState<DistributionItem[]>([])
  const [risk, setRisk] = useState<RiskSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const brand = localStorage.getItem("brand")

    if (!token || !brand) {
      router.push("/login")
      return
    }

    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      /* ✅ TEMP vs PERFORMANCE */
      fetch(`http://127.0.0.1:8000/${brand}/engine/temp-performance`, { headers })
        .then(r => r.json())
        .then(data => {
          console.log("Engine temp-perf:", data)
          if (Array.isArray(data)) {
            return data.map((i: any) => ({
              temperature: i.temp_band || i.temperature || "",
              performance: Number(i.avg_engine_performance_percent || i.performance || 0),
            }))
          }
          return []
        }),

      /* ✅ DISTRIBUTION */
      fetch(`http://127.0.0.1:8000/${brand}/engine/distribution`, { headers })
        .then(r => r.json())
        .then(data => {
          console.log("Engine distribution:", data)
          if (Array.isArray(data)) {
            return data.map((i: any) => ({
              label: Object.values(i)[0] || "Unknown",
              value: parseInt(Object.values(i)[1]?.toString() || "0"),
            }))
          }
          return []
        }),

      /* ✅ RISK */
      fetch(`http://127.0.0.1:8000/${brand}/engine/risk`, { headers })
        .then(r => r.json())
        .then(data => {
          console.log("Engine risk:", data)
          if (Array.isArray(data) && data.length > 0) {
            const row = data[0]
            return {
              risk: parseInt(row.engine_failure_imminent) === 1 ? "High Risk" : "Low Risk",
              confidence: Math.round(parseFloat(row.fraction) * 100),
            }
          }
          return { risk: "Unknown", confidence: 0 }
        }),
    ])
      .then(([t, d, r]) => {
        setTempPerf(t || [])
        setDistribution(d || [])
        setRisk(r)
      })
      .catch((err) => {
        console.error("Failed to load engine data:", err)
        setLoading(false)
      })
      .finally(() => setLoading(false))
  }, [router])

  if (loading) return <p style={{ padding: 40 }}>Loading engine insights...</p>

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top right, #1f2933 0%, #000 65%)",
        color: "#fff",
        padding: "40px 60px",
      }}
    >
      <h1 style={{ fontSize: 34, marginBottom: 40 }}>Engine Insights</h1>

      {/* ✅ TOP SECTION */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 40 }}>
        {/* ✅ LINE CHART */}
        <div style={cardStyle}>
          <h2>Temperature vs Performance</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={tempPerf}>
              <XAxis dataKey="temperature" stroke="#cbd5f5" />
              <YAxis stroke="#cbd5f5" />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                dataKey="performance"
                stroke="#38bdf8"
                strokeWidth={3}
                dot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ✅ PIE CHART */}
        <div style={cardStyle}>
          <h2>Performance Distribution</h2>
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
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ✅ RISK SUMMARY – SAME AS BRAKES */}
      <div
        style={{
          ...cardStyle,
          marginTop: 50,
          textAlign: "center",
        }}
      >
        <h2>Engine Risk Summary</h2>

        {risk && (
          <>
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: risk.risk === "High Risk" ? "#ef4444" : "#22c55e",
                marginTop: 20,
              }}
            >
              {risk.risk}
            </div>

            <p style={{ marginTop: 10, fontSize: 18, opacity: 0.85 }}>
              Confidence: <b>{risk.confidence}%</b>
            </p>

            {/* ✅ PROGRESS BAR */}
            <div
              style={{
                marginTop: 24,
                height: 14,
                borderRadius: 8,
                background: "#020617",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${risk.confidence}%`,
                  height: "100%",
                  background:
                    risk.risk === "High Risk"
                      ? "linear-gradient(90deg, #ef4444, #b91c1c)"
                      : "linear-gradient(90deg, #22c55e, #16a34a)",
                  transition: "width 0.6s ease",
                }}
              />
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
  background: "#6a77afff",
  border: "1px solid #38bdf8",
  color: "#fff",
}
