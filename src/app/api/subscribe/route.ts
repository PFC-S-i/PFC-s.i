import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const response = await fetch(
      `https://api.mailerlite.com/api/v2/groups/${process.env.MAILERLITE_GROUP_ID}/subscribers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-MailerLite-ApiKey": process.env.MAILERLITE_API_KEY!,
        },
        body: JSON.stringify({ email }),
      }
    );

    if (response.ok) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, status: response.status });
    }
  } catch (err) {
    console.error("Erro ao assinar newsletter:", err);
    return NextResponse.json({ success: false });
  }
}
