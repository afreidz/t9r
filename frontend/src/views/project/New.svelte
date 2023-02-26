<script lang="ts">
  import trpc from "../../lib/trpc";
  import type { Project } from "../../../../backend/schema/project";

  let name: Project["name"];
  let color: Project["color"];

  async function submit() {
    const result = await trpc.projects.create.mutate({
      name,
      color,
    });
    console.log(result);
  }
</script>

<form on:submit|preventDefault={submit}>
  <h2>New Project</h2>
  <div class="p-6">
    <label>
      <span>Name</span>
      <input class="text-black" bind:value={name} />
    </label>
  </div>
  <div class="p-6">
    <label>
      <span>Color</span>
      <input class="text-black" type="color" bind:value={color} list="colors" />
      <datalist id="colors">
        <option value="#cfcfcf" />
        <option value="#ff00ff" />
      </datalist>
    </label>
  </div>
  <button>Submit</button>
</form>
