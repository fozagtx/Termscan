<script lang="ts">
	import { X, Copy, Mail, CheckCircle, Loader2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { fly, fade } from 'svelte/transition';
	import { untrack } from 'svelte';

	type Clause = {
		id: string;
		category: string;
		excerpt: string;
		severity: string;
		explanation: string;
		severityScore: number;
	};

	type NegotiationResult = {
		emailSubject: string;
		emailBody: string;
		tipsForNegotiation: string[];
	};

	let {
		open = $bindable(false),
		clause,
		companyName
	}: {
		open: boolean;
		clause: Clause | null;
		companyName: string | null;
	} = $props();

	let isPending = $state(false);
	let isError = $state(false);
	let data = $state<NegotiationResult | null>(null);
	let hasCopied = $state(false);

	$effect(() => {
		const isOpen = open;
		const currentClause = clause;

		untrack(() => {
			if (isOpen && currentClause) {
				fetchNegotiation(currentClause);
			} else {
				data = null;
				isError = false;
				hasCopied = false;
				isPending = false;
			}
		});
	});

	async function fetchNegotiation(targetClause: Clause) {
		isPending = true;
		isError = false;
		data = null;

		try {
			const res = await fetch('/api/tos/negotiate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					clauseExcerpt: targetClause.excerpt,
					clauseCategory: targetClause.category,
					clauseExplanation: targetClause.explanation,
					companyName: companyName ?? undefined
				})
			});

			if (!res.ok) {
				isError = true;
			} else {
				data = await res.json();
			}
		} catch {
			isError = true;
		} finally {
			isPending = false;
		}
	}

	function handleRetry() {
		if (clause) fetchNegotiation(clause);
	}

	async function handleCopy() {
		if (!data?.emailBody) return;

		try {
			await navigator.clipboard.writeText(`${data.emailSubject}\n\n${data.emailBody}`);
			hasCopied = true;
			toast.success('COPIED TO CLIPBOARD', { description: 'The email is ready to be sent.' });
			setTimeout(() => (hasCopied = false), 2000);
		} catch {
			toast.error('FAILED TO COPY', { description: 'Please copy the text manually.' });
		}
	}

	function close() {
		open = false;
	}

	function handleBackdropKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
		in:fade={{ duration: 200 }}
		out:fade={{ duration: 200 }}
		onclick={close}
		onkeydown={handleBackdropKeydown}
	></div>

	<div
		class="fixed bottom-0 left-0 right-0 md:left-auto md:right-6 md:bottom-6 md:top-6 md:w-[600px] z-50 flex flex-col bg-surface-1 rounded-t-[40px] md:rounded-[40px] shadow-2xl border border-white/10 overflow-hidden max-h-[90vh] md:max-h-none"
		in:fly={{ y: 300, duration: 400 }}
		out:fly={{ y: 300, duration: 300 }}
		role="dialog"
		aria-modal="true"
		aria-label="Negotiation Email"
	>
		<!-- Header -->
		<div class="flex items-center justify-between p-8 pb-6 border-b border-white/10 shrink-0">
			<div>
				<h2 class="text-2xl font-bold text-foreground flex items-center gap-3">
					<Mail class="text-yo-yellow" size={24} />
					FIGHT BACK
				</h2>
				<p class="text-sm text-muted uppercase tracking-widest mt-1">
					{clause?.category} Negotiation
				</p>
			</div>
			<button
				onclick={close}
				class="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-muted hover:text-white hover:bg-surface-3 transition-colors"
			>
				<X size={20} />
			</button>
		</div>

		<!-- Content -->
		<div class="flex-1 overflow-y-auto p-8">
			{#if isPending}
				<div class="flex flex-col items-center justify-center text-center space-y-6 py-20">
					<Loader2 size={48} class="text-yo-yellow animate-spin" />
					<div>
						<h3 class="text-xl font-bold mb-2">DRAFTING YOUR EMAIL...</h3>
						<p class="text-muted">
							Our legal AI is crafting the perfect professional response to challenge this clause.
						</p>
					</div>
				</div>
			{:else if isError}
				<div class="flex flex-col items-center justify-center text-center space-y-6 py-20">
					<div class="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
						<span class="text-red-400 text-2xl font-bold">!</span>
					</div>
					<div>
						<h3 class="text-xl font-bold mb-2 text-white">FAILED TO GENERATE</h3>
						<p class="text-muted mb-6">
							The AI couldn't draft the email right now. Please try again.
						</p>
						<button
							onclick={handleRetry}
							class="px-6 py-3 rounded-full bg-yo-yellow text-black font-bold uppercase tracking-widest text-sm hover:bg-yo-yellow/90 transition-colors"
						>
							Retry
						</button>
					</div>
				</div>
			{:else if data}
				<div class="space-y-8">
					<!-- Email preview -->
					<div class="bg-surface-2 rounded-[24px] p-6 space-y-4">
						<div class="border-b border-white/10 pb-4">
							<span class="text-xs font-bold text-muted uppercase tracking-widest block mb-1">Subject</span>
							<span class="text-white font-bold">{data.emailSubject}</span>
						</div>
						<div class="pt-2">
							<span class="text-xs font-bold text-muted uppercase tracking-widest block mb-3">Message</span>
							<div class="text-foreground whitespace-pre-wrap leading-relaxed text-sm">
								{data.emailBody}
							</div>
						</div>
					</div>

					<!-- Tips -->
					{#if data.tipsForNegotiation && data.tipsForNegotiation.length > 0}
						<div class="space-y-4">
							<h3 class="text-sm font-bold text-yo-yellow uppercase tracking-widest">Pro Tips</h3>
							<ul class="space-y-3">
								{#each data.tipsForNegotiation as tip}
									<li class="flex gap-3 text-sm text-muted items-start">
										<CheckCircle size={16} class="text-yo-yellow shrink-0 mt-0.5" />
										<span>{tip}</span>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
			{:else}
				<div class="py-20 text-center text-muted">
					Something went wrong generating the email.
				</div>
			{/if}
		</div>

		<!-- Footer Action -->
		<div class="p-6 bg-surface-2 border-t border-white/10 flex justify-end shrink-0">
			<button
				class="w-full md:w-auto px-8 py-4 rounded-full bg-yo-yellow text-black font-bold uppercase tracking-widest text-sm hover:bg-yo-yellow/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
				disabled={isPending || !data}
				onclick={handleCopy}
			>
				{#if hasCopied}
					<CheckCircle size={18} /> COPIED!
				{:else}
					<Copy size={18} /> COPY EMAIL TO CLIPBOARD
				{/if}
			</button>
		</div>
	</div>
{/if}
