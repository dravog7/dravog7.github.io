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

<blockquote class="text-lg mx-auto py-6 italic">
    <p>
        <sup class="highlight font-bold text-xl not-italic">&ldquo;</sup>
        <slot></slot>
        <sub class="highlight font-bold text-xl not-italic">&ldquor;</sub>
    </p>
</blockquote>