<script lang="ts">
  import trpc from "@/lib/trpc";
  import Icon from "@iconify/svelte";
  import Colors from "@/core/Colors.svelte";
  import { showLoader } from "@/lib/stores/ui";
  import { createEventDispatcher } from "svelte";
  import DualAction from "@/core/DualAction.svelte";
  import { updateProjects } from "@/lib/stores/projects";
  import type { Project } from "@/backend/schema/project";
  import Button from "@/components/foundation/Button.svelte";

  let name: Project["name"];
  let color: Project["color"];

  const dispatch = createEventDispatcher<{ created: undefined }>();

  async function submit() {
    $showLoader = true;
    const result = await trpc.projects.create
      .mutate({
        name,
        color,
      })
      .catch(() => {
        $showLoader = false;
        return { acknowledged: false };
      });

    if (result.acknowledged) {
      dispatch("created");
    }
    await updateProjects();
    $showLoader = false;
  }
</script>

<form
  class="my-6 flex flex-1 items-center justify-center"
  on:submit|preventDefault={submit}
>
  <DualAction as="p" label="Project Name">
    <label class="flex-none" slot="secondary">
      <span class="sr-only">Color</span>
      <div
        class="relative h-10 w-10 overflow-hidden rounded-full ring-blue-500 ring-offset-0 focus-within:ring"
      >
        <input
          class="h-full w-full appearance-none bg-transparent text-black"
          type="color"
          bind:value={color}
          list="colors"
        />
        <Icon
          icon="fluent:eyedropper-24-regular"
          class="absolute top-0 bottom-0 left-0 right-0 h-full w-full p-[10px] text-white"
        />
      </div>
      <Colors id="colors" />
    </label>
    <input
      min={2}
      required
      max={99}
      class="text-black outline-none"
      slot="content"
      bind:value={name}
    />
    <Button
      type="submit"
      slot="primary"
      class="flex aspect-square h-10 w-10 items-center justify-center !rounded-full bg-blue-500 text-white !ring-offset-white"
    >
      <Icon icon="ic:baseline-plus" />
    </Button>
  </DualAction>
</form>
