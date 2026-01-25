import { NextRequest, NextResponse } from "next/server";
import { stripe, getOrCreateCustomer, formatAmountForStripe } from "@/lib/stripe";
import { auth, currentUser } from "@clerk/nextjs/server";

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
    const { amount } = body;

    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: "Invalid amount. Minimum is $1 per week." },
        { status: 400 }
      );
    }

    // Get user email from Clerk
    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    
    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateCustomer(userEmail, userId);

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Community Investment",
              description: "Weekly recurring donation to local charities",
            },
            recurring: {
              interval: "week",
            },
            unit_amount: formatAmountForStripe(amount),
          },
          quantity: 1,
        },
      ],
      success_url: `${request.nextUrl.origin}/subscription?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/subscribe?canceled=true`,
      metadata: {
        userId,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
