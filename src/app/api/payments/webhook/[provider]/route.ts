import { NextResponse, type NextRequest } from "next/server";
import { getProvider, markFailed, markPaid } from "@/lib/payments";

/** Payment companies call this address after a payment. Each provider verifies its own signature. */
export async function POST(request: NextRequest, ctx: RouteContext<"/api/payments/webhook/[provider]">) {
  const { provider: id } = await ctx.params;
  const provider = getProvider(id);
  if (provider.id !== id) return NextResponse.json({ error: "unknown provider" }, { status: 404 });

  const result = await provider.parseWebhook(request);
  if (!result) return NextResponse.json({ error: "invalid" }, { status: 400 });

  if (result.status === "paid") await markPaid(result.paymentId, result.providerRef);
  else await markFailed(result.paymentId);
  return NextResponse.json({ ok: true });
}
