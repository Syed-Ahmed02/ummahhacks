import { NextRequest, NextResponse } from "next/server";
import { stripe, getOrCreateCustomer, formatAmountForStripe } from "@/lib/stripe";
import { auth, currentUser } from "@clerk/nextjs/server";

type PaymentType = "one_time" | "recurring";
type PaymentInterval = "week" | "month" | "year";

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
    const { amount, paymentType = "recurring", interval = "week" } = body as {
      amount: number;
      paymentType?: PaymentType;
      interval?: PaymentInterval;
    };

    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: "Invalid amount. Minimum is $1." },
        { status: 400 }
      );
    }

    // Validate interval for recurring payments
    if (paymentType === "recurring" && !["week", "month", "year"].includes(interval)) {
      return NextResponse.json(
        { error: "Invalid interval. Must be week, month, or year." },
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

    // Get interval label for product description
    const getIntervalLabel = (int: PaymentInterval) => {
      switch (int) {
        case "week":
          return "weekly";
        case "month":
          return "monthly";
        case "year":
          return "yearly";
        default:
          return int;
      }
    };

    if (paymentType === "one_time") {
      // Create one-time payment checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Community Investment",
                description: "One-time donation to help local families with utility bills",
              },
              unit_amount: formatAmountForStripe(amount),
            },
            quantity: 1,
          },
        ],
        success_url: `${request.nextUrl.origin}/dashboard?payment=success&type=one_time`,
        cancel_url: `${request.nextUrl.origin}/subscribe?canceled=true`,
        metadata: {
          userId,
          paymentType: "one_time",
        },
      });

      return NextResponse.json({ sessionId: session.id, url: session.url });
    } else {
      // Create subscription checkout session
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
                description: `${getIntervalLabel(interval).charAt(0).toUpperCase() + getIntervalLabel(interval).slice(1)} recurring donation to local charities`,
              },
              recurring: {
                interval: interval,
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
          paymentType: "recurring",
          interval,
        },
      });

      return NextResponse.json({ sessionId: session.id, url: session.url });
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
