<script lang="ts">
  import Header from "@/core/Header.svelte";

  let dialog: HTMLDialogElement;

  export let sub: string = "";
  export let headerClass = "";
  export let title: string = "";
  export let open: boolean = false;

  $: if (open) {
    dialog?.showModal();
  }
</script>

<dialog
  bind:this={dialog}
  class="flex h-min w-full appearance-none flex-col rounded-md border border-neutral-900 bg-neutral-800 p-4 text-white opacity-0 shadow-2xl outline-none transition-opacity backdrop:bg-neutral-900/80 backdrop:opacity-0 backdrop:backdrop-blur-md backdrop:transition-opacity open:opacity-100 open:backdrop:opacity-100 md:max-h-[50%] md:max-w-[600px] {$$props.class ||
    ''}"
>
  <Header main={title} {sub} class="{headerClass} !pt-3">
    <slot name="close" slot="right" />
  </Header>
  <slot />
</dialog>
