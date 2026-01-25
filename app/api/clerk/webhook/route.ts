import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import crypto from "crypto";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Verify the webhook signature from Clerk
 */
function verifyWebhook(
  payload: string,
  signature: string,
  timestamp: string,
  secret: string
): boolean {
  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("base64");

  // The signature header contains multiple signatures, we need to check each
  const signatures = signature.split(" ");
  for (const sig of signatures) {
    const [version, signatureValue] = sig.split(",");
    if (version === "v1" && signatureValue === expectedSignature) {
      return true;
    }
  }
  return false;
}

export async function POST(req: Request) {
  // Get the webhook secret from environment variables
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    // For development, continue without verification
    // In production, you should return an error
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers in production, error out
  if (WEBHOOK_SECRET && (!svix_id || !svix_timestamp || !svix_signature)) {
    return new Response("Missing svix headers", { status: 400 });
  }

  // Get the body
  const payload = await req.text();
  let evt: WebhookEvent;

  try {
    evt = JSON.parse(payload) as WebhookEvent;
  } catch {
    return new Response("Invalid JSON payload", { status: 400 });
  }

  // Handle the webhook event
  const eventType = evt.type;

  try {
    switch (eventType) {
      case "user.created": {
        // User created in Clerk - they'll complete onboarding to create Convex user
        console.log("New user created in Clerk:", evt.data.id);
        break;
      }

      case "user.updated": {
        // User updated in Clerk - sync email if changed
        const { id, email_addresses, primary_email_address_id } = evt.data;

        // Find the primary email
        const primaryEmail = email_addresses?.find(
          (email) => email.id === primary_email_address_id
        );

        if (primaryEmail?.email_address) {
          // Try to update the user in Convex
          const existingUser = await convex.query(api.users.getUserByClerkId, {
            clerkId: id,
          });

          if (existingUser && existingUser.email !== primaryEmail.email_address) {
            await convex.mutation(api.users.updateUser, {
              userId: existingUser._id,
              email: primaryEmail.email_address,
            });
            console.log("Updated email for user:", id);
          }
        }
        break;
      }

      case "user.deleted": {
        // User deleted in Clerk - log for now
        // In production, you might want to soft-delete or archive user data
        console.log("User deleted in Clerk:", evt.data.id);
        break;
      }

      default:
        console.log("Unhandled webhook event type:", eventType);
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Error processing webhook", { status: 500 });
  }

  return new Response("Webhook processed", { status: 200 });
}
