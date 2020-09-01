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
        I first discovered programming in 8th grade with QBasic.
        The first sentence of the first chapter on programming were,
        </p>
        <Quotes>
            Technology is only limited by our imagination
        </Quotes>
        <p>
        I felt like I was given knowledge of a power to create almost anything.
        My very first creation was a small pokemon game in QBasic 
        imitating features of the original GBA games. The journey of creating something
        was so exhilarating I never forgot it and wanted to do more.
        </p><p>
        I build on random ideas,needs and wants.
        I wrote python scripts to organize files in my hard drive and 
        to host simple http servers for file transfer over wifi.
        The joy of solving problems and crossing obstacles brought me satisfaction.
        </p><p>
        </p>
    </div>
</div>