<script lang="ts">
	import '../app.css';
	import { Toaster } from 'svelte-sonner';

	let { children } = $props();
</script>

{@render children()}
<Toaster
	position="top-right"
	richColors
	toastOptions={{
		style: 'background: #262722; color: #EDEDED; border: 1px solid rgba(255,255,255,0.1); font-family: Space Grotesk, sans-serif; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; font-size: 13px;'
	}}
/>
