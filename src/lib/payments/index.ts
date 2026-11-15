import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { PRODUCTS, type PaymentProvider, type Product } from "./types";

/** Placeholder until a real provider is connected: payments stay "pending" and the admin approves them manually. */
const manualProvider: PaymentProvider = {
  id: "manual",
  async createCheckout() {
    throw new Error("Online payment is not connected yet");
  },
  async parseWebhook() {
    return null;
  },
};

const providers: Record<string, PaymentProvider> = {
  manual: manualProvider,
};

export function getProvider(id = process.env.PAYMENT_PROVIDER ?? "manual"): PaymentProvider {
  return providers[id] ?? manualProvider;
}

export function onlinePaymentEnabled() {
  return getProvider().id !== "manual";
}

/** Creates a pending payment row and, if a provider is connected, a checkout page. */
export async function startPayment(opts: { userId: string; email: string; product: Product; siteUrl: string }) {
  const db = createAdminClient();
  if (!db) throw new Error("Supabase secret key missing");
  const provider = getProvider();
  const { amountAgorot } = PRODUCTS[opts.product];
  const { data, error } = await db
    .from("payments")
    .insert({ user_id: opts.userId, product: opts.product, amount_agorot: amountAgorot, provider: provider.id })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "insert failed");
  if (provider.id === "manual") return { paymentId: data.id as string, redirectUrl: null };

  const checkout = await provider.createCheckout({
    paymentId: data.id,
    product: opts.product,
    amountAgorot,
    customerEmail: opts.email,
    successUrl: `${opts.siteUrl}/account?paid=1`,
    cancelUrl: `${opts.siteUrl}/subscribe`,
  });
  if (checkout.providerRef) await db.from("payments").update({ provider_ref: checkout.providerRef }).eq("id", data.id);
  return { paymentId: data.id as string, redirectUrl: checkout.redirectUrl };
}

/** Marks a payment paid and applies it (opens the subscription). Safe to call twice. */
export async function markPaid(paymentId: string, providerRef?: string) {
  const db = createAdminClient();
  if (!db) throw new Error("Supabase secret key missing");
  const { data, error } = await db.rpc("apply_payment", { p_payment: paymentId, p_provider_ref: providerRef ?? null });
  if (error) throw new Error(error.message);
  return data as "applied" | "already_paid";
}

export async function markFailed(paymentId: string) {
  const db = createAdminClient();
  if (!db) throw new Error("Supabase secret key missing");
  await db.from("payments").update({ status: "failed" }).eq("id", paymentId).eq("status", "pending");
}
