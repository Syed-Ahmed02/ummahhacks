import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

// Server-side Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover",
  typescript: true,
});

// Client-side Stripe.js (for frontend)
export const getStripePublishableKey = () => {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
};

// Helper function to format amount for Stripe (convert dollars to cents)
export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100);
};

// Helper function to format amount from Stripe (convert cents to dollars)
export const formatAmountFromStripe = (amount: number): number => {
  return amount / 100;
};

// Helper to get or create a Stripe customer
export async function getOrCreateCustomer(
  email: string,
  userId: string
): Promise<string> {
  // Search for existing customer by email
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (customers.data.length > 0) {
    return customers.data[0].id;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  });

  return customer.id;
}
