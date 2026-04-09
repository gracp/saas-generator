import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { dbGetUser } from '@/lib/db';
import { createPortalSession } from '@/lib/stripe-app';

// POST /api/billing/portal — create Stripe Customer Portal session
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dbUser = await dbGetUser(session.user.email);
    const stripeCustomerId = dbUser?.stripeCustomerId;

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'No active subscription found. Please subscribe first.' },
        { status: 400 }
      );
    }

    const returnUrl = process.env.NEXTAUTH_URL
      ? `${process.env.NEXTAUTH_URL}/dashboard/settings`
      : 'http://localhost:3457/dashboard/settings';

    const portalSession = await createPortalSession({
      customerId: stripeCustomerId,
      returnUrl,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to open portal';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
