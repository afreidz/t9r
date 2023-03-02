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
  class="fixed top-0 bottom-0 left-0 right-0 grid min-w-[320px] grid-cols-[0px_auto] grid-rows-[6rem_auto_6rem] bg-neutral-900 text-text-light md:grid-cols-[320px_auto]"
>
  <header
    class="col-span-2 col-start-1 row-start-1 flex items-center justify-between p-3 md:col-span-1 md:p-6"
  >
    <Logo />
    <MenuTrigger
      enabled={menuOpen}
      on:click={() => (menuOpen = !menuOpen)}
      class="h-8 w-8 md:hidden"
    />
  </header>
  <aside
    class={`fixed left-0 bottom-0 top-0 col-start-1 row-start-2 flex w-full max-w-xs flex-1 -translate-x-full flex-col pl-3 transition-transform ease-in-out md:static md:translate-x-0 md:pl-6 ${
      menuOpen
        ? "translate-x-0 border-r border-black/30 bg-neutral-900/50 pt-24 pl-2 backdrop-blur-md md:border-none md:bg-transparent md:pt-0 md:pl-0"
        : ""
    }`}
  >
    <Nav on:navigate={() => (menuOpen = false)} />
  </aside>
  {#key $location}
    <main
      in:fly={{ x: 500, opacity: 0 }}
      class="col-start-2 row-span-3 m-3 mt-0 flex flex-col overflow-auto rounded-xl bg-neutral-800 p-6 md:m-6"
    >
      <slot />
    </main>
  {/key}
  {#if $location.startsWith("/timers")}
    <div
      class="fixed bottom-6 left-0 right-0 flex items-center justify-center md:static"
    >
      <NewTimer />
    </div>
  {/if}
</div>
