<script lang="ts">
	import { ArrowLeft, ShieldAlert, ArrowRight } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import NegotiationDialog from '$lib/components/dialogs/NegotiationDialog.svelte';
	import { fly, fade } from 'svelte/transition';

	type Clause = {
		id: string;
		category: string;
		excerpt: string;
		severity: string;
		explanation: string;
		severityScore: number;
	};

	type AnalysisData = {
		id: string;
		companyName: string | null;
		overallScore: number;
		overallSummary: string;
		clauses: Clause[];
		createdAt: string;
	};

	let { data, onReset }: { data: AnalysisData; onReset: () => void } = $props();

	let selectedClause = $state<Clause | null>(null);
	let dialogOpen = $state(false);
	let progressWidth = $state(0);

	$effect(() => {
		const timer = setTimeout(() => {
			progressWidth = (data.overallScore / 10) * 100;
		}, 300);
		return () => clearTimeout(timer);
	});

	function getOverallColor(score: number) {
		if (score <= 3) return 'text-mild';
		if (score <= 6) return 'text-concerning';
		return 'text-danger';
	}

	function getOverallBgColor(score: number) {
		if (score <= 3) return 'bg-mild';
		if (score <= 6) return 'bg-concerning';
		return 'bg-danger';
	}

	function getOverallLabel(score: number) {
		if (score <= 3) return 'LOW RISK';
		if (score <= 6) return 'MODERATE RISK';
		return 'HIGH RISK';
	}

	function getClauseColor(severity: string) {
		switch (severity) {
			case 'mild':
				return 'bg-mild text-mild-foreground';
			case 'concerning':
				return 'bg-concerning text-concerning-foreground';
			case 'dangerous':
				return 'bg-danger text-danger-foreground';
			default:
				return 'bg-surface-3 text-white';
		}
	}

	function getScoreCircleColor(score: number) {
		if (score <= 3) return 'border-mild text-mild';
		if (score <= 6) return 'border-concerning text-concerning';
		return 'border-danger text-danger';
	}

	function openNegotiation(clause: Clause) {
		selectedClause = clause;
		dialogOpen = true;
	}
</script>

