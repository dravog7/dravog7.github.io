<script>
import { onMount,onDestroy } from 'svelte';
import Slide from './slide.svelte';
export let Data;
let selected = 0;
let buffer = Data;
let interval=null;
let transed = false;

buffer[selected].active = true;

function add(){
   buffer[selected].active = false;
   selected = (selected + 1)%buffer.length;
   buffer[selected].active = true;
   transed = true;
}

function sub(){
    buffer[selected].active = false;
    selected = selected - 1;
    if(selected<0)
        selected = buffer.length - 1;
    buffer[selected].active = true;
    transed = true;
}

function automatic(){
    if(!transed)
        add();
    transed = false;
}

onMount(function(){
    interval = setInterval(automatic,10000);
})
onDestroy(function(){
    clearInterval(interval);
})
</script>
<style lang="text/postcss">
.left, .right{
    @apply rounded-full text-white text-2xl font-black z-10;
}
.left:focus,.right:focus{
    @apply outline-none;
}
.left:hover,.right:hover{
    color: var(--accent-color);
}
</style>

<div class="m-auto w-screen h-64 overflow-hidden relative">
    <div class='absolute inset-0 flex items-center justify-between'>
        <button class="left" on:click={sub}>&lt;</button>
        <button class="right" on:click={add}>&gt;</button>
    </div>
    {#each buffer as slide}
        <Slide data={slide}/>
    {/each}
</div>