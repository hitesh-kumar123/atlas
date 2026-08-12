import { NextResponse } from "next/server";

export async function GET() {
  const encoder = new TextEncoder();

  const customStream = new ReadableStream({
    start(controller) {
      const sendEvent = () => {
        const sampleEvents = ["page_view", "button_click", "search", "checkout_start", "checkout_complete"];
        const randomName = sampleEvents[Math.floor(Math.random() * sampleEvents.length)]!;
        const randomUser = `user_${Math.floor(Math.random() * 1000) + 1}`;

        const data = JSON.stringify({
          id: `evt_live_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name: randomName,
          distinctId: randomUser,
          properties: {
            browser: "Chrome 128",
            os: "macOS",
            path: "/dashboard",
            session_ms: Math.floor(Math.random() * 180000),
          },
          occurredAt: new Date().toISOString(),
        });

        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      // Send initial batch of 3 events
      sendEvent();
      sendEvent();
      sendEvent();

      // Stream new event every 2 seconds
      const interval = setInterval(() => {
        sendEvent();
      }, 2000);

      return () => {
        clearInterval(interval);
      };
    },
  });

  return new NextResponse(customStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
