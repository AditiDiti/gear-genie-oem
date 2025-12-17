"use client"

import { useEffect, useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

/* ================= TYPES ================= */
type Summary = {
  fleet_health_score: number
  total_vehicles: number
}

type RankingItem = {
  brand: string
  fleet_health_score: number
  rank: number
}

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

/* ================= HELPERS ================= */
const toCamelCase = (str: string) =>
  str
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

/* ================= API BASE ================= */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"

export default function DashboardPage() {
  const router = useRouter()

  const [summary, setSummary] = useState<Summary | null>(null)
  const [ranking, setRanking] = useState<RankingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [userBrand, setUserBrand] = useState("")

  /* ================= CHAT STATE ================= */
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi, I’m your GearGenie assistant. Ask me anything about engine, battery, brakes, fleet health or global ranking for your brand.",
    },
  ])
  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)

  /* ================= DASHBOARD DATA ================= */
  useEffect(() => {
    const token = localStorage.getItem("token")
    const brand = localStorage.getItem("brand")

    if (!token || !brand) {
      router.push("/login")
      return
    }

    setUserBrand(brand)

    if (!API_BASE) {
      console.error("API base URL not configured")
      return
    }

    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      fetch(`${API_BASE}/${brand}/summary`, { headers }).then((r) => r.json()),
      fetch(`${API_BASE}/ranking`, { headers })
        .then((r) => r.json())
        .then((d) => d.ranking ?? []),
    ])
      .then(([s, r]) => {
        setSummary(s)
        setRanking(r)
      })
      .catch((err) => {
        console.error("Dashboard load failed:", err)
      })
      .finally(() => setLoading(false))
  }, [router])

  if (loading) return <p style={{ padding: 40 }}>Loading dashboard...</p>

  const myBrand =
    (typeof window !== "undefined"
      ? localStorage.getItem("brand")
      : "") ?? ""

  const chartData = [...ranking]
    .sort((a, b) => a.rank - b.rank)
    .map((i) => ({
      ...i,
      brandLabel: toCamelCase(i.brand),
      rank_height: 11 - i.rank,
    }))

  /* ================= CHAT HANDLER ================= */
  const handleSend = async (e: FormEvent) => {
    e.preventDefault()
    const question = chatInput.trim()
    if (!question) return

    const token = localStorage.getItem("token")

    setChatMessages((prev) => [...prev, { role: "user", content: question }])
    setChatInput("")
    setChatLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          brand: myBrand,
          token,
        }),
      })

      if (!res.ok) throw new Error("Chat API error")

      const data = await res.json()

      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ])
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, the assistant is temporarily unavailable. Please try again.",
        },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  /* ================= UI ================= */
  return (
    <div
      style={{
        minHeight: "100vh",
        color: "#fff",
        background:
          "radial-gradient(circle at top right, #1f2933 0%, #000 65%)",
      }}
    >
      {/* TOP BAR */}
      <div style={{ padding: "18px 40px", textAlign: "right", opacity: 0.9 }}>
        Hello Team {myBrand.toUpperCase()}
      </div>

      {/* HERO */}
      <section
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "70px 90px",
          flexWrap: "wrap",
          gap: 40,
        }}
      >
        <div style={{ padding: 30, borderRadius: 18 }}>
          <div style={{ fontSize: 22, opacity: 0.7 }}>
            Fleet Health Score
          </div>
          <div style={{ fontSize: 72, fontWeight: 800 }}>
            {summary?.fleet_health_score}
          </div>

          <div style={{ marginTop: 30 }}>
            <div style={{ fontSize: 22, opacity: 0.7 }}>Vehicles</div>
            <div style={{ fontSize: 48, fontWeight: 600 }}>
              {summary?.total_vehicles}
            </div>
          </div>
        </div>

        <img
          src="/car.png"
          alt="car"
          style={{
            width: 520,
            filter: "drop-shadow(0 25px 45px rgba(0,0,0,0.7))",
          }}
        />
      </section>

      {/* GLOBAL RANKING */}
      <section style={{ padding: "40px 70px" }}>
        <h2 style={{ marginBottom: 25 }}>Global Ranking</h2>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <XAxis dataKey="brandLabel" stroke="#cbd5f5" />
            <YAxis
              domain={[0, 10]}
              tickFormatter={(v) => `Rank ${11 - v}`}
              stroke="#cbd5f5"
            />

            <Tooltip
              cursor={{ fill: "transparent" }}
              formatter={(_, __, p) => [
                `Rank ${p.payload.rank} • Score ${p.payload.fleet_health_score}`,
                "",
              ]}
            />

            <Bar dataKey="rank_height" radius={[10, 10, 0, 0]}>
              {chartData.map((item, index) => {
                const isMine = item.brand === myBrand
                const baseColor = isMine ? "#22c55e" : "#7aa2f7"

                return (
                  <Cell
                    key={item.brand}
                    fill={baseColor}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                )
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* BRAND RANKINGS */}
      <section style={{ padding: "40px 90px", maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "30px" }}>Brand Rankings</h2>
        <div style={{ display: "grid", gap: "15px" }}>
          {ranking.slice(0, 10).map((brand, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                padding: "20px",
                background: "#1a1f2e",
                borderRadius: "8px",
                border: userBrand.toLowerCase() === brand.brand.toLowerCase() ? "1px solid #3b82f6" : "1px solid #2d3748",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#3b82f6"
                e.currentTarget.style.background = "#1f2937"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = userBrand.toLowerCase() === brand.brand.toLowerCase() ? "#3b82f6" : "#2d3748"
                e.currentTarget.style.background = "#1a1f2e"
              }}
              onClick={() => router.push(`/${brand.brand.toLowerCase()}/summary`)}
            >
              {/* Rank Badge */}
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  background: index === 0 ? "#fbbf24" : index === 1 ? "#c0c0c0" : index === 2 ? "#cd7f32" : "#3b82f6",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "20px",
                }}
              >
                {index + 1}
              </div>

              {/* Brand Info */}
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
                  {brand.brand}
                  {userBrand.toLowerCase() === brand.brand.toLowerCase() && (
                    <span style={{ marginLeft: "10px", fontSize: "12px", color: "#3b82f6", background: "#1e3a8a", padding: "2px 8px", borderRadius: "4px" }}>
                      Your Brand
                    </span>
                  )}
                </h3>
              </div>

              {/* Score */}
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "28px", fontWeight: "bold", color: "#10b981" }}>{brand.fleet_health_score}</div>
                <div style={{ color: "#888", fontSize: "12px" }}>Health Score</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FLOATING ASSISTANT */}
      <div style={{ position: "fixed", right: 24, bottom: 24 }}>
        {assistantOpen ? (
          <div
            style={{
              width: 340,
              background: "rgba(15,23,42,0.95)",
              borderRadius: 18,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ padding: 12, fontWeight: 600 }}>
              GearGenie Assistant
            </div>

            <div style={{ flex: 1, padding: 10, overflowY: "auto" }}>
              {chatMessages.map((m, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <b>{m.role === "user" ? "You" : "AI"}:</b> {m.content}
                </div>
              ))}
              {chatLoading && <div>Thinking…</div>}
            </div>

            <form onSubmit={handleSend} style={{ padding: 10 }}>
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask something…"
                style={{ width: "100%", padding: 8 }}
              />
            </form>
          </div>
        ) : (
          <button onClick={() => setAssistantOpen(true)}>
            Ask GearGenie 💬
          </button>
        )}
      </div>
    </div>
  )
}
