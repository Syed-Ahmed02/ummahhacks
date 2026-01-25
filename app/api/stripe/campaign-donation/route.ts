import { NextRequest, NextResponse } from "next/server";
import { stripe, getOrCreateCustomer, formatAmountForStripe } from "@/lib/stripe";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const {
      campaignId,
      amount,
      donorName,
      donorEmail,
      isAnonymous,
      message,
    } = body;

    // Validate inputs
    if (!campaignId || !amount || !donorEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 1) {
      return NextResponse.json(
        { error: "Invalid amount. Minimum is $1." },
        { status: 400 }
      );
    }

    // Get campaign
    const campaign = await convex.query(api.campaigns.getCampaignById, {
      campaignId,
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    if (!campaign.isActive || campaign.isCompleted) {
      return NextResponse.json(
        { error: "Campaign is not accepting donations" },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let customerId: string | null = null;
    if (userId) {
      const user = await currentUser();
      const userEmail = user?.emailAddresses?.[0]?.emailAddress || donorEmail;
      customerId = await getOrCreateCustomer(userEmail, userId);
    } else {
      // For guest donations, create a customer with just email
      const customers = await stripe.customers.list({
        email: donorEmail,
        limit: 1,
      });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: donorEmail,
        });
        customerId = customer.id;
      }
    }

    // Get Convex user ID if authenticated
    let donorUserId = null;
    if (userId) {
      const convexUser = await convex.query(api.users.getUserByClerkId, {
        clerkId: userId,
      });
      if (convexUser) {
        donorUserId = convexUser._id;
      }
    }

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(amountNum),
      currency: "cad",
      customer: customerId,
      metadata: {
        campaignId,
        donorEmail,
        donorName: donorName || "Anonymous",
        isAnonymous: isAnonymous ? "true" : "false",
        message: message || "",
        type: "campaign_donation",
      },
      description: `Donation to campaign: ${campaign.title}`,
    });

    // Create donation record in Convex
    const donationId = await convex.mutation(api.campaigns.createDonation, {
      campaignId,
      donorUserId: donorUserId || undefined,
      donorEmail,
      donorName: donorName || undefined,
      isAnonymousDonation: isAnonymous,
      amount: amountNum,
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId: customerId || undefined,
      message: message || undefined,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      donationId,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Error creating campaign donation:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process donation" },
      { status: 500 }
    );
  }
}
