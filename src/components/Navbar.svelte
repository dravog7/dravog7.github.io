<script>
import { slide } from 'svelte/transition';
import { cubicOut } from 'svelte/easing';
import Hamburger from './utils/Hamburger.svelte';
import { location } from '../stores/navloc.js';
let menuOpen = false;

let menuItems = [
    {
        'name':'Home',
        'link':'#top',
    },
    {
        'name':'About',
        'link':'#about',
    },
    {
        'name':'Work',
        'link':'#projects',
    },
    {
        'name':'Contact',
        'link':'#contact',
    }
]

</script>

<style lang="text/postcss">
.hero{
    color:var(--accent-color)!important;
    text-decoration:none;
    @apply transition-all duration-500 ease-in-out;
}
.hero:hover{
    text-shadow: 0px 0px 1px var(--accent-glow);
}
.nav-container {
    @apply border-transparent transition-all duration-500 ease-in-out;
}
.nav-container:hover{
    border-color: var(--accent-color);
}
.nav-container.active{
    border-color: var(--accent-color);
}
.nav-container:nth-child(even):hover{
    border-color: var(--accent2-color);
}
.nav-container:nth-child(even).active{
    border-color: var(--accent2-color);
}
.nav-container > a {
    color: var(--sec-color)!important;
    text-decoration: none!important;
}
.nav-container.active > a{
    color: var(--accent-color)!important;
    text-shadow: 0px 0px 1px var(--accent-glow);
}
.nav-container:nth-child(even).active > a{
    color: var(--accent2-color)!important;
    text-shadow: 0px 0px 1px var(--accent2-glow);
}
.w-drawer{
    @apply w-1/2;
}
.bg-inherit {
    background-color: inherit;
}
</style>
<div class="hidden w-0 w-drawer">
    Used to make sure conditional css styles are not purged
</div>

<div class="flex fixed right-0 top-0 pr-1 lg:hidden z-40">
    <div class="flex m-auto">
            <Hamburger bind:active={menuOpen}/>
    </div>
</div>
<div class="
    fixed lg:flex top-0 right-0 h-screen lg:h-auto lg:w-screen z-30
    bg-inherit lg:bg-transparent rounded-b 
    transition-all duration-300 ease-in-out 
    overflow-hidden"
    class:w-0='{!menuOpen}'
    class:w-drawer='{menuOpen}'
>
    <div class="h-12 pl-6 flex-1">
    {#if !$location['#top']}
        <h1 in:slide='{{duration:250,easing:cubicOut}}'
            out:slide='{{duration:250,easing:cubicOut}}'
            class="hidden lg:block font-bold text-2xl" 
            >
            <a class="hero"
                href='#top'>
                John Abraham
            </a>
        </h1>
    {/if}
    </div>
    <ol class="lg:flex text-center lg:m-auto">
        {#each menuItems as menuItem}
        <li class:active={$location[menuItem.link]}
            class="nav-container border-l-2 lg:border-b-2 lg:border-l-0 py-6 lg:py-2 lg:px-6">
            <a href='{menuItem.link}'>{menuItem.name}</a>
        </li>
        {/each}
        <li class="nav-container border-l-2 lg:border-b-2 lg:border-l-0 py-6 lg:py-2 lg:px-6">
            <a href='https://docs.google.com/document/d/1ZRp1OYUPWxxOMaYpG4tjT4UsIAhNLra4AzoIYUm18lI/export?format=pdf'>
            Resume
            </a>
        </li>
    </ol>
</div>