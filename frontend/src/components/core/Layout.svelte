<script lang="ts">
  import {
    main,
    showLoader,
    showRightSidebar,
    showLeftSidebar,
    mainResizeObserver,
  } from "@/lib/stores/ui";
  import { onMount } from "svelte";
  import Logo from "./Logo.svelte";
  import { fly } from "svelte/transition";
  import Nav from "@/core/nav/Nav.svelte";
  import updateStores from "@/lib/stores";
  import observeResize from "@/lib/resize";
  import Sidebar from "@/core/Sidebar.svelte";
  import PageLoad from "@/core/PageLoad.svelte";
  import breakpoints from "@/lib/stores/breakpoints";
  import MenuTrigger from "@/core/MenuTrigger.svelte";

  let menuOpen = false;
  onMount(() => {
    updateStores();
    $showLeftSidebar = false;
    $showRightSidebar = false;
  });

  $: if ($main) observeResize($main, mainResizeObserver);
</script>

<div
  class="grid h-screen min-w-[320px] grid-cols-[0px_auto] grid-rows-[4rem_auto_3rem] bg-neutral-900 p-4 pt-0 text-text-light md:grid-cols-[320px_auto] md:p-6 md:pt-4"
>
  <header
    class={`relative col-span-2 col-start-1 row-start-1 mr-6 flex items-center justify-between md:col-span-1  ${
      menuOpen ? "z-50" : ""
    }`}
  >
    <Logo />
    {#if !$breakpoints.md}
      <MenuTrigger
        enabled={menuOpen}
        on:click={() => (menuOpen = !menuOpen)}
        class="h-8 w-8"
      />
    {/if}
  </header>
  <aside
    class={`fixed left-0 bottom-0 top-0 right-0 z-40 row-start-2 flex w-full flex-1 -translate-x-full flex-col overflow-auto transition-transform ease-in-out md:static md:z-0 md:max-w-xs md:translate-x-0 ${
      menuOpen
        ? "translate-x-0 bg-neutral-900/80 pt-20 pl-4 backdrop-blur-md md:border-none md:bg-transparent md:pt-0 md:pl-0"
        : ""
    }`}
  >
    <Nav on:navigate={() => (menuOpen = false)} />
  </aside>
  <main
    bind:this={$main}
    in:fly={{ x: 500, opacity: 0 }}
    class="relative z-[1] col-start-2 mb-4 flex flex-col overflow-hidden rounded-xl border border-black/20 bg-neutral-800 md:row-span-3 md:mb-0"
  >
    <div class="bg-neutral-800">
      <slot name="header" />
    </div>
    <div class="relative flex flex-1 flex-col overflow-auto px-4 md:px-6">
      {#if $showLoader}
        <PageLoad />
      {:else}
        <slot />
      {/if}
    </div>
    <Sidebar direction="right" enabled={$showRightSidebar}>
      <slot name="right" />
    </Sidebar>
    <Sidebar direction="left" enabled={$showLeftSidebar}>
      <slot name="left" />
    </Sidebar>
  </main>
  {#if !$showLoader}
    <footer class="col-span-2 flex w-full items-center justify-center md:col-span-1">
      <slot name="cta" />
    </footer>
  {/if}
</div>
