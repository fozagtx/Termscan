<script lang="ts">
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import TosInput from '$lib/components/forms/TosInput.svelte';
	import Results from '$lib/components/Results.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { toast } from 'svelte-sonner';
	import { fly, fade } from 'svelte/transition';

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

	function handleError(error: string) {
		toast.error('ANALYSIS FAILED', { description: error });
	}
</script>

<svelte:head>
	<title>Dashboard — TermScan</title>
</svelte:head>

<div class="min-h-screen bg-background">
	<Navbar onReset={handleReset} />

	{#if !analysisResult}
		<div in:fade={{ duration: 400 }}>
			<!-- Header -->
			<section
				class="bg-background bg-grid-pattern rounded-b-[80px] pb-[120px] pt-28 relative z-40 border-b border-white/5"
			>
				<div
					class="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-blob blur-[120px] pointer-events-none z-0"
				></div>
				<div class="max-w-4xl mx-auto px-6 relative z-10 text-center">
					<p
						class="text-[11px] font-bold uppercase tracking-[2px] text-yo-yellow mb-4"
						in:fly={{ y: 20, duration: 500, delay: 100 }}
					>
						AI-Powered Analysis
					</p>
					<h1
						class="text-4xl md:text-[64px] font-bold text-white uppercase leading-[0.95] tracking-tight mb-6"
						in:fly={{ y: 20, duration: 500, delay: 200 }}
					>
						SCAN YOUR<br />
						<span class="text-yo-yellow">TERMS OF SERVICE</span>
					</h1>
					<p
						class="text-muted text-lg max-w-xl mx-auto leading-relaxed mb-12"
						in:fly={{ y: 20, duration: 500, delay: 300 }}
					>
						Paste the text, upload a PDF, or drop in an email update. We'll flag every risky clause
						in seconds.
					</p>

					<div in:fly={{ y: 30, duration: 500, delay: 400 }}>
						<TosInput
							onAnalyzeStart={() => {}}
							onAnalyzeSuccess={(data) => (analysisResult = data)}
							onAnalyzeError={handleError}
						/>
					</div>
				</div>
			</section>
			<Footer />
		</div>
	{:else}
		<div in:fly={{ y: 20, duration: 500 }}>
			<Results data={analysisResult} onReset={handleReset} />
		</div>
	{/if}
</div>
