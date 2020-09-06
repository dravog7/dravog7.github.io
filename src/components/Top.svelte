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
.grad-bg{
    background: radial-gradient(
        circle at 100% 0%,
        var(--main-color) 0% 18%,
        var(--accent-color) 19% 20%,
        var(--main-color) 21% 83%, 
        var(--accent2-color) 84% 85%,
        var(--main-color) 86% 100%);
}
.mask{
    background:linear-gradient(var(--accent-color), var(--accent2-color));
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