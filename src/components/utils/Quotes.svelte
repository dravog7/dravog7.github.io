<script>
</script>

<style>
.highlight{
    color: var(--accent-color);
    text-shadow: 0px 0px 1px var(--accent-glow);
}
.highlight2{
    color: var(--accent2-color);
    text-shadow: 0px 0px 1px var(--accent2-glow);
}
</style>

<blockquote class="text-lg mx-auto py-6 italic">
    <p>
        <sup class="highlight font-bold text-xl not-italic">&ldquo;</sup>
        <slot></slot>
        <sub class="highlight2 font-bold text-xl not-italic">&ldquor;</sub>
    </p>
</blockquote>