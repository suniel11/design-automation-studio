import axios from 'axios';

export interface DesignFormData {
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
  brandTone: string;
  campaignType: string;
  headline: string;
  subheadline?: string;
  cta: string;
}

export interface DesignConcept {
  format: string;
  headline: string;
  subheadline: string;
  bodyCopy: string;
}

// Generates design copy/concepts via the Anthropic API. Real image generation
// (Genmax) and real Canva design creation are deferred to a later phase — see
// generateMockCanvaDesign for the placeholder used in the meantime.
export async function generateDesignConcept(format: string, data: DesignFormData): Promise<DesignConcept> {
  const prompt = `You are a marketing copywriter. Write a short, punchy design concept for a ${format} graphic.
Brand: ${data.brandName}
Tone: ${data.brandTone}
Campaign type: ${data.campaignType}
Brand colors: ${data.primaryColor} and ${data.secondaryColor}
Seed headline: ${data.headline}
${data.subheadline ? `Seed subheadline: ${data.subheadline}` : ''}
Call to action: ${data.cta}

Reply with exactly 3 lines, no labels or markdown:
Line 1: a refined headline (max 8 words)
Line 2: a supporting subheadline (max 14 words)
Line 3: one sentence of body copy (max 25 words)`;

  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: 'claude-sonnet-5',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    },
    {
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
    }
  );

  // The model may emit a `thinking` block before the `text` block, so find
  // the text block by type rather than assuming it's content[0].
  const textBlock = (response.data?.content || []).find((block: any) => block.type === 'text');
  const text: string = textBlock?.text || '';
  const lines = text.split('\n').map((l: string) => l.trim()).filter(Boolean);

  return {
    format,
    headline: lines[0] || data.headline,
    subheadline: lines[1] || data.subheadline || '',
    bodyCopy: lines[2] || '',
  };
}

// Placeholder until the real Canva API is wired in — keeps the same shape
// (`designId`/`editUrl`/`viewUrl`) the frontend gallery already expects.
export function generateMockCanvaDesign(format: string, brandName: string) {
  const designId = `mock-${Date.now()}-${format.toLowerCase().replace(/\s+/g, '-')}`;
  return {
    format,
    designId,
    editUrl: `https://www.canva.com/design/${designId}/edit`,
    viewUrl: `https://placehold.co/1080x1350?text=${encodeURIComponent(`${brandName} - ${format}`)}`,
  };
}
