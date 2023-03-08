<script lang="ts">
  import Icon from "@iconify/svelte";
  import projects from "@/lib/projects";
  import Dialog from "@/core/Dialog.svelte";
  import { slide } from "svelte/transition";
  import Link from "@/foundation/Link.svelte";
  import { location } from "svelte-spa-router";
  import Button from "@/foundation/Button.svelte";
  import NewProject from "@/core/NewProject.svelte";

  let newProject = false;
  let showProjects = true;
</script>

<nav class="flex flex-1 flex-col pl-4 pr-3 text-lg">
  <ul class="flex flex-col items-stretch border-l-2 border-neutral-light/50">
    <li
      class="relative py-2 px-4"
      class:active={$location.startsWith("/timer")}
    >
      <Link to="/timers" on:navigate>
        <span class="flex-1 text-xl font-bold">Timers</span>
      </Link>
    </li>
    <li
      class="active relative py-2 px-4"
      class:active={$location.startsWith("/project")}
    >
      <Button
        type="button"
        on:click={() => (showProjects = !showProjects)}
        class="flex w-full items-center gap-2"
      >
        <span class="flex-1 text-left text-xl font-bold">Projects</span>
        <Icon
          icon="ph:caret-down-bold"
          class={`flex-none transition-transform ease-in-out ${
            showProjects ? "rotate-180" : ""
          }`}
        />
      </Button>
      {#if showProjects}
        <ul
          in:slide
          out:slide
          class="my-2 ml-4 flex w-full flex-1 flex-col gap-2 text-base"
        >
          {#each $projects.filter((p) => !p.archived) as project}
            <li>
              <div class="flex flex-wrap items-center gap-2">
                <Link to={`/project/${project._id}`} on:navigate>
                  <span class="flex flex-1 items-center gap-2">
                    <figure
                      class="h-4 w-4 rounded"
                      style={`background-color: ${project.color}`}
                    >
                      <figcaption class="sr-only">
                        Color assigned to project
                      </figcaption>
                    </figure>
                    <span class="font-mono font-light text-text-light/50"
                      >{project.name}</span
                    >
                  </span>
                </Link>
              </div>
            </li>
          {/each}
          <li>
            <Button on:click={() => (newProject = true)}>
              <div class="flex flex-wrap items-center gap-2">
                <Icon
                  icon="material-symbols:add-circle-outline"
                  class="flex-none"
                />
                <span class="flex-1"> Add project </span>
              </div>
            </Button>
          </li>
        </ul>
      {/if}
    </li>
    <li
      class="active relative py-2 px-4"
      class:active={$location.startsWith("/settings")}
    >
      <Link to="/settings" on:navigate>
        <span class="flex-1 text-xl font-bold">Settings</span>
      </Link>
    </li>
    <li class="relative py-2 px-4">
      <a href="/logout">
        <span class="flex-1 text-xl font-bold">Log Out</span>
      </a>
    </li>
  </ul>
</nav>

{#if newProject}
  <Dialog open={true} sub="You are about to..." title="Add a new project">
    <Button slot="close" value="cancel" on:click={() => (newProject = false)}>
      <Icon icon="material-symbols:close" class="h-7 w-7" />
    </Button>
    <NewProject on:created={() => (newProject = false)} />
  </Dialog>
{/if}

<style lang="postcss">
  .active::before {
    @apply absolute -left-px top-[18px] h-2 w-2 flex-none -translate-x-1/2 rounded-full bg-neutral-light content-[""];
  }
</style>
