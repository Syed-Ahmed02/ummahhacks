import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
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
    const { subscriptionId } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    // Cancel the subscription in Stripe
    const subscription = await stripe.subscriptions.cancel(subscriptionId);

    // Update subscription status in Convex
    try {
      await convex.mutation(api.subscriptions.cancelSubscriptionByStripeId, {
        stripeSubscriptionId: subscriptionId,
      });
    } catch (error) {
      console.error("Failed to cancel subscription in Convex:", error);
      // Continue even if Convex update fails - Stripe is the source of truth
      // The webhook will eventually sync the data
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
      },
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
