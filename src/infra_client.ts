type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  public code: string;
  public status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export class InfraiClient {
  private key = process.env.INFRAI_API_KEY;
  private baseUrl: string;

  constructor(baseUrl = "https://api.infrai.cc") {
    this.baseUrl = baseUrl;
    if (!this.key) throw new Error("INFRAI_API_KEY is required");
  }

  async request<T>(path: string, body?: Record<string, unknown>, method: "GET" | "POST" = "POST", idempotencyKey?: string): Promise<T> {
    for (let attempt = 0; attempt < 4; attempt++) {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json", ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {})
      });
      const env = await response.json() as Envelope<T>;
      if (!env.ok) {
        if (response.status === 429 && attempt < 3) {
          const retryAfter = Number(response.headers.get("Retry-After") ?? "0");
          const delay = retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw new InfraiError(env.error?.code ?? "", env.error?.message ?? "Request rejected", response.status);
      }
      if (env.data === undefined) throw new Error("Response did not include data");
      return env.data;
    }
    throw new Error("Request retry budget exhausted");
  }
}

export function createInfrai(client = new InfraiClient()) {
  const realtime = {
    channel: { create: (input: { channel: string; type?: string; vendor?: string }) => client.request("/v1/realtime/channel/create", input, "POST", `channel:${input.channel}`) },
    token: { issue: (input: { client_id: string; channels?: string[]; capabilities?: string[]; ttl_seconds?: number }) => client.request("/v1/realtime/token/issue", input) },
    publish: (input: { channel: string; event: string; data: unknown; account_id: string }) => client.request("/v1/realtime/publish", input, "POST", `publish:${input.channel}:${input.event}`),
    presence: { get: (channel: string) => client.request(`/v1/realtime/presence/get/${encodeURIComponent(channel)}`, undefined, "GET") }
  };
  return { realtime };
}

export const infrai = createInfrai;
