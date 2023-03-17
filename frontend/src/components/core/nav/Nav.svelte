<script lang="ts">
  import SubNav from "./Sub.svelte";
  import Icon from "@iconify/svelte";
  import { user } from "@/stores/user";
  import SubItem from "./SubItem.svelte";
  import { getToday } from "@/lib/dates";
  import projects from "@/stores/projects";
  import MainItem from "./MainItem.svelte";
  import Dialog from "@/core/Dialog.svelte";
  import { location } from "svelte-spa-router";
  import Button from "@/foundation/Button.svelte";
  import NewProject from "@/core/NewProject.svelte";
  import { showArchived, showProjects } from "@/stores/ui";

  let newProject = false;
</script>

<nav class="flex flex-1 flex-col pl-4 text-lg">
  <ul class="flex flex-col items-stretch border-l-2 border-neutral-light/50">
    <MainItem active={$location.startsWith("/timers")}>
      <span slot="main" class="flex-1">Timers</span>
      <SubNav>
        <SubItem to={`/timers/daily/${getToday().toString()}`} on:navigate>
          <Icon
            slot="icon"
            icon="mdi:calendar-today-outline"
            class="text-neutral-light"
          />
          Daily
        </SubItem>
        <SubItem to={`/timers/monthly/${getToday().toString()}`} on:navigate>
          <Icon
            slot="icon"
            icon="mdi:calendar-month-outline"
            class="text-neutral-light"
          />
          Monthly
        </SubItem>
      </SubNav>
    </MainItem>
    <MainItem
      clickable
      active={$location.startsWith("/project")}
      on:click={() => ($showProjects = !$showProjects)}
    >
      <span slot="main">Projects</span>
      <Icon
        slot="right"
        icon="ph:caret-down-bold"
        class={`flex-none transition-transform ease-in-out ${
          showProjects ? "rotate-180" : ""
        }`}
      />
      {#if $showProjects}
        <SubNav>
          {#each $projects.filter((p) => !p.archived) as project}
            <SubItem to={`/project/${project._id}`} on:navigate>
              <figure
                slot="icon"
                class="h-4 w-4 rounded"
                style={`background-color: ${project.color}`}
              >
                <figcaption class="sr-only">
                  Color assigned to project
                </figcaption>
              </figure>
              {project.name}
            </SubItem>
          {/each}
          {#if $projects.some((p) => p.archived)}
            <SubItem
              clickable
              class="mt-6"
              on:click={() => ($showArchived = !$showArchived)}
            >
              <Icon slot="icon" icon="mdi:eye-off-outline" />
              <span class="flex-1 text-neutral-light">Archived Projects</span>
              <Icon
                slot="right"
                icon="ph:caret-down-bold"
                class={`transition-transform ease-in-out ${
                  $showArchived ? "rotate-180" : ""
                }`}
              />
            </SubItem>
          {/if}
          {#if $showArchived}
            <SubNav>
              {#each $projects.filter((p) => p.archived) as project}
                <SubItem to={`/project/${project._id}`} on:navigate>
                  <figure
                    slot="icon"
                    class="h-4 w-4 rounded"
                    style={`background-color: ${project.color}`}
                  >
                    <figcaption class="sr-only">
                      Color assigned to project
                    </figcaption>
                  </figure>
                  {project.name}
                </SubItem>
              {/each}
            </SubNav>
          {/if}
          <SubItem clickable on:click={() => (newProject = true)}>
            <Icon slot="icon" icon="material-symbols:add-circle-outline" />
            <span class="text-neutral-light">Add project</span>
          </SubItem>
        </SubNav>
      {/if}
    </MainItem>
    <MainItem>
      <a href="/logout" slot="main">
        <span class="flex-1 text-xl font-bold">Log Out</span>
      </a>
      {#if $user}
        <SubNav>
          <SubItem class="break-all">{$user.email}</SubItem>
        </SubNav>
      {/if}
    </MainItem>
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
