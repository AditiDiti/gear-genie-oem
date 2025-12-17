"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  /* ✅ SPLASH STATE */
  const [showSplash, setShowSplash] = useState(true)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [brand, setBrand] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  /* ✅ ALWAYS SHOW SPLASH ON PAGE LOAD */
  useEffect(() => {
    setShowSplash(true)

    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2000) // ✅ 2 sec exactly

    return () => clearTimeout(timer)
  }, [])

  const handleLogin = async () => {
    setError("")

    if (!email || !password || !brand) {
      setError("Please fill all fields and select a brand")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, brand }),
      })

      if (!res.ok) {
        setError("Invalid email, password or brand")
        return
      }

      const data = await res.json()

      localStorage.setItem("token", data.access_token)
      localStorage.setItem("brand", data.brand)

      router.push("/dashboard")
    } catch {
      setError("Backend not reachable")
    } finally {
      setLoading(false)
    }
  }

  /* ✅ SPLASH SCREEN */
  if (showSplash) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          background: "#000", // ✅ pure black as you asked
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
  src="/logo.png"
  alt="GearGenie"
  style={{
    width: "35vw",          // ✅ 35% of viewport width
    maxWidth: 520,          // ✅ safety cap (big screens)
    minWidth: 260,          // ✅ safety cap (small screens)
    animation: "logoIntro 2s ease-in-out forwards",
  }}
/>


        {/* ✅ ANIMATION */}
        <style>{`
          @keyframes logoIntro {
            0% {
              opacity: 0;
              transform: scale(0.7);
            }
            45% {
              opacity: 1;
              transform: scale(1.05);
            }
            100% {
              opacity: 0;
              transform: scale(0.95);
            }
          }
        `}</style>
      </div>
    )
  }

  /* ✅ LOGIN UI */
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at top, #0f172a 0%, #000 70%)",
        color: "#fff",
        animation: "fadeIn 0.6s ease",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* ✅ LOGIN CARD */}
      <div
        style={{
          width: 420,
          padding: "50px 40px",
          borderRadius: 18,
          background: "rgba(15,23,42,0.7)",
          backdropFilter: "blur(14px)",
          boxShadow: "0 0 45px rgba(56,189,248,0.45)",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 18, opacity: 0.8 }}>Welcome</h1>
        <h2
          style={{
            fontSize: 34,
            marginBottom: 35,
            fontWeight: 700,
            color: "#38bdf8",
          }}
        >
          GearGenie OEM
        </h2>

        <div style={{ textAlign: "left" }}>
          <label style={labelStyle}>Email</label>
          <input
            style={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@oem.com"
          />

          <label style={labelStyle}>Password</label>
          <input
            type="password"
            style={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <label style={labelStyle}>Select Brand</label>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            style={inputStyle}
          >
            <option value="">Choose brand</option>
            <option value="kia">Kia</option>
            <option value="bmw">BMW</option>
            <option value="audi">Audi</option>
            <option value="ford">Ford</option>
            <option value="chevrolet">Chevrolet</option>
            <option value="toyota">Toyota</option>
            <option value="honda">Honda</option>
            <option value="hyundai">Hyundai</option>
            <option value="mercedes">Mercedes</option>
            <option value="nissan">Nissan</option>
          </select>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            marginTop: 30,
            width: "100%",
            padding: 14,
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            border: "none",
            color: "#020617",
            background:
              "linear-gradient(135deg, #38bdf8, #0ea5e9)",
            boxShadow: "0 0 22px rgba(56,189,248,0.6)",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && (
          <p style={{ marginTop: 18, fontSize: 14, color: "#f87171" }}>
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

/* ✅ STYLES */
const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: 18,
  borderRadius: 10,
  background: "#020617",
  border: "1px solid #334155",
  color: "#fff",
  fontSize: 14,
}

const labelStyle = {
  fontSize: 13,
  opacity: 0.8,
}
