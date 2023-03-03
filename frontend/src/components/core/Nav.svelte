<script lang="ts">
  import Icon from "@iconify/svelte";
  import projects from "@/lib/projects";
  import { slide } from "svelte/transition";
  import Link from "@/foundation/Link.svelte";
  import Button from "@/foundation/Button.svelte";

  let showProjects = true;
</script>

<nav class="flex flex-1 flex-col px-3 text-lg">
  <ul class="flex flex-1 flex-col items-stretch gap-3">
    <li>
      <Link to="/timers" on:navigate>
        <div class="flex flex-wrap items-center gap-2">
          <Icon icon="material-symbols:timer-outline" class="flex-none" />
          <span class="flex-1">Timers</span>
        </div>
      </Link>
    </li>
    <li>
      <Button
        type="button"
        on:click={() => (showProjects = !showProjects)}
        class="flex w-full items-center gap-2"
      >
        <Icon icon="mdi:briefcase-outline" class="flex-none" />
        <span class="flex-1 text-left">Projects</span>
        <Icon
          icon="ph:caret-down-bold"
          class={`flex-none transition-transform ease-in-out ${
            showProjects ? "rotate-180" : ""
          }`}
        />
      </Button>
      {#if showProjects}
        <ul in:slide out:slide class="my-2 ml-7 flex flex-1 flex-col gap-2">
          {#each $projects.filter((p) => !p.archived) as project}
            <li>
              <div class="flex flex-wrap items-center gap-2">
                <Link to={`/projects/${project._id}`} on:navigate>
                  <span class="flex flex-1 items-center gap-2">
                    <figure
                      class="h-4 w-4 rounded"
                      style={`background-color: ${project.color}`}
                    >
                      <figcaption class="sr-only">
                        Color assigned to project
                      </figcaption>
                    </figure>
                    <span>{project.name}</span>
                  </span>
                </Link>
              </div>
            </li>
          {/each}
          <li>
            <Link to="/projects/new" on:navigate>
              <div class="flex flex-wrap items-center gap-2">
                <Icon
                  icon="material-symbols:add-circle-outline"
                  class="flex-none"
                />
                <span class="flex-1"> Add project </span>
              </div>
            </Link>
          </li>
        </ul>
      {/if}
    </li>
    <li>
      <Link to="/settings" on:navigate>
        <div class="flex flex-wrap items-center gap-2">
          <Icon icon="ph:gear-six" class="flex-none" />
          <span class="flex-1">Settings</span>
        </div>
      </Link>
    </li>
    <li>
      <Link to="/logout">
        <div class="flex flex-wrap items-center gap-2">
          <Icon icon="ri:logout-box-line" class="flex-none" />
          <span class="flex-1">Log Out</span>
        </div>
      </Link>
    </li>
  </ul>
</nav>
