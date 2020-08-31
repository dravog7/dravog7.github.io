<script>
import { onMount } from 'svelte';
import inView from 'in-view';
import { location } from '../stores/navloc.js';

onMount(async ()=>{
    inView('#top h1')
    .on('enter',()=>{
        location.update(val=>{
            val['#top']=true;
            return val;
            });
    })
    .on('exit',()=>{
        location.update(val=>{
            val['#top']=false;
            return val;
            });
    })
})
</script>

<style lang="text/postcss">
</style>

<div id='top' class="flex w-screen bg-blue-300 h-screen">
    <div class="m-auto text-center text-white w-7/12">
        <h1 class="font-bold text-5xl">John Abraham</h1>
        <p>A Backend developer who loves to solve problems. (Not the indian actor!)
        </p>
    </div>
</div>