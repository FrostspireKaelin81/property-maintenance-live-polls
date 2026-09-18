import { createInfrai, type InfraiClient } from "./infra_client.ts";
import { z } from "zod";

export type PollInput = { propertyId: string; question: string; options: string[]; accountId: string };
export type TenantDocument = { tenantId: string; kind: "lease" | "identity"; receivedAt: string };
export type InspectionReminder = { propertyId: string; dueOn: string; label: string };
const pollInputSchema = z.object({ propertyId: z.string().min(1), question: z.string().min(1), options: z.array(z.string().min(1)).min(2), accountId: z.string().min(1) });
export function winningOption(counts: Record<string, number>): string | null {
  const entries = Object.entries(counts).filter(([, count]) => count > 0);
  if (!entries.length) return null;
  return entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
}

export async function openMaintenancePoll(input: PollInput, client?: InfraiClient) {
  const parsed = pollInputSchema.parse(input);
  const infrai = createInfrai(client);
  const channel = `property:${parsed.propertyId}:maintenance`;
  await infrai.realtime.channel.create({ channel, type: "presence", vendor: "pusher" });
  await infrai.realtime.publish({ channel, event: "poll.opened", account_id: parsed.accountId, data: { question: parsed.question, options: parsed.options } });
  return { channel, question: parsed.question, options: parsed.options };
}
