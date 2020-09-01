<script>
import { onMount } from 'svelte';
import inView from 'in-view';
import { location } from '../stores/navloc.js';
import Quotes from './utils/Quotes.svelte';

let onMe = false;
$: onMe = $location['#about']

onMount(async ()=>{
    inView('#about h1')
    .on('enter',()=>{
        location.update(val=>{
            val['#about']=true;
            return val;
            });
    })
    .on('exit',()=>{
        location.update(val=>{
            val['#about']=false;
            return val;
            });
    })
})
</script>

<style lang="text/postcss">
#about {
    background-color: inherit;
}
.indented{
    text-indent: 1.5em;
    @apply py-1;
}
</style>

<div id='about'
class="flex flex-col
    w-11/12 min-h-screen mx-auto text-center py-24
    rounded-lg
    hover:shadow-md
    transition-all duration-500 ease-in-out"
>
    <h1 class="w-full font-bold text-4xl">About</h1>
    <div class="w-9/12 text-md m-auto text-justify flex flex-col">
        <p>
        A software developer who loves to create.
        </p>
        <Quotes>
            Technology is only limited by our imagination
        </Quotes>
        <p class="indented">
        When I first learned to code, I found myself capable of bringing life to ideas 
        without material expenses. I started by fulfilling my day to day needs and wants 
        by writing python scripts for organizing files, send files across networks, etc. 
        Later I sought out the needs of others around me. I made a search engine that 
        indexed television series video files and made browser extensions to simplify 
        tasks in a game.
        </p><p class="indented">
        Through these experiences, I learned about my passion to make software solutions 
        for myself and others. I am currently a freelance software developer specializing 
        in Python.
        </p>
    </div>
</div>