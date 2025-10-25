import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, timestamp } = await request.json()

    // Basic validation
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SHEETS_WEB_APP_URL

    if (!GOOGLE_SCRIPT_URL) {
      console.warn("GOOGLE_SHEETS_WEB_APP_URL not configured")
      console.log("Zakat reminder signup:", { email, timestamp })
      return NextResponse.json({ success: true })
    }

    // Send to Google Sheets
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        timestamp,
        source: "zakat_calculator",
      }),
    })

    if (!response.ok) {
      console.error("Google Sheets API Error:", {
        status: response.status,
        statusText: response.statusText,
        url: GOOGLE_SCRIPT_URL,
      })
      throw new Error(
        `Failed to save to Google Sheets: ${response.status} ${response.statusText}`
      )
    }

    const result = await response.json()
    console.log("Successfully saved to Google Sheets:", result)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving email:", error)
    return NextResponse.json({ error: "Failed to save email" }, { status: 500 })
  }
}
