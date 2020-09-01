<script>
import { fly } from 'svelte/transition';
import { cubicOut } from 'svelte/easing';
export let data;
</script>

<style lang="text/postcss">
    .slide {
        opacity: 1;
        @apply absolute flex w-full h-full;
    }
    h1::first-letter{
        color: var(--accent-color);
    }
</style>
{#if data.active}
<div 
    class="slide"
>
    <div class='m-auto flex flex-col lg:flex-row h-64 w-11/12 lg:w-8/12 p-4 rounded-md'>
        <div class="flex-1 flex px-4" in:fly="{{x:-100, duration: 500, easing:cubicOut }}">
            <h1 class="my-auto text-4xl font-black">{data.name}</h1>
        </div>
        <div class="flex-1 flex" in:fly="{{x:100,delay:300, duration: 350, easing:cubicOut }}">
            <p class="text-lg lg:text-3xl">{data.description}</p>
        </div>
    </div>
</div>
{/if}