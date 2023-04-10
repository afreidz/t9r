<script lang="ts">
  import SubNav from "./Sub.svelte";
  import Icon from "@iconify/svelte";
  import SubItem from "./SubItem.svelte";
  import { getToday } from "@/lib/dates";
  import projects from "@/stores/projects";
  import MainItem from "./MainItem.svelte";
  import Dialog from "@/core/Dialog.svelte";
  import { location } from "svelte-spa-router";
  import Button from "@/foundation/Button.svelte";
  import NewProject from "@/core/NewProject.svelte";
  import {
    showTimers,
    showReports,
    showAccount,
    showProjects,
    showArchived,
    showForecasts,
  } from "@/stores/ui";

  let newProject = false;
</script>

<nav class="flex flex-1 flex-col px-5 text-lg">
  <ul class="flex flex-col items-stretch border-l border-dotted border-neutral-light/20">
    <MainItem
      clickable
      active={$location.startsWith("/timers")}
      on:click={() => ($showTimers = !$showTimers)}
    >
      <span slot="main" class="flex-1">Timers</span>
      <Icon
        slot="right"
        icon="ph:caret-down-bold"
        class={`flex-none transition-transform ease-in-out ${
          $showTimers ? "rotate-180" : ""
        }`}
      />
      {#if $showTimers}
        <SubNav>
          <SubItem
            active={$location.startsWith("/timers/day")}
            to={`/timers/day/${getToday().toString()}`}
            on:navigate
          >
            <Icon
              slot="icon"
              icon="mdi:calendar-today-outline"
              class="text-neutral-light"
            />
            Daily
          </SubItem>
          <SubItem
            active={$location.startsWith("/timers/week")}
            to={`/timers/week/${getToday().toString()}`}
            on:navigate
          >
            <Icon
              slot="icon"
              icon="mdi:calendar-minus-outline"
              class="text-neutral-light"
            />
            Weekly
          </SubItem>
          <SubItem
            active={$location.startsWith("/timers/month")}
            to={`/timers/month/${getToday().toString()}`}
            on:navigate
          >
            <Icon
              slot="icon"
              icon="mdi:calendar-month-outline"
              class="text-neutral-light"
            />
            Monthly
          </SubItem>
          <SubItem
            active={$location.startsWith("/timers/all")}
            to="/timers/all"
            on:navigate
          >
            <Icon slot="icon" class="text-neutral-light" icon="ic:baseline-list-alt" />
            All
          </SubItem>
        </SubNav>
      {/if}
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
          $showProjects ? "rotate-180" : ""
        }`}
      />
      {#if $showProjects}
        <SubNav>
          {#each $projects.filter((p) => !p.archived) as project}
            <SubItem
              on:navigate
              to={`/project/${project._id}`}
              active={$location === `/project/${project._id}`}
            >
              <figure
                slot="icon"
                class="h-4 w-4 rounded-full"
                style={`background-color: ${project.color}`}
              >
                <figcaption class="sr-only">Color assigned to project</figcaption>
              </figure>
              {project.name}
            </SubItem>
          {/each}
          {#if $projects.some((p) => p.archived)}
            <SubItem clickable on:click={() => ($showArchived = !$showArchived)}>
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
                <SubItem
                  on:navigate
                  to={`/project/${project._id}`}
                  active={$location === `/project/${project._id}`}
                >
                  <figure
                    slot="icon"
                    class="h-4 w-4 rounded-full"
                    style={`background-color: ${project.color}`}
                  >
                    <figcaption class="sr-only">Color assigned to project</figcaption>
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
    <MainItem
      clickable
      active={$location.startsWith("/forecasts")}
      on:click={() => ($showForecasts = !$showForecasts)}
    >
      <Icon
        slot="right"
        icon="ph:caret-down-bold"
        class={`flex-none transition-transform ease-in-out ${
          $showForecasts ? "rotate-180" : ""
        }`}
      />
      <span slot="main">Forecasts</span>
      {#if $showForecasts}
        <SubNav>
          <SubItem active={$location === "/forecasts/5"} to="/forecasts/5" on:navigate>
            <Icon
              slot="icon"
              class="text-neutral-light"
              icon="mdi:calendar-minus-outline"
            />
            Upcoming
          </SubItem>
          <SubItem active={$location === "/forecasts/13"} to="/forecasts/13" on:navigate>
            <Icon
              slot="icon"
              class="text-neutral-light"
              icon="mdi:calendar-month-outline"
            />
            Quarterly
          </SubItem>
          <SubItem active={$location === "/forecasts/52"} to="/forecasts/52" on:navigate>
            <Icon
              slot="icon"
              class="text-neutral-light"
              icon="mdi:calendar-blank-outline"
            />
            Annual
          </SubItem>
        </SubNav>
      {/if}
    </MainItem>
    <MainItem
      clickable
      active={$location.startsWith("/reports")}
      on:click={() => ($showReports = !$showReports)}
    >
      <Icon
        slot="right"
        icon="ph:caret-down-bold"
        class={`flex-none transition-transform ease-in-out ${
          $showReports ? "rotate-180" : ""
        }`}
      />
      <span slot="main">Reports</span>
      {#if $showReports}
        <SubNav>
          <SubItem
            active={$location === "/reports/utilization"}
            to="/reports/utilization"
            on:navigate
          >
            <Icon slot="icon" icon="mdi:graph-line" class="text-neutral-light" />
            Utilization
          </SubItem>
          <SubItem
            active={$location.startsWith("/reports/week")}
            to="/reports/week"
            on:navigate
          >
            <Icon
              slot="icon"
              icon="mdi:calendar-minus-outline"
              class="text-neutral-light"
            />
            Weekly Timesheet
          </SubItem>
        </SubNav>
      {/if}
    </MainItem>
    <MainItem
      clickable
      active={$location.startsWith("/account")}
      on:click={() => ($showAccount = !$showAccount)}
    >
      <Icon
        slot="right"
        icon="ph:caret-down-bold"
        class={`flex-none transition-transform ease-in-out ${
          $showAccount ? "rotate-180" : ""
        }`}
      />
      <span slot="main">Account</span>
      {#if $showAccount}
        <SubNav>
          <SubItem
            active={$location === "/account/settings"}
            to="/account/settings"
            on:navigate
          >
            <Icon slot="icon" icon="ic:outline-settings" class="text-neutral-light" />
            Settings
          </SubItem>
          <SubItem as="a" href="/logout" on:navigate>
            <Icon slot="icon" icon="ic:sharp-logout" class="text-neutral-light" />
            Logout
          </SubItem>
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
