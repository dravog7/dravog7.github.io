<script>
export let active = false;
</script>
<style lang="text/postcss">
@import 'hamburgers.css';
.hamburger-inner,
.hamburger-inner::before,
.hamburger-inner::after{
  @apply bg-white;
}
.hamburger.is-active .hamburger-inner::before,
.hamburger.is-active .hamburger-inner::after{
  @apply bg-red-400;
}
</style>

<button class:is-active={active} class="w-full hamburger focus:outline-none hamburger--emphatic" type="button" on:click={e=>active = !active}>
  <span class="hamburger-box">
    <span class="hamburger-inner"></span>
  </span>
</button>
