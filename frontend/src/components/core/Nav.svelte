<script lang="ts">
  import Icon from "@iconify/svelte";
  import projects from "@/lib/projects";
  import { link } from "svelte-spa-router";
  import { slide } from "svelte/transition";
  import { location } from "svelte-spa-router";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let showProjects = true;
</script>

<nav class="flex flex-1 flex-col px-3 text-lg">
  <ul class="flex flex-1 flex-col items-stretch gap-3">
    <li>
      <a
        href="/timers"
        on:click={() => dispatch("navigate", "/")}
        use:link={{ disabled: $location === "/timers" }}
      >
        <div class="flex flex-wrap items-center gap-2">
          <Icon icon="material-symbols:timer-outline" class="flex-none" />
          <span class="flex-1">Timers</span>
        </div>
      </a>
    </li>
    <li>
      <button
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
      </button>
      {#if showProjects}
        <ul in:slide out:slide class="my-2 ml-7 flex flex-1 flex-col gap-2">
          {#each $projects.filter((p) => !p.archived) as project}
            <li>
              <div class="flex flex-wrap items-center gap-2">
                <a
                  href={`/projects/${project._id}`}
                  use:link={{
                    disabled: $location === `/projects/${project._id}`,
                  }}
                  on:click={() =>
                    dispatch("navigate", `/projects/${project._id}`)}
                >
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
                </a>
              </div>
            </li>
          {/each}
          <li>
            <a
              href="/projects/new"
              use:link={{ disabled: $location === `/projects/new` }}
              on:click={() => dispatch("navigate", `/projects/new`)}
            >
              <div class="flex flex-wrap items-center gap-2">
                <Icon
                  icon="material-symbols:add-circle-outline"
                  class="flex-none"
                />
                <span class="flex-1"> Add project </span>
              </div>
            </a>
          </li>
        </ul>
      {/if}
    </li>
    <li>
      <a
        href="/settings"
        use:link={{ disabled: $location === `/settings` }}
        on:click={() => dispatch("navigate", `/settings`)}
      >
        <div class="flex flex-wrap items-center gap-2">
          <Icon icon="ph:gear-six" class="flex-none" />
          <span class="flex-1">Settings</span>
        </div>
      </a>
    </li>
    <li>
      <a href="/logout">
        <div class="flex flex-wrap items-center gap-2">
          <Icon icon="ri:logout-box-line" class="flex-none" />
          <span class="flex-1">Log Out</span>
        </div>
      </a>
    </li>
  </ul>
</nav>
