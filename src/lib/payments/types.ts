/** Products and prices (in agorot). */
export const PRODUCTS = {
  subscription_3m: { amountAgorot: 15000, title: "מנוי ל-3 חודשים" },
  help_request: { amountAgorot: 2000, title: "בקשת עזרה מהמחבר" },
} as const;

export type Product = keyof typeof PRODUCTS;

export type CheckoutInput = {
  paymentId: string; // our id, sent to the provider and returned in the webhook
  product: Product;
  amountAgorot: number;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
};

export type WebhookResult = { paymentId: string; status: "paid" | "failed"; providerRef?: string };

/**
 * One interface for every payment company. To connect an Israeli provider
 * (e.g. Cardcom, Tranzila, PayPlus, Grow), implement this in a new file and register it in ./index.ts.
 */
export interface PaymentProvider {
  readonly id: string;
  /** Creates a hosted payment page and returns its address. */
  createCheckout(input: CheckoutInput): Promise<{ redirectUrl: string; providerRef?: string }>;
  /** Verifies a webhook call from the provider. Returns null if it is not authentic. */
  parseWebhook(request: Request): Promise<WebhookResult | null>;
}
