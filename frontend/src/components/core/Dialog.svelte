<script lang="ts">
  import { fade } from "svelte/transition";
  import Header from "@/core/Header.svelte";

  type $$Props = {
    sub?: string;
    open?: boolean;
    title?: string;
  };

  let dialog: HTMLDialogElement;
  let { open, title, sub }: $$Props = $$props;

  $: if (open) {
    dialog?.showModal();
  }

  export { open, title, sub };
</script>

<dialog
  bind:this={dialog}
  class="flex h-min w-full appearance-none flex-col rounded-md border border-neutral-900 bg-neutral-800 p-4 text-white opacity-0 shadow-2xl transition-opacity backdrop:bg-neutral-900/80 backdrop:opacity-0 backdrop:backdrop-blur-md backdrop:transition-opacity open:opacity-100 open:backdrop:opacity-100 md:max-h-[50%] md:max-w-[600px]"
>
  <form method="dialog">
    <Header main={title} {sub}>
      <slot name="close" />
    </Header>
    <slot />
  </form>
</dialog>
