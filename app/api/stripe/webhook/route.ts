import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const error = err as Error;
    console.error("Webhook signature verification failed:", error.message);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  try {
    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription as string;

        if (!userId || !subscriptionId) {
          console.error("Missing userId or subscriptionId in checkout.session.completed");
          break;
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const amount = subscription.items.data[0]?.price.unit_amount || 0;

        // TODO: Create subscription in Convex
        // await createSubscriptionInConvex({
        //   userId,
        //   stripeSubscriptionId: subscriptionId,
        //   stripeCustomerId: subscription.customer as string,
        //   amount: amount / 100,
        //   status: "active",
        // });

        console.log("Subscription created:", {
          userId,
          subscriptionId,
          amount: amount / 100,
        });
        break;
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get customer to find userId
        const customer = await stripe.customers.retrieve(customerId);
        const userId = (customer as Stripe.Customer).metadata?.userId;

        if (!userId) {
          console.error("Missing userId in customer.subscription.created");
          break;
        }

        const amount = subscription.items.data[0]?.price.unit_amount || 0;

        // TODO: Create or update subscription in Convex
        // await createSubscriptionInConvex({
        //   userId,
        //   stripeSubscriptionId: subscription.id,
        //   stripeCustomerId: customerId,
        //   amount: amount / 100,
        //   status: subscription.status === "active" ? "active" : "paused",
        // });

        console.log("Subscription created via webhook:", {
          userId,
          subscriptionId: subscription.id,
          status: subscription.status,
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get customer to find userId
        const customer = await stripe.customers.retrieve(customerId);
        const userId = (customer as Stripe.Customer).metadata?.userId;

        if (!userId) {
          console.error("Missing userId in customer.subscription.updated");
          break;
        }

        const amount = subscription.items.data[0]?.price.unit_amount || 0;
        const status =
          subscription.status === "active"
            ? "active"
            : subscription.status === "paused"
            ? "paused"
            : "cancelled";

        // TODO: Update subscription in Convex
        // await updateSubscriptionInConvex(subscription.id, {
        //   amount: amount / 100,
        //   status,
        // });

        console.log("Subscription updated:", {
          userId,
          subscriptionId: subscription.id,
          status,
          amount: amount / 100,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get customer to find userId
        const customer = await stripe.customers.retrieve(customerId);
        const userId = (customer as Stripe.Customer).metadata?.userId;

        if (!userId) {
          console.error("Missing userId in customer.subscription.deleted");
          break;
        }

        // TODO: Cancel subscription in Convex
        // await cancelSubscriptionInConvex(subscription.id);

        console.log("Subscription cancelled:", {
          userId,
          subscriptionId: subscription.id,
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        // The Stripe typing does not guarantee 'subscription' is present on Invoice
        // See: https://github.com/stripe/stripe-node/issues/1524
        const subscriptionId =
          typeof (invoice as any).subscription === "string"
            ? (invoice as any).subscription
            : undefined;

        if (!subscriptionId) {
          break;
        }

        // TODO: Record successful payment in Convex
        console.log("Payment succeeded:", {
          subscriptionId,
          amount: invoice.amount_paid / 100,
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        // The Stripe typing does not guarantee 'subscription' is present on Invoice
        // See: https://github.com/stripe/stripe-node/issues/1524
        const subscriptionId =
          typeof (invoice as any).subscription === "string"
            ? (invoice as any).subscription
            : undefined;

        if (!subscriptionId) {
          break;
        }

        // TODO: Handle failed payment in Convex
        console.log("Payment failed:", {
          subscriptionId,
          amount: invoice.amount_due / 100,
        });
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
