<script>
import { onMount } from 'svelte';
import inView from 'in-view';
import { location } from '../stores/navloc.js';

onMount(async ()=>{
    inView('#work')
    .on('enter',()=>{
        location.update(val=>{
            val['#work']=true;
            return val;
            });
    })
    .on('exit',()=>{
        location.update(val=>{
            val['#work']=false;
            return val;
            });
    })
})
</script>

<style lang='text/postcss'>
</style>

