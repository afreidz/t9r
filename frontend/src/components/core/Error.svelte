<script lang="ts">
  import Icon from "@iconify/svelte";
  import Dialog from "@/core/Dialog.svelte";
  import { createEventDispatcher } from "svelte";
  import Button from "@/foundation/Button.svelte";

  const dispatch = createEventDispatcher();
</script>

<Dialog
  class="bg-red-600"
  open={true}
  sub="Uh oh ..."
  title="Something went wrong!"
  headerClass="border-white/50"
>
  <Button slot="close" value="cancel" on:click={() => dispatch("close")}>
    <Icon icon="material-symbols:close" class="h-7 w-7" />
  </Button>
  <section class="p-6">
    <slot />
  </section>
</Dialog>
