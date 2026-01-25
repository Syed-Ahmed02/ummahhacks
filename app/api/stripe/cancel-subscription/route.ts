import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";

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

    // TODO: Update subscription status in Convex
    // await cancelSubscriptionInConvex(subscriptionId);

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
