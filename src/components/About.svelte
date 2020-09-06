<script>
import { onMount } from 'svelte';
import inView from 'in-view';
import { location } from '../stores/navloc.js';
import Quotes from './utils/Quotes.svelte';

let onMe = false;
$: onMe = $location['#about']

onMount(async ()=>{
    inView('#about')
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
.pic {
    @apply border-2;
    border-image:linear-gradient(var(--accent-color), var(--accent2-color));
    border-image-width:auto;
}

</style>

<div id='about'
class="flex flex-col
    w-11/12 min-h-screen mx-auto text-center py-24
    rounded-lg
    hover:shadow-md
    transition-all duration-500 ease-in-out"
>
    <h1 class="w-full font-bold text-4xl">About Me</h1>
    <div class="w-9/12 text-md m-auto text-justify flex flex-col">
        <div class="mx-auto rounded-full overflow-hidden">
            <img
                class="pic rounded-full w-48"
                alt="github profile pic"
                src="https://avatars0.githubusercontent.com/u/31211464?s=460&u=04b83e4be0b137a36006d7d57e3e063a1d605ca8&v=4"/>
        </div>
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