<div class="min-h-screen w-full bg-background pt-32 pb-24">
	<div class="max-w-[1200px] mx-auto px-6">
		<!-- Header Actions -->
		<div class="flex items-center justify-between mb-12" in:fade={{ duration: 500 }}>
			<button
				onclick={onReset}
				class="pl-0 hover:text-yo-yellow group flex items-center gap-2 text-foreground font-bold uppercase tracking-widest text-sm transition-colors"
			>
				<ArrowLeft size={20} class="group-hover:-translate-x-1 transition-transform" />
				BACK TO SCANNER
			</button>
			{#if data.companyName}
				<div
					class="px-4 py-2 rounded-full bg-surface-2 border border-white/5 text-sm font-bold tracking-widest text-muted uppercase"
				>
					SCANNING: <span class="text-white">{data.companyName}</span>
				</div>
			{/if}
		</div>

		<!-- Score Card -->
		<div
			class="bg-surface-1 rounded-[40px] p-10 md:p-16 mb-16 shadow-2xl relative overflow-hidden border border-white/5"
			in:fly={{ y: 20, duration: 600 }}
		>
			<div class="absolute top-0 right-0 w-64 h-64 bg-blob opacity-50 pointer-events-none"></div>

			<div class="flex flex-col md:flex-row gap-12 md:items-end relative z-10">
				<div class="shrink-0">
					<p class="text-sm font-bold text-muted uppercase tracking-[2px] mb-2">OVERALL SEVERITY</p>
					<div class="flex items-baseline gap-2">
						<span
							class={cn(
								'text-[96px] md:text-[120px] font-bold leading-none tracking-tighter',
								getOverallColor(data.overallScore)
							)}
						>
							{data.overallScore}
						</span>
						<span class="text-4xl text-muted font-bold pb-4">/10</span>
					</div>
					<span
						class={cn(
							'inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mt-2',
							getClauseColor(
								data.overallScore <= 3
									? 'mild'
									: data.overallScore <= 6
										? 'concerning'
										: 'dangerous'
							)
						)}
					>
						{getOverallLabel(data.overallScore)}
					</span>
				</div>

				<div class="flex-1 w-full space-y-6">
					<div class="h-3 w-full bg-white/10 rounded-full overflow-hidden">
						<div
							class={cn(
								'h-full rounded-full transition-all duration-[1200ms] ease-out',
								getOverallBgColor(data.overallScore)
							)}
							style="width: {progressWidth}%"
						></div>
					</div>
					<p class="text-xl md:text-2xl text-foreground leading-relaxed">
						{data.overallSummary}
					</p>
					<div class="flex items-center gap-6 text-sm text-muted font-bold uppercase tracking-widest">
						<span>{data.clauses.length} clause{data.clauses.length !== 1 ? 's' : ''} flagged</span>
						{#if data.clauses.filter((c) => c.severity === 'dangerous').length > 0}
							<span class="text-danger">
								{data.clauses.filter((c) => c.severity === 'dangerous').length} dangerous
							</span>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- Clauses List -->
		<div class="space-y-8">
			<div class="flex items-center gap-4 mb-8">
				<ShieldAlert class="text-yo-yellow" size={32} />
				<h2 class="text-3xl md:text-4xl font-bold text-white uppercase tracking-tight">
					FLAGGED CLAUSES
				</h2>
			</div>

			{#if data.clauses.length === 0}
				<div class="bg-surface-1 rounded-[30px] p-16 text-center border border-white/5">
					<h3 class="text-2xl font-bold text-yo-yellow mb-4 uppercase">NO MAJOR ISSUES DETECTED</h3>
					<p class="text-muted text-lg">
						This agreement appears to be standard without heavily aggressive clauses.
					</p>
				</div>
			{:else}
				<div class="grid gap-6">
					{#each data.clauses as clause, idx (clause.id)}
						<div
							class="bg-surface-1 rounded-[30px] p-8 md:p-10 border border-white/5 group hover:border-white/10 transition-colors"
							in:fly={{ y: 20, duration: 500, delay: idx * 100 }}
						>
							<div class="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
								<div>
									<div class="flex flex-wrap items-center gap-3 mb-4">
										<span
											class={cn(
												'px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full',
												getClauseColor(clause.severity)
											)}
										>
											{clause.severity}
										</span>
										<span class="text-sm font-bold text-muted uppercase tracking-widest">
											{clause.category}
										</span>
									</div>
									<h3 class="text-2xl font-bold text-white mb-2 leading-tight uppercase">
										{clause.explanation}
									</h3>
								</div>

								<div class="shrink-0">
									<div
										class={cn(
											'w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center border-2',
											getScoreCircleColor(clause.severityScore)
										)}
									>
										<span
											class={cn(
												'text-2xl font-bold',
												getScoreCircleColor(clause.severityScore).split(' ')[1]
											)}
										>
											{clause.severityScore}
										</span>
									</div>
								</div>
							</div>

							<div class="bg-surface-2 rounded-[20px] p-6 mb-8 border border-white/5">
								<p class="text-sm text-muted font-mono leading-relaxed">
									"{clause.excerpt}"
								</p>
							</div>

							<div class="flex justify-end">
								<button
									onclick={() => openNegotiation(clause)}
									class="w-full md:w-auto px-8 py-4 rounded-full bg-surface-2 border border-white/10 text-foreground font-bold uppercase tracking-widest text-sm hover:bg-surface-3 hover:border-white/20 transition-all flex items-center justify-center gap-2"
								>
									DRAFT NEGOTIATION EMAIL <ArrowRight
										size={16}
										class="group-hover:translate-x-1 transition-transform"
									/>
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<NegotiationDialog
	bind:open={dialogOpen}
	clause={selectedClause}
	companyName={data.companyName}
/>
