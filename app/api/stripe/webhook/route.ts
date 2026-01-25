import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

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
        const paymentType = session.metadata?.paymentType;

        if (!userId) {
          console.error("Missing userId in checkout.session.completed");
          break;
        }

        // Handle one-time payment
        if (session.mode === "payment" || paymentType === "one_time") {
          const paymentIntentId = session.payment_intent as string;
          const amount = session.amount_total ? session.amount_total / 100 : 0;
          const customerId = session.customer as string;

          // Get the Convex user by Clerk ID
          const convexUser = await convex.query(api.users.getUserByClerkId, {
            clerkId: userId,
          });

          if (!convexUser) {
            console.error("User not found in Convex:", userId);
            break;
          }

          // Get or create the pool for the user's location
          const poolId = await convex.mutation(api.pools.getOrCreatePool, {
            city: convexUser.city,
            province: convexUser.province,
            postalCode: convexUser.postalCode,
          });

          // Create one-time donation record
          await convex.mutation(api.donations.createOneTimeDonation, {
            userId: convexUser._id,
            poolId,
            amount,
            stripePaymentIntentId: paymentIntentId,
            stripeCustomerId: customerId,
          });

          // Mark it as succeeded immediately (payment is already complete)
          await convex.mutation(api.donations.recordOneTimeDonationSuccess, {
            stripePaymentIntentId: paymentIntentId,
          });

          console.log("One-time donation created:", {
            userId,
            paymentIntentId,
            amount,
          });
          break;
        }

        // Handle subscription (existing logic)
        const subscriptionId = session.subscription as string;

        if (!subscriptionId) {
          console.error("Missing subscriptionId in checkout.session.completed for subscription mode");
          break;
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const amount = subscription.items.data[0]?.price.unit_amount || 0;
        const interval = subscription.items.data[0]?.price.recurring?.interval as
          | "week"
          | "month"
          | "year"
          | undefined;

        // Get the Convex user by Clerk ID
        const convexUser = await convex.query(api.users.getUserByClerkId, {
          clerkId: userId,
        });

        if (!convexUser) {
          console.error("User not found in Convex:", userId);
          break;
        }

        // Get or create the pool for the user's location
        const poolId = await convex.mutation(api.pools.getOrCreatePool, {
          city: convexUser.city,
          province: convexUser.province,
          postalCode: convexUser.postalCode,
        });

        // Create subscription in Convex with interval
        await convex.mutation(api.subscriptions.createSubscription, {
          userId: convexUser._id,
          poolId,
          weeklyAmount: amount / 100,
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: subscription.customer as string,
          startDate: Date.now(),
          interval: interval || "week",
        });

        console.log("Subscription created:", {
          userId,
          subscriptionId,
          amount: amount / 100,
          interval,
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

        // Check if subscription already exists (might have been created via checkout.session.completed)
        const existingSubscription = await convex.query(
          api.subscriptions.getSubscriptionByStripeId,
          { stripeSubscriptionId: subscription.id }
        );

        if (existingSubscription) {
          console.log("Subscription already exists, skipping creation");
          break;
        }

        const amount = subscription.items.data[0]?.price.unit_amount || 0;
        const interval = subscription.items.data[0]?.price.recurring?.interval as
          | "week"
          | "month"
          | "year"
          | undefined;

        // Get the Convex user by Clerk ID
        const convexUser = await convex.query(api.users.getUserByClerkId, {
          clerkId: userId,
        });

        if (!convexUser) {
          console.error("User not found in Convex:", userId);
          break;
        }

        // Get or create the pool for the user's location
        const poolId = await convex.mutation(api.pools.getOrCreatePool, {
          city: convexUser.city,
          province: convexUser.province,
          postalCode: convexUser.postalCode,
        });

        // Create subscription in Convex with interval
        await convex.mutation(api.subscriptions.createSubscription, {
          userId: convexUser._id,
          poolId,
          weeklyAmount: amount / 100,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: customerId,
          startDate: Date.now(),
          interval: interval || "week",
        });

        console.log("Subscription created via webhook:", {
          userId,
          subscriptionId: subscription.id,
          status: subscription.status,
          interval,
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const amount = subscription.items.data[0]?.price.unit_amount || 0;
        const status =
          subscription.status === "active"
            ? "active"
            : subscription.status === "paused"
            ? "paused"
            : "cancelled";

        // Update subscription in Convex by Stripe ID
        try {
          await convex.mutation(api.subscriptions.updateSubscriptionByStripeId, {
            stripeSubscriptionId: subscription.id,
            weeklyAmount: amount / 100,
            status,
          });

          console.log("Subscription updated:", {
            subscriptionId: subscription.id,
            status,
            amount: amount / 100,
          });
        } catch (error) {
          console.error("Failed to update subscription in Convex:", error);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // Cancel subscription in Convex by Stripe ID
        try {
          await convex.mutation(api.subscriptions.cancelSubscriptionByStripeId, {
            stripeSubscriptionId: subscription.id,
          });

          console.log("Subscription cancelled:", {
            subscriptionId: subscription.id,
          });
        } catch (error) {
          console.error("Failed to cancel subscription in Convex:", error);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        // The Stripe typing does not guarantee 'subscription' is present on Invoice
        const invoiceWithSub = invoice as unknown as { subscription?: string };
        const subscriptionId =
          typeof invoiceWithSub.subscription === "string"
            ? invoiceWithSub.subscription
            : undefined;

        if (!subscriptionId) {
          break;
        }

        // Record successful payment in Convex
        try {
          await convex.mutation(api.subscriptions.recordContributionByStripeId, {
            stripeSubscriptionId: subscriptionId,
            amount: invoice.amount_paid / 100,
          });

          console.log("Payment succeeded:", {
            subscriptionId,
            amount: invoice.amount_paid / 100,
          });
        } catch (error) {
          console.error("Failed to record payment in Convex:", error);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        // The Stripe typing does not guarantee 'subscription' is present on Invoice
        const invoiceWithSub = invoice as unknown as { subscription?: string };
        const subscriptionId =
          typeof invoiceWithSub.subscription === "string"
            ? invoiceWithSub.subscription
            : undefined;

        if (!subscriptionId) {
          break;
        }

        // For failed payments, we could pause the subscription or notify the user
        // For now, we log the failure - the subscription status will be updated
        // via customer.subscription.updated event if Stripe changes the status
        console.log("Payment failed:", {
          subscriptionId,
          amount: invoice.amount_due / 100,
        });
        break;
      }

      case "payment_intent.succeeded": {
        // Handle payment intent success for one-time payments
        // This is a backup in case checkout.session.completed doesn't fire
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Check if this is a one-time donation that wasn't processed yet
        try {
          const existingDonation = await convex.query(
            api.donations.getOneTimeDonationByPaymentIntentId,
            { stripePaymentIntentId: paymentIntent.id }
          );

          if (existingDonation && existingDonation.status === "pending") {
            await convex.mutation(api.donations.recordOneTimeDonationSuccess, {
              stripePaymentIntentId: paymentIntent.id,
            });

            console.log("One-time donation marked as succeeded via payment_intent.succeeded:", {
              paymentIntentId: paymentIntent.id,
              amount: paymentIntent.amount / 100,
            });
          }
        } catch (error) {
          // Donation might not exist if this was from a different payment type
          console.log("No pending donation found for payment intent:", paymentIntent.id);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        // Handle payment intent failure for one-time payments
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        try {
          const existingDonation = await convex.query(
            api.donations.getOneTimeDonationByPaymentIntentId,
            { stripePaymentIntentId: paymentIntent.id }
          );

          if (existingDonation && existingDonation.status === "pending") {
            await convex.mutation(api.donations.recordOneTimeDonationFailure, {
              stripePaymentIntentId: paymentIntent.id,
            });

            console.log("One-time donation marked as failed:", {
              paymentIntentId: paymentIntent.id,
            });
          }
        } catch (error) {
          console.log("No pending donation found for failed payment intent:", paymentIntent.id);
        }
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
