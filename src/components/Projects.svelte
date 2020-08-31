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
</style>

<div id='projects' class="flex bg-blue-300 w-screen h-screen">
    <div class="m-auto w-11/12">
        <ProjectList/>
    </div>
</div>