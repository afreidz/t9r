<script lang="ts">
  import Icon from "@iconify/svelte";
  import projects from "@/lib/projects";
  import { link } from "svelte-spa-router";
  import { slide } from "svelte/transition";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let showProjects = true;
</script>

<nav class="flex flex-1 flex-col px-3 text-xl">
  <ul class="flex-1 flex flex-col gap-3 items-stretch">
    <li>
      <a href="/" use:link on:click={() => dispatch("navigate", "/")}>
        <div class="flex gap-2 items-center flex-wrap">
          <Icon icon="material-symbols:timer-outline" class="flex-none" />
          <span class="flex-1">Timers</span>
        </div>
      </a>
    </li>
    <li>
      <button
        type="button"
        on:click={() => (showProjects = !showProjects)}
        class="w-full flex gap-2 items-center"
      >
        <Icon icon="mdi:briefcase-outline" class="flex-none" />
        <span class="flex-1 text-left">Projects</span>
        <Icon
          icon="ph:caret-down-bold"
          class={`flex-none transition-transform ease-in-out hidden md:block ${
            showProjects ? "rotate-180" : ""
          }`}
        />
      </button>
      {#if showProjects}
        <ul in:slide out:slide class="flex-1 flex-col gap-3 ml-7 my-2">
          {#each $projects.filter((p) => !p.archived) as project}
            <li>
              <div class="flex gap-2 items-center flex-wrap">
                <a
                  href={`/projects/${project._id}`}
                  use:link
                  on:click={() =>
                    dispatch("navigate", `/projects/${project._id}`)}
                >
                  <span class="flex-1 flex items-center gap-2">
                    <figure
                      class="rounded w-4 h-4"
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
              use:link
              on:click={() => dispatch("navigate", `/projects/new`)}
            >
              <div class="flex gap-2 items-center flex-wrap">
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
        use:link
        on:click={() => dispatch("navigate", `/settings`)}
      >
        <div class="flex gap-2 items-center flex-wrap">
          <Icon icon="ph:gear-six" class="flex-none" />
          <span class="flex-1">Settings</span>
        </div>
      </a>
    </li>
    <li>
      <a href="/logout">
        <div class="flex gap-2 items-center flex-wrap">
          <Icon icon="ri:logout-box-line" class="flex-none" />
          <span class="flex-1">Log Out</span>
        </div>
      </a>
    </li>
  </ul>
</nav>
