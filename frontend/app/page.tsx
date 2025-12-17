"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SplashPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login")
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div
      style={{
        height: "100vh",
        background:
          "radial-gradient(circle at center, #1f2933 0%, #000 70%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src="/logo.png"
        alt="GearGenie"
        style={{
          width: 220,
          animation: "fadeScale 2s ease-in-out",
        }}
      />

      {/* ✅ Animation */}
      <style>{`
        @keyframes fadeScale {
          0% {
            opacity: 0;
            transform: scale(0.7);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          100% {
            opacity: 0;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}
