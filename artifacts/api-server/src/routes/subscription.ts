import { Router, type IRouter } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { eq } from "drizzle-orm";
import { db, subscribersTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/subscription", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ subscribed: false });
    return;
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses
      .find((e) => e.id === user.primaryEmailAddressId)?.emailAddress
      ?.toLowerCase();

    if (!email) {
      res.json({ subscribed: false });
      return;
    }

    const [row] = await db
      .select({ active: subscribersTable.active })
      .from(subscribersTable)
      .where(eq(subscribersTable.email, email));

    res.json({ subscribed: row?.active ?? false });
  } catch (err) {
    req.log.error({ err }, "subscription lookup failed");
    res.status(500).json({ subscribed: false });
  }
});

export default router;
