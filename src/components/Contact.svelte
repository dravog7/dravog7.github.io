<script>
import { onMount } from 'svelte';
import inView from 'in-view';
import { location } from '../stores/navloc.js';
import Github from './utils/github.svg';
import Gmail from './utils/gmail.svg';
import Whatsapp from './utils/whatsapp.svg';
onMount(async ()=>{
    inView('#contact h1')
    .on('enter',()=>{
        location.update(val=>{
            val['#contact']=true;
            return val;
            });
    })
    .on('exit',()=>{
        location.update(val=>{
            val['#contact']=false;
            return val;
            });
    })
})
</script>

<style lang="text/postcss">
a {
    color: var(--accent-color)!important;
    text-decoration: none!important;
}
a.svelte{
    @apply px-1;
    text-shadow:0px 0px 1px var(--accent-glow);
}
</style>

<div id="contact" class="flex flex-col w-screen h-screen bg-transparent">
    <h1 class="m-auto font-bold text-2xl text-center">
        contact me @
        <a href='mailto:john7abraham9@gmail.com'>
            john7abraham9@gmail.com
        </a>
    </h1>
</div>
<footer class="flex border-t-1">
    <h4 class="mx-auto text-center">
        made with
        <span class="px-1" style="color:var(--accent-color);text-shadow:0px 0px 1px var(--accent-glow);">
            &#x2764
        </span>
        and 
        <a class='svelte' target="_blank" href='https://svelte.dev/'>Svelte</a>
    </h4>
</footer>