<script lang="ts">
  import Link from "../foundation/Link.svelte";
  import type { Project } from "@/backend/schema/project";

  type $$Props = {
    id?: string;
    project?: Project;
  };

  let { id, project }: $$Props = $$props;
  export { id, project };
</script>

<Link
  to={`/timer/${id}`}
  style={`background-color: ${project?.color}`}
  class="mb-2 flex items-center gap-2 !rounded-full p-2 leading-8 text-white"
>
  <abbr
    title={project?.name}
    style={`color: ${project?.color}`}
    class="flex aspect-square w-8 flex-none items-center justify-center rounded-full bg-white no-underline"
  >
    {(project?.name || "").charAt(0).toUpperCase()}
  </abbr>
  <div
    class="flex flex-1 items-center justify-end overflow-auto whitespace-nowrap text-sm"
  >
    <slot />
  </div>
</Link>
