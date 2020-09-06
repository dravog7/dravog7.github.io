<script>
import { onMount } from 'svelte';
import inView from 'in-view';
import { location } from '../stores/navloc.js';

import ProjectList from './projects/ProjectList.svelte';

onMount(async ()=>{
    inView('#projects')
    .on('enter',()=>{
        location.update(val=>{
            val['#projects']=true;
            return val;
            });
    })
    .on('exit',()=>{
        location.update(val=>{
            val['#projects']=false;
            return val;
            });
    })
})

</script>

<style lang="text/postcss">
#projects {
    background-color: inherit;
}
.grad-bg{
    background: radial-gradient(
        circle at 0% 0%,
        var(--main-color) 0% 15%,
        var(--accent-color) 16% 17%,
        var(--main-color) 18% 83%, 
        var(--accent2-color) 84% 85%,
        var(--main-color) 86% 100%);
}
</style>

<div id='projects' class="flex flex-col bg-transparent w-screen h-screen py-24 grad-bg">
    <h1 class="mx-auto font-bold text-4xl">Projects</h1>
    <div class="mx-auto w-11/12 flex-1">
        <ProjectList/>
    </div>
</div>