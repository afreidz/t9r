<script lang="ts">
  import Icon from "@iconify/svelte";
</script>

<h1
  class={`
    relative
    flex
    items-center
    justify-center

    gap-2
    from-violet-600
    to-cyan-600
    p-6
    pl-5
    pr-7

    text-2xl
    after:absolute
    after:top-0
    after:bottom-0
    after:left-0
    after:right-0
    after:z-[-1] after:bg-gradient-to-br
    after:opacity-50 after:blur-2xl
    after:content-[""]
  `}
>
  <figure>
    <Icon
      icon="ic:outline-watch-later"
      class="backgr h-10 w-10 rounded-full bg-gradient-to-br from-violet-600 to-cyan-600 p-2 text-white"
    />
    <figcaption class="sr-only">t9r</figcaption>
  </figure>
</h1>
