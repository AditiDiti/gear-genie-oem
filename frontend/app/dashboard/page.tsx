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

/* ✅ TYPES */
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

/* ✅ HELPERS */
const toCamelCase = (str: string) =>
  str
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

export default function DashboardPage() {
  const router = useRouter()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [ranking, setRanking] = useState<RankingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // 🔹 chat state
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

  useEffect(() => {
    const token = localStorage.getItem("token")
    const brand = localStorage.getItem("brand")
    if (!token || !brand) {
      router.push("/login")
      return
    }

    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      fetch(`http://127.0.0.1:8000/${brand}/summary`, { headers }).then((r) =>
        r.json()
      ),
      fetch(`http://127.0.0.1:8000/ranking`, { headers })
        .then((r) => r.json())
        .then((d) => d.ranking ?? []),
    ]).then(([s, r]) => {
      setSummary(s)
      setRanking(r)
      setLoading(false)
    })
  }, [router])

  if (loading) return <p style={{ padding: 40 }}>Loading dashboard...</p>

  const myBrand = (typeof window !== "undefined" ? localStorage.getItem("brand") : "") ?? ""

  const chartData = [...ranking]
    .sort((a, b) => a.rank - b.rank)
    .map((i) => ({
      ...i,
      brandLabel: toCamelCase(i.brand),
      rank_height: 11 - i.rank,
    }))

  // 🔹 send question to backend /api/chat
  // 🔹 send question to backend MCP
const handleSend = async (e: FormEvent) => {
  e.preventDefault()
  const question = chatInput.trim()
  if (!question) return

  const token = localStorage.getItem("token")

  setChatMessages((prev) => [...prev, { role: "user", content: question }])
  setChatInput("")
  setChatLoading(true)

  try {
    const res = await fetch("http://127.0.0.1:8000/mcp/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        question,
        brand: myBrand,
      }),
    })

    if (!res.ok) throw new Error("MCP error")

    const data = await res.json()

    setChatMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: data.answer,
      },
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


  return (
    <div
      style={{
        minHeight: "100vh",
        color: "#fff",
        background:
          "radial-gradient(circle at top right, #1f2933 0%, #000 65%)",
      }}
    >
      {/* ✅ TOP BAR */}
      <div style={{ padding: "18px 40px", textAlign: "right", opacity: 0.9 }}>
        Hello Team {myBrand.toUpperCase()}
      </div>

      {/* ✅ HERO */}
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
        <div
          style={{
            padding: 30,
            borderRadius: 18,
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)"
            e.currentTarget.style.boxShadow =
              "0 0 35px rgba(56,189,248,0.6)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)"
            e.currentTarget.style.boxShadow = "none"
          }}
        >
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
            animation: "slideIn 1.1s ease-out forwards",
            filter: "drop-shadow(0 25px 45px rgba(0,0,0,0.7))",
          }}
        />
      </section>

      
        
      

      {/* ✅ GLOBAL RANKING */}
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
              contentStyle={{
                background: "#020617",
                border: "1px solid #38bdf8",
                color: "#fff",
                fontSize: 14,
                boxShadow: "0 0 25px rgba(56,189,248,0.8)",
              }}
              labelStyle={{
                color: "#e5f0ff",
                fontWeight: 600,
              }}
              formatter={(_, __, p) => [
                `Rank ${p.payload.rank} • Score ${p.payload.fleet_health_score}`,
                "",
              ]}
            />

            <Bar dataKey="rank_height" radius={[10, 10, 0, 0]}>
              {chartData.map((item, index) => {
                const isMine = item.brand === myBrand
                const isHover = hoveredIndex === index
                const baseColor = isMine ? "#22c55e" : "#7aa2f7"

                return (
                  <Cell
                    key={item.brand}
                    fill={baseColor}
                    style={{
                      transition: "all 0.25s ease",
                      filter: isHover
                        ? `drop-shadow(0 0 18px ${baseColor})`
                        : "none",
                      transform: isHover ? "scaleY(1.05)" : "scaleY(1)",
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                )
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* ✅ CONTACT */}
      <section
        id="contact"
        style={{
          maxWidth: 900,
          margin: "120px auto 80px",
          padding: 45,
          borderRadius: 22,
          boxShadow: "0 0 40px rgba(37,99,235,0.5)",
        }}
      >
        <h2 style={{ fontSize: 30, marginBottom: 20 }}>Contact Us</h2>
        <p style={{ fontSize: 18, opacity: 0.8 }}>
          Need assistance or deeper insights into your fleet? Our experts are
          always ready.
        </p>

        <div style={{ marginTop: 25, fontSize: 18 }}>
          <p>
            <b>Email:</b> support@geargenie.ai
          </p>
          <p>
            <b>Phone:</b> +1 (800) 456‑8890
          </p>
          <p>
            <b>Office:</b> Detroit, MI
          </p>
        </div>
      </section>

      {/* 🔹 FLOATING GEN-AI ASSISTANT */}
      <div
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: 60,
        }}
      >
        {assistantOpen ? (
          <div
            style={{
              width: 340,
              maxHeight: 460,
              background: "rgba(15,23,42,0.95)",
              borderRadius: 18,
              boxShadow: "0 0 30px rgba(56,189,248,0.6)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* header */}
            <div
              style={{
                padding: "10px 14px",
                borderBottom: "1px solid rgba(148,163,184,0.35)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 14,
              }}
            >
              <span style={{ fontWeight: 600 }}>GearGenie Assistant</span>
              <button
                onClick={() => setAssistantOpen(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#e5e7eb",
                  fontSize: 16,
                }}
              >
                ✕
              </button>
            </div>

            {/* messages */}
            <div
              style={{
                padding: "10px 12px",
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                fontSize: 13,
              }}
            >
              {chatMessages.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    padding: "8px 10px",
                    borderRadius: 10,
                    background:
                      m.role === "user"
                        ? "rgba(56,189,248,0.2)"
                        : "rgba(15,118,110,0.3)",
                    border:
                      m.role === "user"
                        ? "1px solid rgba(56,189,248,0.7)"
                        : "1px solid rgba(45,212,191,0.7)",
                  }}
                >
                  {m.content}
                </div>
              ))}
              {chatLoading && (
                <div
                  style={{
                    fontSize: 12,
                    opacity: 0.7,
                    marginTop: 4,
                  }}
                >
                  Thinking…
                </div>
              )}
            </div>

            {/* input */}
            <form
              onSubmit={handleSend}
              style={{
                padding: "8px 10px",
                borderTop: "1px solid rgba(148,163,184,0.35)",
                display: "flex",
                gap: 6,
              }}
            >
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about engine, brakes, battery..."
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  borderRadius: 999,
                  border: "1px solid rgba(148,163,184,0.6)",
                  background: "#020617",
                  color: "#e5e7eb",
                  fontSize: 13,
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={chatLoading}
                style={{
                  padding: "8px 12px",
                  borderRadius: 999,
                  border: "none",
                  background:
                    "linear-gradient(135deg, #38bdf8, #0ea5e9)",
                  color: "#020617",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: chatLoading ? "not-allowed" : "pointer",
                }}
              >
                Send
              </button>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setAssistantOpen(true)}
            style={{
              borderRadius: 999,
              padding: "10px 18px",
              border: "none",
              background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
              color: "#020617",
              fontWeight: 600,
              fontSize: 14,
              boxShadow: "0 0 20px rgba(56,189,248,0.7)",
            }}
          >
            Ask GearGenie 💬
          </button>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(120px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
