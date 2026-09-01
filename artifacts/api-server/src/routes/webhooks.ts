import { Router, type IRouter } from "express";
import { unwrapWebhook } from "@whop/sdk/helpers";
import { db, subscribersTable } from "@workspace/db";

const router: IRouter = Router();

type WhopMembership = {
  user?: { email?: string | null } | null;
  plan?: { id?: string } | null;
};

router.post("/whop", async (req, res) => {
  let event: Record<string, unknown>;
  try {
    event = unwrapWebhook(req.body.toString(), {
      headers: req.headers as Record<string, string>,
      key: process.env.WHOP_WEBHOOK_SECRET,
    });
  } catch (err) {
    req.log.error({ err }, "whop webhook signature verification failed");
    res.status(400).send("invalid signature");
    return;
  }

  const eventType = (event.type ?? event.action ?? event.event) as string | undefined;
  const membership = (event.data ?? event.object ?? event) as WhopMembership;
  const email = membership.user?.email?.toLowerCase();

  if (!eventType || !email) {
    req.log.warn({ eventType, hasEmail: !!email, keys: Object.keys(event) }, "whop webhook: unrecognized payload shape, skipping");
    res.status(200).send("ok");
    return;
  }

  if (eventType === "membership.activated") {
    await db
      .insert(subscribersTable)
      .values({ email, active: true, plan: membership.plan?.id })
      .onConflictDoUpdate({
        target: subscribersTable.email,
        set: { active: true, plan: membership.plan?.id, updatedAt: new Date() },
      });
  } else if (eventType === "membership.deactivated") {
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
