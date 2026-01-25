import { NextRequest, NextResponse } from "next/server";
import { stripe, formatAmountForStripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { subscriptionId, amount } = body;

    if (!subscriptionId || !amount) {
      return NextResponse.json(
        { error: "Subscription ID and amount are required" },
        { status: 400 }
      );
    }

    if (amount < 1) {
      return NextResponse.json(
        { error: "Invalid amount. Minimum is $1 per week." },
        { status: 400 }
      );
    }

    // Get the subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Create a new price for the updated amount
    const price = await stripe.prices.create({
      currency: "usd",
      product_data: {
        name: "Community Investment"
      },
      recurring: {
        interval: "week"
      },
      unit_amount: formatAmountForStripe(amount),
    });

    // Update the subscription with new price
    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        items: [
          {
            id: subscription.items.data[0].id,
            price: price.id,
          },
        ],
        proration_behavior: "create_prorations",
      }
    );

    // Update subscription in Convex
    try {
      await convex.mutation(api.subscriptions.updateSubscriptionByStripeId, {
        stripeSubscriptionId: subscriptionId,
        weeklyAmount: amount,
        status: updatedSubscription.status === "active" ? "active" : "paused",
      });
    } catch (error) {
      console.error("Failed to update subscription in Convex:", error);
      // Continue even if Convex update fails - Stripe is the source of truth
      // The webhook will eventually sync the data
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        amount: amount,
      },
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}
