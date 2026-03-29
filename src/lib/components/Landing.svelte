<script lang="ts">
	import {
		ShieldX,
		AlertTriangle,
		FileText,
		XCircle,
		Play,
		ShieldCheck,
		Zap,
		Lock,
		Globe,
		ChevronDown
	} from 'lucide-svelte';
	import TosInput from '$lib/components/forms/TosInput.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { toast } from 'svelte-sonner';
	import { fly, fade, slide } from 'svelte/transition';

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

	let { onAnalyzeSuccess }: { onAnalyzeSuccess: (data: AnalysisResult) => void } = $props();

	const VIDEO_ID = 'kdQpROIl08Y';
	let videoPlaying = $state(false);

	const faqs = [
		{
			q: 'What is TermScan?',
			a: 'TermScan is an AI-powered tool that reads Terms of Service documents for you. Paste text, upload a PDF, or drop in email content and we will analyse every clause, rate its severity, and explain what it means in plain English.'
		},
		{
			q: 'Is it free to use?',
			a: 'Yes. You can start analysing Terms of Service documents right away with no subscription required. Just paste your text and hit Scan.'
		},
		{
			q: 'How accurate is the analysis?',
			a: "TermScan uses Llama 3.3 70B, a state-of-the-art large language model with strong legal comprehension. While it catches the vast majority of harmful clauses, it is not a substitute for professional legal advice. Always consult a lawyer for high-stakes agreements."
		},
		{
			q: 'What kinds of clauses does TermScan flag?',
			a: 'We detect 12 risk categories: Data Selling, Data Collection, Auto-Renewal, Arbitration, Liability Waiver, Account Termination, Intellectual Property, Privacy, Behavioral Tracking, Content Ownership, Subscription Traps, and Third-Party Sharing.'
		},
		{
			q: 'Can I upload a PDF?',
			a: 'Yes. Use the Upload PDF tab in the input form. We extract the text from your file and run the same full analysis. PDF files up to 10 MB are supported.'
		},
		{
			q: 'What does the severity score mean?',
			a: 'Each clause gets a score from 1 to 10. Scores 1\u20133 are Mild (worth knowing but generally harmless), 4\u20136 are Concerning (potentially harmful), and 7\u201310 are Dangerous (actively harms your rights or interests).'
		},
		{
			q: 'What is the negotiation email feature?',
			a: "For any flagged clause, you can click 'Draft Negotiation Email' to have the AI write a professional email challenging that specific clause. It includes a subject line, a polite but firm email body, and tips for negotiating effectively."
		},
		{
			q: 'Do you store my ToS text?',
			a: 'We store anonymised analysis results in our database to improve the service. We do not link your analysed text to your identity, and we never sell your data.'
		},
		{
			q: 'Do I need to create an account?',
			a: 'No. You can analyse documents without signing in.'
		},
		{
			q: 'What AI model powers TermScan?',
			a: 'We use meta-llama/llama-3.3-70b-instruct served via OpenRouter. It is one of the most capable openly available models for instruction-following and document analysis tasks.'
		}
	];

	let openFaqIndex = $state<number | null>(null);

	function toggleFaq(i: number) {
		openFaqIndex = openFaqIndex === i ? null : i;
	}

	function handleStart() {}
	function handleError(error: string) {
		toast.error('ANALYSIS FAILED', { description: error });
	}

	const aiSpecs = [
		{ label: 'Model', value: 'Llama 3.3 70B Instruct' },
		{ label: 'Categories detected', value: '12 risk types' },
		{ label: 'Severity scale', value: '1\u201310 per clause' },
		{ label: 'Average analysis time', value: '< 30 seconds' }
	];
</script>

