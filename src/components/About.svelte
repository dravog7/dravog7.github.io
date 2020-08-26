<script>
import { onMount } from 'svelte';
import inView from 'in-view';
import { location } from '../stores/navloc.js';

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
</style>

<div id='about'
class="flex flex-col
    w-11/12 h-screen mx-auto text-center py-24
    bg-blue-300 text-white rounded-lg
    hover:shadow-md
    transition-all duration-500 ease-in-out"
class:bg-blue-400={onMe}
>
    <h1 class="w-full font-bold text-4xl">About</h1>
    <p class="w-9/12 m-auto">
    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
    Suscipit quis iusto quo reprehenderit. Excepturi cum sit 
    inventore dignissimos aperiam culpa non eos placeat aut 
    animi? Omnis facere optio minima quod. Lorem ipsum dolor 
    sit amet consectetur adipisicing elit. Placeat rem dignissimos
    expedita amet, quaerat dolor itaque iusto! Ipsa, qui quod 
    porro voluptates facere tempore eveniet doloribus voluptate 
    dolor perspiciatis autem!
    </p>
</div>