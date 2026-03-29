<script lang="ts">
	let { onReset }: { onReset?: () => void } = $props();
</script>

<nav class="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex items-center justify-between pointer-events-none">
	<div class="max-w-[1700px] mx-auto w-full flex items-center justify-between pointer-events-auto">
		<a
			href="/"
			onclick={(e) => {
				if (onReset) {
					e.preventDefault();
					onReset();
				}
			}}
			class="flex items-center gap-3 group focus:outline-none"
		>
			<img
				src="/logo.png"
				alt="TermScan"
				class="w-10 h-10 rounded-full group-hover:scale-105 transition-transform duration-300"
			/>
			<span
				class="text-xl font-bold tracking-widest text-white group-hover:text-yo-yellow transition-colors duration-300"
			>
				TERMSCAN
			</span>
		</a>

		<div class="flex items-center gap-3">
			<div
				class="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-surface-2 border border-white/5"
			>
				<div class="w-2 h-2 rounded-full bg-yo-yellow pulse-dot"></div>
				<span class="text-[11px] font-bold tracking-[1.2px] text-muted">AI-POWERED</span>
			</div>
			<a
				href="/#about"
				class="hidden md:block text-[12px] font-bold uppercase tracking-widest text-muted hover:text-white transition-colors duration-200"
			>
				About
			</a>
			<a
				href="/#faq"
				class="hidden md:block text-[12px] font-bold uppercase tracking-widest text-muted hover:text-white transition-colors duration-200"
			>
				FAQ
			</a>
		</div>
	</div>
</nav>
