"use client"

export default function ContactPage() {
  return (
    <div
      style={{
        padding: "60px 80px",
        color: "#fff",
        maxWidth: 900,
      }}
    >
      <h1 style={{ fontSize: 36, marginBottom: 20 }}>
        Contact Us
      </h1>

      <p style={{ opacity: 0.7, marginBottom: 40 }}>
        We’re here to support our OEM partners with insights,
        analytics, and performance tracking.
      </p>

      <div style={{ fontSize: 18, lineHeight: "2.2rem" }}>
        <p><b>Email:</b> support@geargenie.ai</p>
        <p><b>Phone:</b> +1 (800) 456‑8890</p>
        <p>
          <b>Address:</b><br />
          GearGenie Analytics<br />
          501 Automotive Drive<br />
          Detroit, MI 48201
        </p>
        <p><b>Working Hours:</b> Mon – Fri, 9:00 AM – 6:00 PM</p>
      </div>
    </div>
  )
}
