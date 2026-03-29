import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { getOpenRouterClient } from '$lib/server/openrouter';

const MODEL = 'meta-llama/llama-3.3-70b-instruct';

const SYSTEM_PROMPT = `You are a legal expert specializing in consumer protection and Terms of Service analysis.
Your job is to analyze Terms of Service documents and identify clauses that may be harmful, deceptive, or problematic for users.

For each problematic clause you find, classify it with:
- category: one of [Data Selling, Data Collection, Auto-Renewal, Arbitration, Liability Waiver, Account Termination, Intellectual Property, Privacy, Behavioral Tracking, Content Ownership, Subscription Trap, Third-Party Sharing]
- severity: "mild" (worth knowing), "concerning" (potentially harmful), or "dangerous" (actively harms user rights)
- severityScore: 1-10 (1=minor annoyance, 10=extremely aggressive)
- excerpt: the exact problematic text from the document (keep under 300 chars)
- explanation: plain English explanation of why this matters (2-3 sentences max)

Also provide an overallScore (1-10) and a 2-3 sentence overallSummary.

Respond ONLY with valid JSON in this exact format:
{
  "overallScore": 7,
  "overallSummary": "...",
  "clauses": [
    {
      "id": "clause-1",
      "category": "Data Selling",
      "excerpt": "...",
      "severity": "dangerous",
      "severityScore": 9,
      "explanation": "..."
    }
  ]
}`;

const AnalyzeTosBody = z.object({
	text: z.string().min(50, 'Text must be at least 50 characters long'),
	companyName: z.string().optional()
});

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const parseResult = AnalyzeTosBody.safeParse(body);

	if (!parseResult.success) {
		return json({ error: parseResult.error.issues[0]?.message ?? 'Invalid request body' }, { status: 400 });
	}

	const { text, companyName } = parseResult.data;

	try {
		const userMessage = `${companyName ? `Company: ${companyName}\n\n` : ''}Terms of Service text:\n\n${text.substring(0, 15000)}`;

		const response = await getOpenRouterClient().chat.completions.create({
			model: MODEL,
			max_tokens: 8192,
			messages: [
				{ role: 'system', content: SYSTEM_PROMPT },
				{ role: 'user', content: userMessage }
			],
			response_format: { type: 'json_object' }
		});

		const raw = response.choices[0]?.message?.content ?? '{}';
		const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
		const aiResult = JSON.parse(jsonStr);

		return json({
			id: crypto.randomUUID(),
			companyName: companyName ?? null,
			overallScore: aiResult.overallScore ?? 5,
			overallSummary: aiResult.overallSummary ?? 'Analysis complete.',
			clauses: (aiResult.clauses ?? []).map((c: Record<string, unknown>, i: number) => ({
				id: `clause-${i + 1}`,
				category: (c.category as string) ?? 'General',
				excerpt: (c.excerpt as string) ?? '',
				severity: (c.severity as string) ?? 'mild',
				explanation: (c.explanation as string) ?? '',
				severityScore: (c.severityScore as number) ?? 5
			})),
			createdAt: new Date().toISOString()
		});
	} catch (err) {
		console.error('Failed to analyze ToS:', err);
		return json({ error: 'Failed to analyze Terms of Service. Please try again.' }, { status: 500 });
	}
};
