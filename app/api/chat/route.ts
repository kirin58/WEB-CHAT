import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const r = await fetch(process.env.N8N_WEBHOOK_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      return NextResponse.json({ error: "n8n error" }, { status: r.status });
    }

    const rawData = await r.json().catch(() => ({}));

    // สำคัญ: n8n มักส่งกลับมาเป็น Array [ { ... } ] 
    // เราต้องดึงเอาตัวแรกออกมา หรือถ้ามาเป็น Object อยู่แล้วก็ใช้ตัวนั้นเลย
    const data = Array.isArray(rawData) ? rawData[0] : rawData;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}