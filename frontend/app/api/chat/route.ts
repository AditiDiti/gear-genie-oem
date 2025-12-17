import { NextResponse } from "next/server"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { question, brand, token } = body

    if (!API_BASE) {
      return NextResponse.json(
        { answer: "API base URL is not configured." },
        { status: 500 }
      )
    }

    const res = await fetch(`${API_BASE}/mcp/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ question, brand }),
    })

    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`)
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error("Chat API error:", err)
    return NextResponse.json(
      { answer: "Assistant service is currently unavailable." },
      { status: 500 }
    )
  }
}
