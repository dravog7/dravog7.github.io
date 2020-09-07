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
#top {
    background-color: inherit;
}
.mask{
    background:linear-gradient(45deg,var(--accent-color), var(--accent2-color));
    background-clip:text;
    -webkit-text-fill-color: transparent;
}
</style>

<div id='top' class="flex w-screen h-screen grad-bg">
    <div class="m-auto text-center w-7/12">
        <h1 class="font-bold text-5xl mask" style="color:var(--accent-color)">John Abraham</h1>
        <p class="text-lg">A Software developer who loves to solve problems. (Not the Indian actor!)
        </p>
    </div>
</div>