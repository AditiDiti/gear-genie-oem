"use client"

import { ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  const brand =
    typeof window !== "undefined"
      ? localStorage.getItem("brand")?.toUpperCase()
      : ""

  const navItems = [
    { label: "Home", path: "/dashboard" },
    { label: "Engine", path: "/dashboard/engine" },
    { label: "Battery", path: "/dashboard/battery" },
    { label: "Brakes", path: "/dashboard/brakes" },
    { label: "Contact Us", path: "/dashboard#contact" },
  ]

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#05070b" }}>
      {/* ✅ SIDEBAR */}
      <aside
        style={{
          width: 240,
          padding: "28px 18px",
          display: "flex",
          flexDirection: "column",
          background:
            "radial-gradient(circle at top, #141824 0%, #070a12 70%)",
          borderRight: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {/* ✅ LOGO IMAGE */}
        <div
          onClick={() => router.push("/dashboard")}
          style={{
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            marginBottom: 36,
          }}
        >
          <img
            src="/geargenie.png" // ✅ put the uploaded image in /public
            alt="GearGenie"
            style={{
              width: 200,
              opacity: 100,
              transition: "transform 0.3s ease, opacity 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.04)"
              e.currentTarget.style.opacity = "1"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)"
              e.currentTarget.style.opacity = "0.9"
            }}
          />
        </div>

        {/* ✅ NAV */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {navItems.map((item) => {
            const active = pathname === item.path

            return (
              <div
                key={item.label}
                onClick={() => router.push(item.path)}
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  color: active ? "#e5f0ff" : "rgba(255,255,255,0.75)",
                  background: active
                    ? "rgba(120,170,255,0.12)"
                    : "transparent",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "rgba(120,170,255,0.08)"
                  e.currentTarget.style.color = "#fff"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = active
                    ? "rgba(120,170,255,0.12)"
                    : "transparent"
                  e.currentTarget.style.color = active
                    ? "#e5f0ff"
                    : "rgba(255,255,255,0.75)"
                }}
              >
                {item.label}
              </div>
            )
          })}
        </nav>

        {/* ✅ SPACER */}
        <div style={{ flexGrow: 1 }} />

        {/* ✅ FOOTER */}
        <div>
          <div
            onClick={() => {
              localStorage.clear()
              router.push("/login")
            }}
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              fontSize: 14,
              cursor: "pointer",
              background: "rgba(255,255,255,0.06)",
              color: "#fca5a5",
              marginBottom: 14,
              transition: "all 0.25s ease",
              textAlign: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.15)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)"
            }}
          >
            Logout
          </div>

          <div style={{ fontSize: 13, opacity: 0.65, textAlign: "center", color: "#94a3b8" }}>
            {/* Logged in as <b>{brand}</b> */}
          </div>
        </div>
      </aside>

      {/* ✅ MAIN CONTENT */}
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  )
}
