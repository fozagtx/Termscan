import OpenAI from 'openai';
import { env } from '$env/dynamic/private';

export function getOpenRouterClient() {
	const apiKey = env.OPENROUTER_API_KEY;
	if (!apiKey) {
		throw new Error('OPENROUTER_API_KEY must be set.');
	}
	return new OpenAI({
		baseURL: 'https://openrouter.ai/api/v1',
		apiKey
	});
}
