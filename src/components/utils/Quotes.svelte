<script>
</script>

<style>
.highlight{
    color: var(--accent-color);
    text-shadow: 0px 0px 1px var(--accent-glow);
}
blockquote > div {
    line-height: 0.5;
}
</style>

<blockquote class="text-lg mx-auto py-2 italic">
<div class="highlight font-bold text-xl m-0 text-left w-full">
    &ldquo;
</div>
<p class="mx-4"><slot></slot></p>
<div class="highlight font-bold text-xl m-0 text-right w-full">
    &ldquor;
</div>
</blockquote>