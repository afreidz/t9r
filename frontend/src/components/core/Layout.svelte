<script lang="ts">
  import Logo from "./Logo.svelte";
  import Icon from "@iconify/svelte";
  import { fly } from "svelte/transition";
  import { location } from "svelte-spa-router";
  import Nav from "@/components/core/Nav.svelte";
  import { fetchProjects } from "@/lib/projects";
  import MenuTrigger from "./MenuTrigger.svelte";

  let menuOpen = false;
</script>

{#await fetchProjects()}
  <div class="flex flex-1 items-center justify-center">
    <Icon icon="eos-icons:loading" class="h-20 w-20 text-white" />
  </div>
{:then _}
  <div
    class="fixed top-0 bottom-0 left-0 right-0 grid min-w-[320px] grid-cols-[0px_auto] grid-rows-[6rem_auto_6rem] bg-neutral-900 text-text-light md:grid-cols-[320px_auto]"
  >
    <header
      class={`relative col-span-2 col-start-1 row-start-1 mr-6 flex items-center justify-between md:col-span-1  ${
        menuOpen ? "z-50" : ""
      }`}
    >
      <Logo />
      <MenuTrigger
        enabled={menuOpen}
        on:click={() => (menuOpen = !menuOpen)}
        class="h-8 w-8 md:hidden"
      />
    </header>
    <aside
      class={`fixed left-0 bottom-0 top-0 right-0 z-40 col-start-1 row-start-2 flex w-full flex-1 -translate-x-full flex-col pl-3 transition-transform ease-in-out md:static md:max-w-xs md:translate-x-0 md:pl-6 ${
        menuOpen
          ? "translate-x-0 bg-neutral-900/60 pl-6 pt-24 backdrop-blur-md md:border-none md:bg-transparent md:pt-0 md:pl-0"
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
    <div
      class="fixed bottom-6 left-0 right-0 flex items-center justify-center md:static"
    >
      <slot name="cta" />
    </div>
  </div>
{/await}
