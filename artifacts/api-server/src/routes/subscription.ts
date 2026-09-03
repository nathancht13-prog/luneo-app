import { Router, type IRouter } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { eq } from "drizzle-orm";
import { db, subscribersTable } from "@workspace/db";

const router: IRouter = Router();

async function currentUserEmail(userId: string): Promise<string | undefined> {
  const user = await clerkClient.users.getUser(userId);
  return user.emailAddresses
    .find((e) => e.id === user.primaryEmailAddressId)?.emailAddress
    ?.toLowerCase();
}

router.get("/subscription", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ subscribed: false, plan: null });
    return;
  }

  try {
    const email = await currentUserEmail(userId);
    if (!email) {
      res.json({ subscribed: false, plan: null });
      return;
    }

    const [row] = await db
      .select({ active: subscribersTable.active, plan: subscribersTable.plan })
      .from(subscribersTable)
      .where(eq(subscribersTable.email, email));

    res.json({ subscribed: row?.active ?? false, plan: row?.active ? row.plan : null });
  } catch (err) {
    req.log.error({ err }, "subscription lookup failed");
    res.status(500).json({ subscribed: false, plan: null });
  }
});

router.post("/subscription/cancel", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  try {
    const email = await currentUserEmail(userId);
    if (!email) {
      res.status(400).json({ error: "no_email" });
      return;
    }

    const [row] = await db
      .select({ membershipId: subscribersTable.membershipId })
      .from(subscribersTable)
      .where(eq(subscribersTable.email, email));

    if (!row?.membershipId) {
      res.status(404).json({ error: "no_active_membership" });
      return;
    }

    const whopRes = await fetch(`https://api.whop.com/api/v1/memberships/${row.membershipId}/cancel`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHOP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cancellation_mode: "immediate" }),
    });

    if (!whopRes.ok) {
      req.log.error({ status: whopRes.status, body: await whopRes.text() }, "whop membership cancel failed");
      res.status(502).json({ error: "cancel_failed" });
      return;
    }

    await db
      .update(subscribersTable)
      .set({ active: false, updatedAt: new Date() })
      .where(eq(subscribersTable.email, email));

    res.json({ subscribed: false });
  } catch (err) {
    req.log.error({ err }, "subscription cancel failed");
    res.status(500).json({ error: "cancel_failed" });
  }
});

export default router;
