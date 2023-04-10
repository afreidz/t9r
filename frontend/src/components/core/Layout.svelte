<script lang="ts">
  import Logo from "./Logo.svelte";
  import Icon from "@iconify/svelte";
  import now from "@/lib/stores/now";
  import { fly } from "svelte/transition";
  import Nav from "@/core/nav/Nav.svelte";
  import observeResize from "@/lib/resize";
  import { update } from "@/lib/stores/user";
  import MenuTrigger from "./MenuTrigger.svelte";
  import { fetchProjects } from "@/stores/projects";
  import { mainResizeObserver } from "@/lib/stores/ui";

  let menuOpen = false;
  let main: HTMLElement;
  export let loader: Promise<unknown> | undefined = undefined;

  $: if (main) observeResize(main, mainResizeObserver);
  $: if ($now) update();
</script>

{#await fetchProjects()}
  <div class="flex h-screen flex-1 items-center justify-center">
    <Icon icon="eos-icons:loading" class="h-20 w-20 text-white" />
  </div>
{:then}
  {#await loader}
    <div class="flex h-screen flex-1 items-center justify-center">
      <Icon icon="eos-icons:loading" class="h-20 w-20 text-white" />
    </div>
  {:then}
    <div
      class="grid h-screen min-w-[320px] grid-cols-[0px_auto] grid-rows-[4rem_auto_3rem] bg-neutral-900 p-4 pt-0 text-text-light md:grid-cols-[320px_auto] md:p-6 md:pt-4"
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
        class={`fixed left-0 bottom-0 top-0 right-0 z-40 row-start-2 flex w-full flex-1 -translate-x-full flex-col overflow-auto transition-transform ease-in-out md:static md:z-0 md:max-w-xs md:translate-x-0 ${
          menuOpen
            ? "translate-x-0 bg-neutral-900/80 pt-20 pl-4 backdrop-blur-md md:border-none md:bg-transparent md:pt-0 md:pl-0"
            : ""
        }`}
      >
        <Nav on:navigate={() => (menuOpen = false)} />
      </aside>
      <main
        bind:this={main}
        in:fly={{ x: 500, opacity: 0 }}
        class="relative z-[1] col-start-2 mb-4 flex flex-col overflow-auto rounded-xl bg-neutral-800 px-4 md:row-span-3 md:mb-0 md:px-6"
      >
        <slot />
      </main>
      <footer class="col-span-2 flex w-full items-center justify-center md:col-span-1">
        <slot name="cta" />
      </footer>
    </div>
  {/await}
{/await}

<style>
  aside::-webkit-scrollbar {
    display: none;
  }

  aside {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
