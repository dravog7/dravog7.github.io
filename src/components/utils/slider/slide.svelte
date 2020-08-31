<script>
export let slide;
</script>

<style lang="text/postcss">
.slide {
    opacity: 0;
    left: -100%;
    @apply absolute flex ease-in-out w-full h-full;
    transition: opacity 0.4s ease-in-out,transform 0.4s ease-in-out 0.4s;
}
.slide.active{
    opacity: 1;
    transform: translateX(100%);
}

</style>
<div class:active={slide.active} class="slide">
    <div class='m-auto bg-blue-500 flex w-6/12 text-white p-4 rounded-md'>
        <div class="flex-1 flex">
            <h1 class="m-auto text-4xl font-black">{slide.name}</h1>
        </div>
        <div class="flex-1 flex">
            <p>{slide.description}</p>
        </div>
    </div>
</div>