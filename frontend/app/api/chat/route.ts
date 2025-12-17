import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = await req.json()
  const { question, brand, token } = body

  try {
    const res = await fetch("http://127.0.0.1:8000/mcp/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ question, brand }),
    })

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { answer: "Assistant service is currently unavailable." },
      { status: 500 }
    )
  }
}