<div class="min-h-screen w-full bg-background relative overflow-hidden">
	<div
		class="absolute top-[-100px] right-[-100px] w-[600px] h-[600px] bg-blob blur-[120px] pointer-events-none z-0"
	></div>

	<!-- SECTION 1: HERO -->
	<section
		id="hero"
		class="bg-background bg-grid-pattern rounded-b-[120px] pb-[170px] pt-32 relative z-40 shadow-pill border-b border-white/5"
	>
		<div class="max-w-[1700px] mx-auto px-6 relative z-10">
			<div class="flex flex-col items-center text-center max-w-5xl mx-auto mb-16">
				<h1
					class="text-5xl md:text-[88px] font-bold text-white uppercase leading-[0.9] tracking-tight mb-4"
					in:fly={{ y: 30, duration: 600 }}
				>
					YOU HATE READING<br />TERMS OF SERVICE.
				</h1>
				<h2
					class="text-4xl md:text-[88px] font-bold text-yo-yellow uppercase leading-[0.9] tracking-tight mb-8"
					in:fly={{ y: 30, duration: 600, delay: 100 }}
				>
					WE KNOW.
				</h2>
				<p
					class="text-lg md:text-xl text-muted max-w-2xl leading-relaxed"
					in:fly={{ y: 30, duration: 600, delay: 200 }}
				>
					We read the fine print so you don't have to. Paste, upload, or drop your ToS and we'll
					tell you exactly how bad it is and help you fight back.
				</p>
			</div>

			<!-- VIDEO DEMO CARD -->
			<div class="max-w-3xl mx-auto mb-10" in:fly={{ y: 40, duration: 600, delay: 300 }}>
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="relative rounded-[28px] overflow-hidden border border-white/10 shadow-2xl bg-black cursor-pointer group"
					onclick={() => (videoPlaying = true)}
					style="aspect-ratio: 16/9"
				>
					{#if videoPlaying}
						<iframe
							class="w-full h-full"
							src="https://www.youtube.com/embed/{VIDEO_ID}?autoplay=1&rel=0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowfullscreen
							title="TermScan demo video"
						></iframe>
					{:else}
						<img
							src="https://img.youtube.com/vi/{VIDEO_ID}/maxresdefault.jpg"
							alt="TermScan demo video"
							class="w-full h-full object-cover brightness-75 group-hover:brightness-60 transition-all duration-300"
						/>
						<div class="absolute inset-0 flex flex-col items-center justify-center gap-4">
							<div
								class="w-20 h-20 rounded-full bg-yo-yellow flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300"
							>
								<Play size={32} class="text-black fill-black ml-1" />
							</div>
							<span
								class="text-white font-bold uppercase tracking-widest text-sm bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm"
								>Watch Quick Demo</span
							>
						</div>
					{/if}
				</div>
			</div>

			<!-- FORM -->
			<div in:fly={{ y: 40, duration: 600, delay: 500 }}>
				<TosInput
					onAnalyzeStart={handleStart}
					{onAnalyzeSuccess}
					onAnalyzeError={handleError}
				/>
			</div>
		</div>
	</section>

	<!-- SECTION 2: STATS -->
	<section
		class="bg-surface-1 rounded-b-[120px] pt-[200px] pb-[170px] -mt-[120px] relative z-30 shadow-pill border-b border-black/50"
	>
		<div class="max-w-[1700px] mx-auto px-6">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div class="bg-surface-2 rounded-[20px] p-8 border-t-4 border-yo-yellow shadow-xl">
					<p class="text-[11px] font-bold uppercase tracking-[1.2px] text-muted mb-4">
						The Problem
					</p>
					<h3 class="text-5xl font-bold text-yo-yellow mb-2">7.2B</h3>
					<p class="text-foreground text-lg">
						Users affected by hidden data-selling clauses daily.
					</p>
				</div>
				<div class="bg-surface-2 rounded-[20px] p-8 border-t-4 border-card-mint shadow-xl">
					<p class="text-[11px] font-bold uppercase tracking-[1.2px] text-muted mb-4">The Trap</p>
					<h3 class="text-5xl font-bold text-card-mint mb-2">89%</h3>
					<p class="text-foreground text-lg">Of major services contain auto-renewal traps.</p>
				</div>
				<div class="bg-surface-2 rounded-[20px] p-8 border-t-4 border-card-cyan shadow-xl">
					<p class="text-[11px] font-bold uppercase tracking-[1.2px] text-muted mb-4">
						The Solution
					</p>
					<h3 class="text-5xl font-bold text-card-cyan mb-2">3 MIN</h3>
					<p class="text-foreground text-lg">
						Average time to understand your rights with TermScan.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- SECTION 3: HOW IT WORKS -->
	<section
		class="bg-background rounded-b-[120px] pt-[200px] pb-[170px] -mt-[120px] relative z-20 shadow-pill border-b border-white/5"
	>
		<div class="max-w-[1700px] mx-auto px-6">
			<h2 class="text-4xl md:text-[56px] font-bold text-white mb-16 text-center">
				HOW IT WORKS
			</h2>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div
					class="bg-[#ECEEE7] rounded-[30px] p-10 transform hover:-translate-y-2 transition-transform duration-300"
				>
					<p class="text-xs font-bold text-black/40 uppercase tracking-widest mb-4">STEP 01</p>
					<h3
						class="text-[32px] md:text-[40px] font-bold text-black uppercase leading-[1.1] mb-4"
					>
						PASTE OR UPLOAD
					</h3>
					<p class="text-black/80 text-lg">
						Drop the text, a PDF, or an email update into our scanner.
					</p>
				</div>
				<div
					class="bg-[#ECEEE7] rounded-[30px] p-10 transform hover:-translate-y-2 transition-transform duration-300 md:mt-8"
				>
					<p class="text-xs font-bold text-black/40 uppercase tracking-widest mb-4">STEP 02</p>
					<h3
						class="text-[32px] md:text-[40px] font-bold text-black uppercase leading-[1.1] mb-4"
					>
						AI SCANS EVERYTHING
					</h3>
					<p class="text-black/80 text-lg">
						Our legal AI identifies dangerous clauses hidden in the jargon.
					</p>
				</div>
				<div
					class="bg-[#ECEEE7] rounded-[30px] p-10 transform hover:-translate-y-2 transition-transform duration-300 md:mt-16"
				>
					<p class="text-xs font-bold text-black/40 uppercase tracking-widest mb-4">STEP 03</p>
					<h3
						class="text-[32px] md:text-[40px] font-bold text-black uppercase leading-[1.1] mb-4"
					>
						FIGHT BACK
					</h3>
					<p class="text-black/80 text-lg">
						Generate a professional pushback email with a single click.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- SECTION 4: WHAT WE CATCH -->
	<section
		class="bg-surface-1 rounded-b-[120px] pt-[200px] pb-[170px] -mt-[120px] relative z-10 shadow-pill border-b border-black/50"
	>
		<div class="max-w-[1700px] mx-auto px-6">
			<h2 class="text-4xl md:text-[56px] font-bold text-white mb-16 text-center">
				WHAT WE CATCH
			</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<div class="bg-card-blue rounded-[30px] p-10 group overflow-hidden relative">
					<div
						class="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-500"
					>
						<ShieldX size={140} class="text-card-blue-text" />
					</div>
					<p class="text-xs font-bold text-card-blue-text/60 uppercase tracking-widest mb-4">
						CATEGORY
					</p>
					<h3
						class="text-[32px] md:text-[40px] font-bold text-card-blue-text uppercase leading-[1.1] mb-4 relative z-10"
					>
						DATA SELLING
					</h3>
					<p class="text-card-blue-text/80 relative z-10">
						When companies quietly grant themselves the right to broker your personal info to third
						parties.
					</p>
				</div>
				<div class="bg-card-mint rounded-[30px] p-10 group overflow-hidden relative">
					<div
						class="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-500"
					>
						<AlertTriangle size={140} class="text-card-mint-text" />
					</div>
					<p class="text-xs font-bold text-card-mint-text/60 uppercase tracking-widest mb-4">
						CATEGORY
					</p>
					<h3
						class="text-[32px] md:text-[40px] font-bold text-card-mint-text uppercase leading-[1.1] mb-4 relative z-10"
					>
						AUTO-RENEW TRAPS
					</h3>
					<p class="text-card-mint-text/80 relative z-10">
						Concealed subscription terms that make it intentionally difficult to cancel billing.
					</p>
				</div>
				<div class="bg-card-cyan rounded-[30px] p-10 group overflow-hidden relative">
					<div
						class="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-500"
					>
						<FileText size={140} class="text-card-cyan-text" />
					</div>
					<p class="text-xs font-bold text-card-cyan-text/60 uppercase tracking-widest mb-4">
						CATEGORY
					</p>
					<h3
						class="text-[32px] md:text-[40px] font-bold text-card-cyan-text uppercase leading-[1.1] mb-4 relative z-10"
					>
						FORCED ARBITRATION
					</h3>
					<p class="text-card-cyan-text/80 relative z-10">
						Clauses that strip away your right to sue or join class-action lawsuits if wronged.
					</p>
				</div>
				<div class="bg-card-lavender rounded-[30px] p-10 group overflow-hidden relative">
					<div
						class="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-500"
					>
						<XCircle size={140} class="text-card-lavender-text" />
					</div>
					<p class="text-xs font-bold text-card-lavender-text/60 uppercase tracking-widest mb-4">
						CATEGORY
					</p>
					<h3
						class="text-[32px] md:text-[40px] font-bold text-card-lavender-text uppercase leading-[1.1] mb-4 relative z-10"
					>
						ACCOUNT TERMINATION
					</h3>
					<p class="text-card-lavender-text/80 relative z-10">
						Rights to delete your account and confiscate your content for any reason, without notice.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- SECTION 5: ABOUT / MISSION -->
	<section
		id="about"
		class="bg-background rounded-b-[120px] pt-[200px] pb-[170px] -mt-[120px] relative z-[9] shadow-pill border-b border-white/5"
	>
		<div class="max-w-[1200px] mx-auto px-6">
			<div class="text-center mb-16">
				<p class="text-[11px] font-bold uppercase tracking-[2px] text-yo-yellow mb-4">
					Our Mission
				</p>
				<h2
					class="text-4xl md:text-[64px] font-bold text-white uppercase leading-[0.95] tracking-tight mb-6"
				>
					THE FINE PRINT<br />
					<span class="text-yo-yellow">SHOULDN'T BE</span><br />
					A TRAP.
				</h2>
				<p class="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
					TermScan was built because no one should have to spend hours reading legal jargon to
					understand what rights they're signing away. We use AI to do that work for you, instantly.
				</p>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
				<div class="bg-surface-1 rounded-[30px] p-10 border border-white/5">
					<div
						class="w-12 h-12 rounded-full bg-yo-yellow flex items-center justify-center mb-6"
					>
						<ShieldCheck class="w-6 h-6 text-black" strokeWidth={2.5} />
					</div>
					<h3 class="text-2xl font-bold text-white uppercase mb-3">Consumer First</h3>
					<p class="text-muted leading-relaxed">
						Every feature we build is designed to give you power over agreements that were never
						written with your interests in mind.
					</p>
				</div>
				<div class="bg-surface-1 rounded-[30px] p-10 border border-white/5">
					<div
						class="w-12 h-12 rounded-full bg-card-mint flex items-center justify-center mb-6"
					>
						<Zap class="w-6 h-6 text-card-mint-text" strokeWidth={2.5} />
					</div>
					<h3 class="text-2xl font-bold text-white uppercase mb-3">Instant Clarity</h3>
					<p class="text-muted leading-relaxed">
						We turn dense legal text into plain English in seconds. No law degree required. Just
						paste and go.
					</p>
				</div>
				<div class="bg-surface-1 rounded-[30px] p-10 border border-white/5">
					<div
						class="w-12 h-12 rounded-full bg-card-blue flex items-center justify-center mb-6"
					>
						<Lock class="w-6 h-6 text-card-blue-text" strokeWidth={2.5} />
					</div>
					<h3 class="text-2xl font-bold text-white uppercase mb-3">Privacy by Design</h3>
					<p class="text-muted leading-relaxed">
						We don't sell your data. The irony of a ToS analyzer selling your data is not lost on
						us.
					</p>
				</div>
				<div class="bg-surface-1 rounded-[30px] p-10 border border-white/5">
					<div
						class="w-12 h-12 rounded-full bg-card-lavender flex items-center justify-center mb-6"
					>
						<Globe class="w-6 h-6 text-card-lavender-text" strokeWidth={2.5} />
					</div>
					<h3 class="text-2xl font-bold text-white uppercase mb-3">Open to All</h3>
					<p class="text-muted leading-relaxed">
						Anyone who uses the internet should have access to this tool. No subscriptions, no
						paywalls to get started.
					</p>
				</div>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
				<div>
					<p class="text-[11px] font-bold uppercase tracking-[2px] text-yo-yellow mb-4">
						Under the Hood
					</p>
					<h3 class="text-3xl md:text-[48px] font-bold text-white uppercase leading-[1] mb-6">
						Powered by State-of-the-Art AI
					</h3>
					<p class="text-muted leading-relaxed mb-4">
						TermScan uses Llama 3.3 70B, a large language model with deep legal and linguistic
						comprehension, to read every clause, rate its severity, and explain what it means in
						plain language.
					</p>
					<p class="text-muted leading-relaxed">
						The AI assigns each clause a severity score from 1 to 10 and categorises it into one of
						twelve risk categories, giving you a complete picture of any ToS document in under 30
						seconds.
					</p>
				</div>
				<div class="flex flex-col gap-4">
					{#each aiSpecs as spec}
						<div
							class="flex items-center justify-between px-6 py-4 bg-surface-1 rounded-[16px] border border-white/5"
						>
							<span class="text-[12px] font-bold uppercase tracking-wider text-muted"
								>{spec.label}</span
							>
							<span class="text-[13px] font-bold text-yo-yellow uppercase tracking-wide"
								>{spec.value}</span
							>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- SECTION 6: FAQ -->
	<section id="faq" class="bg-surface-1 pt-[200px] pb-[140px] -mt-[120px] relative z-[8]">
		<div class="max-w-3xl mx-auto px-6">
			<div class="text-center mb-16">
				<p class="text-[11px] font-bold uppercase tracking-[2px] text-yo-yellow mb-4">
					Got Questions?
				</p>
				<h2
					class="text-4xl md:text-[64px] font-bold text-white uppercase leading-[0.95] tracking-tight mb-6"
				>
					FREQUENTLY<br />
					<span class="text-yo-yellow">ASKED.</span>
				</h2>
				<p class="text-lg text-muted max-w-xl mx-auto leading-relaxed">
					Everything you need to know about TermScan, how it works, and what it can do for you.
				</p>
			</div>
			<div class="flex flex-col gap-4">
				{#each faqs as faq, i}
					<div
						class="border border-white/8 rounded-[20px] overflow-hidden bg-surface-2"
						in:fly={{ y: 20, duration: 400, delay: i * 40 }}
					>
						<button
							onclick={() => toggleFaq(i)}
							class="w-full flex items-center justify-between px-8 py-6 text-left group"
						>
							<span
								class="text-[15px] font-bold uppercase tracking-wide text-white group-hover:text-yo-yellow transition-colors duration-200"
								>{faq.q}</span
							>
							<div
								class="shrink-0 ml-4 transition-transform duration-250"
								style="transform: rotate({openFaqIndex === i ? 180 : 0}deg)"
							>
								<ChevronDown class="w-5 h-5 text-muted" />
							</div>
						</button>
						{#if openFaqIndex === i}
							<div transition:slide={{ duration: 250 }}>
								<div class="px-8 pb-6 border-t border-white/5">
									<p class="text-muted leading-relaxed pt-5">{faq.a}</p>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</section>

	<Footer />
</div>
