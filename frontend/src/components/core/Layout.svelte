<script lang="ts">
  import Logo from "./Logo.svelte";
  import Icon from "@iconify/svelte";
  import { fly } from "svelte/transition";
  import Nav from "@/core/nav/Nav.svelte";
  import observeResize from "@/lib/resize";
  import MenuTrigger from "./MenuTrigger.svelte";
  import { fetchProjects } from "@/stores/projects";
  import { mainResizeObserver } from "@/lib/stores/ui";

  let menuOpen = false;
  let main: HTMLElement;
  export let loader: Promise<unknown> | undefined = undefined;

  $: if (main) observeResize(main, mainResizeObserver);
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
      class="grid h-screen min-w-[320px] grid-cols-[0px_auto] grid-rows-[4rem_auto_6rem] bg-neutral-900 pb-14 text-text-light md:grid-cols-[320px_auto] md:grid-rows-[6rem_auto] md:pb-0"
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
        class={`fixed left-0 bottom-0 top-0 right-0 z-40 col-start-1 row-span-2 row-start-2 flex w-full flex-1 -translate-x-full flex-col overflow-auto pl-3 transition-transform ease-in-out md:static md:z-0 md:max-w-xs md:translate-x-0 md:pl-6 ${
          menuOpen
            ? "translate-x-0 bg-neutral-900/80 pt-20 pl-6 backdrop-blur-md md:border-none md:bg-transparent md:pt-0 md:pl-0"
            : ""
        }`}
      >
        <Nav on:navigate={() => (menuOpen = false)} />
      </aside>
      <main
        bind:this={main}
        in:fly={{ x: 500, opacity: 0 }}
        class="relative z-[1] col-start-2 row-span-3 m-2 mt-0 flex flex-col overflow-auto rounded-xl bg-neutral-800 p-3 !pt-0 md:m-6 md:p-6"
      >
        <slot />
      </main>
    </div>
    <footer
      class="fixed left-0 bottom-[calc(0.5rem_+_env(keyboard-inset-top))] z-30 flex h-full max-h-14 w-full items-center justify-center md:mb-4 md:max-w-xs"
    >
      <slot name="cta" />
    </footer>
  {/await}
{/await}
