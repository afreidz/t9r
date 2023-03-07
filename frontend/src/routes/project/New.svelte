<script lang="ts">
  import trpc from "@/lib/trpc";
  import Icon from "@iconify/svelte";
  import { push } from "svelte-spa-router";
  import Colors from "@/core/Colors.svelte";
  import { fetchProjects } from "@/lib/projects";
  import DualAction from "@/core/DualAction.svelte";
  import Header from "@/components/core/Header.svelte";
  import Layout from "@/components/core/Layout.svelte";
  import type { Project } from "@/backend/schema/project";
  import Button from "@/components/foundation/Button.svelte";

  let name: Project["name"];
  let color: Project["color"];

  async function submit() {
    const result = await trpc.projects.create.mutate({
      name,
      color,
    });

    if (result.acknowledged) {
      await fetchProjects();
      push("/timers");
    }
  }
</script>

<Layout>
  <Header main="New Project" />
  <form
    class="my-6 flex flex-1 items-center justify-center"
    on:submit|preventDefault={submit}
  >
    <DualAction as="p" label="Project Name">
      <label class="flex-none" slot="secondary">
        <span class="sr-only">Color</span>
        <div
          class="relative h-10 w-10 overflow-hidden rounded-full ring-blue-500 ring-offset-2 ring-offset-white focus-within:ring"
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
        slot="primary"
        class="flex h-10 w-10 items-center justify-center !rounded-full bg-blue-500 text-white !ring-offset-white"
      >
        <Icon icon="ic:baseline-plus" />
      </Button>
    </DualAction>
  </form>
</Layout>

<style>
  input[type="color"]::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  input[type="color"]::-webkit-color-swatch {
    border: none;
  }
</style>
