import { Router, Response } from 'express';
import Stripe from 'stripe';
import { User } from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { getPlanLimit, getPlanPriceId } from '../utils/plans';

const router = Router();

// Test-mode only for the MVP. Uses a hosted Stripe Checkout Session instead
// of creating a subscription directly — that would require an attached
// payment method we don't collect. No webhooks yet: the frontend calls
// /confirm on the success redirect, which verifies payment_status
// server-side against Stripe before updating the user's plan.
router.post('/checkout', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { planId } = req.body;
    const priceId = getPlanPriceId(planId);
    if (!priceId) {
      return res.status(400).json({ error: 'Unknown or unsupported plan' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId: user._id.toString() },
      });
      customerId = customer.id;
      await User.findByIdAndUpdate(user._id, { stripeCustomerId: customerId });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${frontendUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/pricing?checkout=cancelled`,
      metadata: { userId: user._id.toString(), planId },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Failed to create checkout session:', error);
    res.status(400).json({ error: 'Failed to start checkout' });
  }
});

// Called by the frontend on the success redirect. Verifies the session
// server-side rather than trusting the redirect query params.
router.get('/confirm', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const sessionId = req.query.session_id as string;
    if (!sessionId) {
      return res.status(400).json({ error: 'session_id is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.customer !== user.stripeCustomerId) {
      return res.status(403).json({ error: 'Session does not belong to this account' });
    }

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed', status: session.payment_status });
    }

    const planId = session.metadata?.planId || 'starter';
    const updated = await User.findByIdAndUpdate(
      user._id,
      {
        plan: planId,
        subscriptionId: session.subscription as string,
        monthlyLimit: getPlanLimit(planId),
      },
      { new: true }
    );

    res.json({
      plan: updated?.plan,
      monthlyLimit: updated?.monthlyLimit,
    });
  } catch (error) {
    console.error('Failed to confirm checkout session:', error);
    res.status(400).json({ error: 'Failed to confirm checkout' });
  }
});

export default router;
