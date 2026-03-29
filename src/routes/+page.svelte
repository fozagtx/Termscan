<script lang="ts">
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import Landing from '$lib/components/Landing.svelte';
	import Results from '$lib/components/Results.svelte';
	import { fly } from 'svelte/transition';

	type AnalysisResult = {
		id: string;
		companyName: string | null;
		overallScore: number;
		overallSummary: string;
		clauses: Array<{
			id: string;
			category: string;
			excerpt: string;
			severity: string;
			explanation: string;
			severityScore: number;
		}>;
		createdAt: string;
	};

	let analysisResult = $state<AnalysisResult | null>(null);

	function handleReset() {
		analysisResult = null;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<svelte:head>
	<title>TermScan — AI-Powered ToS Analyzer</title>
</svelte:head>

<div class="min-h-screen bg-background">
	<Navbar onReset={handleReset} />

	{#if !analysisResult}
		<main>
			<Landing onAnalyzeSuccess={(data) => (analysisResult = data)} />
		</main>
	{:else}
		<div in:fly={{ y: 20, duration: 500 }}>
			<Results data={analysisResult} onReset={handleReset} />
		</div>
	{/if}
</div>
