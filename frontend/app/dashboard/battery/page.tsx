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

export default function BatteryPage() {
  const router = useRouter()

  const [tempPerf, setTempPerf] = useState<any[]>([])
  const [distribution, setDistribution] = useState<any[]>([])
  const [risk, setRisk] = useState<{ risk: string; confidence: number } | null>(
    null
  )
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
      fetch(`http://127.0.0.1:8000/${brand}/battery/temp-performance`, { headers })
        .then((r) => r.json())
        .then((data) => {
          console.log("Battery temp-perf:", data)
          if (Array.isArray(data)) {
            return data.map((i: any) => ({
              temperature: i.temp_band || i.temperature || "",
              health: Number(i.avg_battery_health_percent || i.health || 0),
            }))
          }
          return []
        }),

      fetch(`http://127.0.0.1:8000/${brand}/battery/distribution`, { headers })
        .then((r) => r.json())
        .then((data) => {
          console.log("Battery distribution:", data)
          if (Array.isArray(data)) {
            return data.map((i: any) => ({
              label: Object.values(i)[0] || "Unknown",
              value: parseInt(Object.values(i)[1]?.toString() || "0"),
            }))
          }
          return []
        }),

      fetch(`http://127.0.0.1:8000/${brand}/battery/risk`, { headers })
        .then((r) => r.json())
        .then((data) => {
          console.log("Battery risk:", data)
          if (Array.isArray(data) && data.length > 0) {
            const row = data[0]
            return {
              risk: parseInt(row.battery_issue_imminent) === 1 ? "High Risk" : "Low Risk",
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
        console.error("Failed to load battery data:", err)
        setLoading(false)
      })
      .finally(() => setLoading(false))
  }, [router])

  if (loading) return <p style={{ padding: 40 }}>Loading battery insights...</p>

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top right, #1f2933 0%, #000 65%)",
        color: "#fff",
        padding: "40px 60px",
      }}
    >
      <h1 style={{ fontSize: 34, marginBottom: 40 }}>Battery Insights</h1>

      {/* ✅ TOP ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 40 }}>
        {/* ✅ TEMP vs BATTERY HEALTH */}
        <div style={cardStyle}>
          <h2>Temperature vs Battery Health</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={tempPerf}>
              <XAxis dataKey="temperature" stroke="#8b909fff" />
              <YAxis domain={[80, 100]} stroke="#cbd5f5" />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                dataKey="health"
                stroke="#38bdf8"          // ✅ SAME BLUE AS ENGINE
                strokeWidth={3}
                dot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ✅ BATTERY HEALTH DISTRIBUTION */}
        <div style={cardStyle}>
          <h2>Battery Health Distribution</h2>
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
                {(distribution || []).map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ✅ BATTERY RISK SUMMARY (ENGINE STYLE ✅) */}
      {risk && (
        <div style={{ ...cardStyle, marginTop: 50, textAlign: "center" }}>
          <h2>Battery Risk Summary</h2>

          <div
            style={{
              fontSize: 34,
              fontWeight: 700,
              color: risk.risk === "High Risk" ? "#ef4444" : "#22c55e",
              marginTop: 16,
            }}
          >
            {risk.risk}
          </div>

          {/* ✅ CONFIDENCE BAR */}
          <div
            style={{
              marginTop: 24,
              height: 12,
              background: "rgba(255,255,255,0.12)",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${risk.confidence}%`,
                height: "100%",
                background:
                  risk.risk === "High Risk"
                    ? "linear-gradient(90deg, #ef4444, #f87171)"
                    : "linear-gradient(90deg, #22c55e, #86efac)",
                transition: "width 0.6s ease",
              }}
            />
          </div>

          <p style={{ marginTop: 12, opacity: 0.85 }}>
            Confidence: <b>{risk.confidence}%</b>
          </p>
        </div>
      )}
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
  background: "#6f7ed3ff",
  border: "1px solid #38bdf8",
  color: "#fff",
}
