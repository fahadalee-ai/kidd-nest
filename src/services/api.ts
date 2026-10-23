/**
 * Service boundary for a future Supabase + Stripe backend.
 * V1 reads and writes the local family store. No secrets live here.
 * Swap each method for supabase-js / Stripe when credentials are provided
 * through environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY,
 * STRIPE_SECRET_KEY on the server only).
 */
export const backend = {
  async signIn(email: string, password: string) {
    return { email, passwordAccepted: password.length > 0 };
  },
  async createPaymentIntent(amount: number, method: string) {
    return {
      id: `pi_mock_${Date.now()}`,
      amount,
      method,
      status: "requires_capture" as const,
      currency: "usd",
    };
  },
  async uploadDocument(name: string, folder: string) {
    return { path: `families/mock/${folder}/${name}`, bucket: "documents" };
  },
};
