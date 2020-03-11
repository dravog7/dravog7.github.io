<script>
import { onMount,onDestroy } from 'svelte';
import { Router } from 'svelte-router-spa'
import { routes } from './route.js'

import Navbar from "./components/navbar.svelte";

onMount(async () => {
    document.body.classList.add("construction");
});

onDestroy(async () => {
    document.body.classList.remove("construction");
});

</script>

<style lang="text/postcss">

</style>
<Router { routes } />