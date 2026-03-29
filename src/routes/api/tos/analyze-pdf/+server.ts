import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
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

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const file = formData.get('file') as File | null;
	const companyName = (formData.get('companyName') as string) || undefined;

	if (!file) {
		return json({ error: 'No PDF file uploaded' }, { status: 400 });
	}

	try {
		const pdfParse = (await import('pdf-parse')).default;
		const buffer = Buffer.from(await file.arrayBuffer());
		const pdfData = await pdfParse(buffer);
		const text = pdfData.text;

		if (!text || text.trim().length < 50) {
			return json(
				{ error: 'Could not extract text from PDF, or the document is too short' },
				{ status: 400 }
			);
		}

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
		console.error('Failed to analyze PDF:', err);
		return json({ error: 'Failed to analyze PDF. Please ensure the file is a valid PDF.' }, { status: 500 });
	}
};
