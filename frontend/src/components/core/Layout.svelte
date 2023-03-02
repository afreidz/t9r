<script lang="ts">
  import { onMount } from "svelte";
  import Logo from "./Logo.svelte";
  import { fly } from "svelte/transition";
  import NewTimer from "./NewTimer.svelte";
  import { location } from "svelte-spa-router";
  import Nav from "@/components/core/Nav.svelte";
  import { fetchProjects } from "@/lib/projects";
  import MenuTrigger from "./MenuTrigger.svelte";

  let menuOpen = false;

  onMount(fetchProjects);
</script>

<div
  class="fixed top-0 bottom-0 left-0 right-0 min-w-[320px] grid text-text-light grid-rows-[6rem_auto_6rem] grid-cols-[0px_auto] md:grid-cols-[320px_auto] bg-neutral-900"
>
  <header
    class="p-3 md:p-6 row-start-1 col-start-1 col-span-2 md:col-span-1 flex items-center justify-between"
  >
    <Logo />
    <MenuTrigger
      enabled={menuOpen}
      on:click={() => (menuOpen = !menuOpen)}
      class="w-8 h-8 md:hidden"
    />
  </header>
  <aside
    class={`pl-3 md:pl-6 row-start-2 col-start-1 flex flex-1 flex-col transition-transform -translate-x-full md:translate-x-0 ease-in-out w-full max-w-xs fixed left-0 bottom-0 top-0 md:static ${
      menuOpen
        ? "pt-24 md:pt-0 pl-2 md:pl-0 border-r border-black/30 md:border-none translate-x-0 bg-neutral-900/50 backdrop-blur-md md:bg-transparent"
        : ""
    }`}
  >
    <Nav on:navigate={() => (menuOpen = false)} />
  </aside>
  {#key $location}
    <main
      in:fly={{ x: 500, opacity: 0 }}
      class="m-3 md:m-6 mt-0 flex row-span-3 col-start-2 flex-col rounded-xl bg-neutral-800 p-6 overflow-auto"
    >
      <slot />
    </main>
  {/key}
  {#if $location.startsWith("/timers")}
    <div
      class="flex items-center justify-center fixed bottom-6 left-0 right-0 md:static"
    >
      <NewTimer />
    </div>
  {/if}
</div>
