import { Router, Response } from 'express';
import Stripe from 'stripe';
import { User } from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { getPlanLimit, getPlanPriceId } from '../utils/plans';

const router = Router();

// Test-mode only for the MVP — no webhooks, not wired to any UI yet.
router.post('/subscribe', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { planId } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
    const subscription = await stripe.subscriptions.create({
      customer: user._id.toString(),
      items: [{ price: getPlanPriceId(planId) }],
    });

    await User.findByIdAndUpdate(req.userId, {
      plan: planId,
      subscriptionId: subscription.id,
      monthlyLimit: getPlanLimit(planId),
    });

    res.json({ subscription });
  } catch (error) {
    res.status(400).json({ error: 'Failed to create subscription' });
  }
});

export default router;
