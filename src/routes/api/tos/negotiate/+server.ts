import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { getOpenRouterClient } from '$lib/server/openrouter';

const MODEL = 'meta-llama/llama-3.3-70b-instruct';

const NEGOTIATE_SYSTEM_PROMPT = `You are an expert at drafting professional, respectful negotiation emails regarding Terms of Service clauses.
You help users push back on unfavorable ToS terms by writing concise, professional emails.

The email should:
- Be polite but assertive
- Clearly identify the specific clause being challenged
- Explain the user's concern from a privacy/rights perspective
- Request a specific change or clarification
- Be practical and professional (not threatening)
- Be 200-350 words total

Also provide 2-3 practical tips for negotiating this specific type of clause.

Respond ONLY with valid JSON in this format:
{
  "emailSubject": "...",
  "emailBody": "...",
  "tipsForNegotiation": ["tip1", "tip2", "tip3"]
}`;

const NegotiateTosBody = z.object({
	clauseExcerpt: z.string(),
	clauseCategory: z.string(),
	clauseExplanation: z.string(),
	companyName: z.string().optional(),
	userContext: z.string().optional()
});

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const parseResult = NegotiateTosBody.safeParse(body);

	if (!parseResult.success) {
		return json({ error: 'Invalid request body' }, { status: 400 });
	}

	const { clauseExcerpt, clauseCategory, clauseExplanation, companyName, userContext } = parseResult.data;

	const userMessage = `
Please draft a negotiation email for this Terms of Service clause:

Company: ${companyName ?? 'the company'}
Clause Category: ${clauseCategory}
Clause Text: "${clauseExcerpt}"
Why It's Problematic: ${clauseExplanation}
${userContext ? `Context about me: ${userContext}` : ''}

Draft a professional email I can send to request changes to this clause.`;

	try {
		const response = await getOpenRouterClient().chat.completions.create({
			model: MODEL,
			max_tokens: 8192,
			messages: [
				{ role: 'system', content: NEGOTIATE_SYSTEM_PROMPT },
				{ role: 'user', content: userMessage }
			]
		});

		const raw = response.choices[0]?.message?.content ?? '{}';
		const jsonStr = raw
			.replace(/^```(?:json)?\s*/i, '')
			.replace(/\s*```\s*$/, '')
			.trim();
		const result = JSON.parse(jsonStr);

		return json({
			emailSubject: result.emailSubject ?? `Re: Terms of Service - ${clauseCategory} Clause`,
			emailBody: result.emailBody ?? 'Unable to generate email. Please try again.',
			tipsForNegotiation: result.tipsForNegotiation ?? []
		});
	} catch (err) {
		console.error('Failed to generate negotiation email:', err);
		return json({ error: 'Failed to generate negotiation email. Please try again.' }, { status: 500 });
	}
};
