import { Router, type IRouter } from "express";
import { timingSafeEqual } from "node:crypto";
import { db, subscribersTable } from "@workspace/db";

const router: IRouter = Router();

type WhopMembership = {
  id?: string;
  user?: { email?: string | null } | null;
  plan?: { id?: string } | null;
};

function isValidWebhookSecret(received: string | undefined, expected: string | undefined): boolean {
  if (!received || !expected) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

router.post("/whop", async (req, res) => {
  // This webhook sends the shared secret directly in a "webhook-secret" header
  // rather than a Standard Webhooks HMAC signature — verified by comparing it,
  // not by unwrapping/signing anything.
  if (!isValidWebhookSecret(req.headers["webhook-secret"] as string | undefined, process.env.WHOP_WEBHOOK_SECRET)) {
    req.log.error("whop webhook: invalid or missing webhook-secret header");
    res.status(400).send("invalid signature");
    return;
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(req.body.toString());
  } catch (err) {
    req.log.error({ err }, "whop webhook: failed to parse body as JSON");
    res.status(400).send("invalid body");
    return;
  }

  const eventType = (event.action ?? event.type ?? event.event) as string | undefined;
  const membership = (event.data ?? event.object ?? event) as WhopMembership;
  const email = membership.user?.email?.toLowerCase();

  req.log.info({ eventType }, "whop webhook received");

  if (!eventType || !email) {
    req.log.warn({ eventType, hasEmail: !!email, keys: Object.keys(event) }, "whop webhook: unrecognized payload shape, skipping");
    res.status(200).send("ok");
    return;
  }

  // Whop's docs and its actual delivered payloads disagree on the exact event
  // name (membership.activated vs membership.went_valid, dots vs underscores) —
  // match loosely on "valid"/"activat" and "invalid"/"deactivat" rather than
  // betting on one exact string.
  const isDeactivation = /invalid|deactivat/.test(eventType);
  const isActivation = !isDeactivation && /valid|activat/.test(eventType);

  if (isActivation) {
    await db
      .insert(subscribersTable)
      .values({ email, active: true, plan: membership.plan?.id, membershipId: membership.id })
      .onConflictDoUpdate({
        target: subscribersTable.email,
        set: { active: true, plan: membership.plan?.id, membershipId: membership.id, updatedAt: new Date() },
      });
  } else if (isDeactivation) {
    await db
      .insert(subscribersTable)
      .values({ email, active: false })
      .onConflictDoUpdate({
        target: subscribersTable.email,
        set: { active: false, updatedAt: new Date() },
      });
  } else {
    req.log.info({ eventType }, "whop webhook: ignoring unhandled event type");
  }

  res.status(200).send("ok");
});

export default router;
