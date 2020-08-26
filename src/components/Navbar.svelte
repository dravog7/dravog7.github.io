<script>
import Hamburger from './utils/Hamburger.svelte';
import { location } from '../stores/navloc.js';
let menuOpen = false;
</script>

<style lang="text/postcss">
.nav-container {
    @apply border-blue-500 transition-all duration-500 ease-in-out;
}
.nav-container:hover ,.nav-container.active{
    @apply border-red-500;
}
.nav-container > a {
    @apply text-gray-600;
    text-decoration: none;
}
.nav-container.active > a{
    @apply text-red-400;
}
.w-drawer{
    @apply w-1/4;
}
</style>
<div class="hidden w-0 w-drawer">
    Used to make sure conditional css styles are not purged
</div>

<div class="flex fixed right-0 top-0 pr-1 lg:hidden z-10">
    <div class="flex m-auto">
            <Hamburger bind:active={menuOpen}/>
    </div>
</div>
<div class="
    fixed lg:flex top-0 right-0 lg:h-auto lg:w-screen 
    bg-white shadow-md rounded-b 
    transition-all duration-300 ease-in-out 
    overflow-hidden"
    class:w-0='{!menuOpen}'
    class:w-drawer='{menuOpen}'
>
    <div class="h-12 w-full"></div>
    <ol class="lg:flex text-center lg:m-auto">
        <li class:active={$location['#top']}
            class="nav-container border-l-4 lg:border-b-4 lg:border-l-0 py-6 lg:px-6">
            <a href='#top'>Home</a>
        </li>
        <li class:active={$location['#about']}
            class="nav-container border-l-4 lg:border-b-4 lg:border-l-0 py-6 lg:px-6">
            <a href='#about'>About</a>
        </li>
        <li class:active={$location['#work']}
            class="nav-container border-l-4 lg:border-b-4 lg:border-l-0 py-6 lg:px-6">
            <a href='#work'>Works</a>
        </li>
        <li class:active={$location['#contact']}
            class="nav-container border-l-4 lg:border-b-4 lg:border-l-0 py-6 lg:px-6">
            <a href='#contact'>contact</a>
        </li>
        <li
            class="nav-container border-l-4 lg:border-b-4 lg:border-l-0 py-6 lg:px-6">
            <a href='https://docs.google.com/document/d/1ZRp1OYUPWxxOMaYpG4tjT4UsIAhNLra4AzoIYUm18lI/export?format=pdf'>Resume</a>
        </li>
    </ol>
</div>