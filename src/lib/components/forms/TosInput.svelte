<script lang="ts">
	import { FileText, Upload, Mail, ArrowRight, Loader2, File } from 'lucide-svelte';
	import { cn } from '$lib/utils';

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

	let {
		onAnalyzeStart,
		onAnalyzeSuccess,
		onAnalyzeError
	}: {
		onAnalyzeStart: () => void;
		onAnalyzeSuccess: (data: AnalysisResult) => void;
		onAnalyzeError: (error: string) => void;
	} = $props();

	let activeTab = $state('paste');
	let text = $state('');
	let companyName = $state('');
	let file = $state<File | null>(null);
	let isPending = $state(false);
	let isDragActive = $state(false);
	let fileInputEl = $state<HTMLInputElement>();

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragActive = false;
		const files = e.dataTransfer?.files;
		if (files && files.length > 0 && files[0].type === 'application/pdf') {
			file = files[0];
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragActive = true;
	}

	function handleDragLeave() {
		isDragActive = false;
	}

	function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			file = input.files[0];
		}
	}

	async function handleScan() {
		if (isPending) return;
		onAnalyzeStart();
		isPending = true;

		try {
			if (activeTab === 'pdf') {
				if (!file) {
					onAnalyzeError('Please upload a PDF file first.');
					isPending = false;
					return;
				}
				const formData = new FormData();
				formData.append('file', file);
				if (companyName) formData.append('companyName', companyName);

				const res = await fetch('/api/tos/analyze-pdf', { method: 'POST', body: formData });
				const data = await res.json();
				if (!res.ok) {
					onAnalyzeError(data.error || 'Failed to analyze PDF.');
				} else {
					onAnalyzeSuccess(data);
				}
			} else {
				if (text.trim().length < 50) {
					onAnalyzeError('Please provide at least 50 characters of text.');
					isPending = false;
					return;
				}
				const res = await fetch('/api/tos/analyze', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ text, companyName: companyName || undefined })
				});
				const data = await res.json();
				if (!res.ok) {
					onAnalyzeError(data.error || 'Failed to analyze text.');
				} else {
					onAnalyzeSuccess(data);
				}
			}
		} catch {
			onAnalyzeError('An unexpected error occurred. Please try again.');
		} finally {
			isPending = false;
		}
	}

	const tabClass = (tab: string) =>
		cn(
			'px-6 py-3 rounded-full text-[13px] font-bold uppercase tracking-[1px] transition-all flex items-center gap-2 cursor-pointer',
			activeTab === tab
				? 'bg-yo-yellow text-black'
				: 'bg-surface-2 text-muted hover:bg-surface-3'
		);
</script>

<div class="w-full max-w-4xl mx-auto bg-surface-1 rounded-[30px] p-2 md:p-4 shadow-2xl relative z-20">
	<!-- Tabs -->
	<div class="flex flex-wrap items-center gap-2 p-4 pb-0 mb-6">
		<button class={tabClass('paste')} onclick={() => (activeTab = 'paste')}>
			<FileText size={16} /> Paste Text
		</button>
		<button class={tabClass('pdf')} onclick={() => (activeTab = 'pdf')}>
			<Upload size={16} /> Upload PDF
		</button>
		<button class={tabClass('email')} onclick={() => (activeTab = 'email')}>
			<Mail size={16} /> From Email
		</button>
	</div>

	<div class="px-4 pb-4">
		<!-- Company Name -->
		<div class="mb-4">
			<input
				type="text"
				placeholder="COMPANY NAME (OPTIONAL)"
				bind:value={companyName}
				class="w-full bg-surface-2 border border-white/5 rounded-xl px-6 py-4 text-foreground placeholder:text-muted focus:outline-none focus:border-yo-yellow/50 transition-colors uppercase text-sm font-bold tracking-wider"
				disabled={isPending}
			/>
		</div>

		<!-- Paste Text Tab -->
		{#if activeTab === 'paste'}
			<div class="h-[280px]">
				<textarea
					class="w-full h-full bg-surface-2 border border-white/5 rounded-[20px] p-6 text-foreground placeholder:text-muted resize-none focus:outline-none focus:border-yo-yellow/50 transition-colors text-lg"
					placeholder="Paste the Terms of Service, Privacy Policy, or contract here..."
					bind:value={text}
					disabled={isPending}
				></textarea>
			</div>
		{/if}

		<!-- Email Tab -->
		{#if activeTab === 'email'}
			<div class="h-[280px]">
				<textarea
					class="w-full h-full bg-surface-2 border border-white/5 rounded-[20px] p-6 text-foreground placeholder:text-muted resize-none focus:outline-none focus:border-yo-yellow/50 transition-colors text-lg"
					placeholder="Paste the email content notifying you of the ToS update..."
					bind:value={text}
					disabled={isPending}
				></textarea>
			</div>
		{/if}

		<!-- PDF Tab -->
		{#if activeTab === 'pdf'}
			<div class="h-[280px]">
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class={cn(
						'w-full h-full border-2 border-dashed rounded-[20px] flex flex-col items-center justify-center p-8 transition-all cursor-pointer',
						isDragActive
							? 'border-yo-yellow bg-yo-yellow/5'
							: 'border-white/10 hover:border-white/20 hover:bg-surface-3',
						file ? 'border-yo-yellow/50 bg-yo-yellow/5' : 'bg-surface-2',
						isPending && 'opacity-50 pointer-events-none'
					)}
					ondrop={handleDrop}
					ondragover={handleDragOver}
					ondragleave={handleDragLeave}
					onclick={() => fileInputEl?.click()}
				>
					<input
						bind:this={fileInputEl}
						type="file"
						accept=".pdf"
						class="hidden"
						onchange={handleFileSelect}
					/>
					{#if file}
						<div class="flex flex-col items-center text-center">
							<div
								class="w-16 h-16 rounded-full bg-yo-yellow/20 text-yo-yellow flex items-center justify-center mb-4"
							>
								<File size={32} />
							</div>
							<p class="text-xl font-bold text-foreground mb-2">{file.name}</p>
							<p class="text-muted text-sm uppercase tracking-widest">
								{(file.size / 1024 / 1024).toFixed(2)} MB &bull; Click to replace
							</p>
						</div>
					{:else}
						<div class="flex flex-col items-center text-center">
							<div
								class="w-16 h-16 rounded-full bg-surface-3 text-muted flex items-center justify-center mb-4"
							>
								<Upload size={32} />
							</div>
							<p class="text-xl font-bold text-foreground mb-2">DRAG & DROP YOUR PDF HERE</p>
							<p class="text-muted text-sm uppercase tracking-widest">or click to browse files</p>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	<!-- Scan Button -->
	<div class="p-4 pt-2">
		<button
			class="w-full py-6 text-lg tracking-[2px] rounded-full bg-yo-yellow text-black font-bold uppercase hover:bg-yo-yellow/90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
			onclick={handleScan}
			disabled={isPending}
		>
			{#if isPending}
				<span class="flex items-center justify-center gap-3">
					<Loader2 class="animate-spin" size={24} /> READING THE FINE PRINT...
				</span>
			{:else}
				<span class="flex items-center justify-center gap-3">
					SCAN NOW <ArrowRight size={20} />
				</span>
			{/if}
		</button>
	</div>
</div>
