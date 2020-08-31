<script>
import { fly } from 'svelte/transition';
import { quintInOut } from 'svelte/easing';
export let data;
</script>

<style lang="text/postcss">
.slide {
    opacity: 1;
    @apply absolute flex w-full h-full;
}
</style>
{#if data.active}
<div in:fly="{{x:200,delay:200, duration: 500, easing:quintInOut }}" out:fly="{{x:-200, duration: 500,easing:quintInOut }}" class="slide">
    <div class='m-auto bg-blue-500 flex flex-col lg:flex-row h-64 lg:w-9/12 text-white p-4 rounded-md'>
        <div class="flex-1 flex px-4">
            <h1 class="m-auto text-4xl font-black">{data.name}</h1>
        </div>
        <div class="flex-1 flex">
            <p>{data.description}</p>
        </div>
    </div>
</div>
{/if}