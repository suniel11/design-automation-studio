import { Router, Response } from 'express';
import { User } from '../models/User';
import { Design } from '../models/Design';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { generateDesignConcept, generateMockCanvaDesign, DesignFormData } from '../services/anthropic';

const router = Router();

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { brandName, primaryColor, secondaryColor, brandTone, campaignType, headline, subheadline, cta, formats } = req.body;

    if (!brandName || !headline || !Array.isArray(formats) || formats.length === 0) {
      return res.status(400).json({ error: 'brandName, headline, and at least one format are required' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.monthlyUsage >= user.monthlyLimit) {
      return res.status(403).json({ error: 'Monthly design limit reached. Upgrade your plan.' });
    }

    const design = new Design({
      userId: req.userId,
      title: `${brandName} - ${new Date().toLocaleDateString()}`,
      brandName,
      primaryColor,
      secondaryColor,
      brandTone,
      campaignType,
      headline,
      subheadline,
      cta,
      formats,
      status: 'generating',
    });

    await design.save();

    generateDesignAsync(design._id.toString(), req.userId as string, {
      brandName,
      primaryColor,
      secondaryColor,
      brandTone,
      campaignType,
      headline,
      subheadline,
      cta,
    }, formats);

    res.json(design);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create design' });
  }
});

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const designs = await Design.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(designs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch designs' });
  }
});

router.post('/:id/export', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { format = 'png' } = req.body;
    const design = await Design.findOne({ _id: req.params.id, userId: req.userId });

    if (!design) {
      return res.status(404).json({ error: 'Design not found' });
    }

    // Mock download URL until the real Canva export API is wired in.
    const downloadUrl = `https://example.com/exports/${design._id}.${format}`;

    design.status = 'exported';
    design.exports.push({ format, url: downloadUrl, createdAt: new Date() });
    await design.save();

    res.json({ downloadUrl, format });
  } catch (error) {
    res.status(500).json({ error: 'Failed to export design' });
  }
});

async function generateDesignAsync(designId: string, userId: string, formData: DesignFormData, formats: string[]) {
  try {
    const concepts = await Promise.all(
      formats.map((format) => generateDesignConcept(format, formData))
    );

    const canvaDesigns = formats.map((format) => generateMockCanvaDesign(format, formData.brandName));

    await Design.findByIdAndUpdate(designId, {
      concepts,
      canvaDesigns,
      status: 'ready',
      updatedAt: new Date(),
    });

    await User.findByIdAndUpdate(userId, { $inc: { monthlyUsage: 1 } });
  } catch (error) {
    console.error('Error generating design:', error);
    await Design.findByIdAndUpdate(designId, { status: 'error' });
  }
}

export default router;
