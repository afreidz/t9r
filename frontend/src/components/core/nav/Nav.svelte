<script lang="ts">
  import {
    showTimers,
    showReports,
    showAccount,
    showProjects,
    showArchived,
    showForecasts,
  } from "@/stores/ui";
  import qs from "@/lib/stores/qs";
  import SubNav from "./Sub.svelte";
  import Icon from "@iconify/svelte";
  import SubItem from "./SubItem.svelte";
  import projects from "@/stores/projects";
  import MainItem from "./MainItem.svelte";
  import Dialog from "@/core/Dialog.svelte";
  import { location } from "svelte-spa-router";
  import settings from "@/lib/stores/settings";
  import Button from "@/foundation/Button.svelte";
  import NewProject from "@/core/NewProject.svelte";

  let newProject = false;

  $: if (!$projects.length) newProject = true;
</script>

<nav class="flex flex-1 flex-col px-5 text-lg">
  <ul class="flex flex-col items-stretch border-l border-dotted border-neutral-light/20">
    {#if $projects.length}
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
              to="/timers/day"
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
              to="/timers/week"
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
              to="/timers/month"
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
              active={$location.startsWith("/timers/all") && !$qs.has("label")}
              to="/timers/all?"
              on:navigate
            >
              <Icon slot="icon" class="text-neutral-light" icon="ic:baseline-list-alt" />
              All
            </SubItem>
            {#if $settings?.savedQueries?.filter((q) => q.type === "timer").length}
              <SubItem class="my-2 -ml-4 border-b">&nbsp;</SubItem>
              {#each $settings.savedQueries.filter((q) => q.type === "timer") as query}
                <SubItem
                  active={$location.includes("/timers/all") &&
                    $qs.get("label") === query.label}
                  to={`${query.url}&label=${encodeURI(query.label)}`}
                  on:navigate
                >
                  <Icon
                    slot="icon"
                    class="text-neutral-light"
                    icon="ic:baseline-list-alt"
                  />
                  {query.label}
                </SubItem>
              {/each}
            {/if}
          </SubNav>
        {/if}
      </MainItem>
    {/if}
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
                class="flex h-5 w-5 items-center justify-center rounded-full text-[12px]"
                style={`background-color: ${project.color}`}
              >
                <figcaption class:sr-only={!project.icon}>
                  {project.icon || "Color assigned to project"}
                </figcaption>
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
    {#if $projects.length}
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
              active={$location.startsWith("/reports/workplan") && !$qs.has("label")}
              to="/reports/workplan?"
              on:navigate
            >
              <Icon slot="icon" icon="carbon:plan" class="text-neutral-light" />
              Workplan
            </SubItem>
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
            {#if $settings?.savedQueries?.filter((q) => q.type === "workplan").length}
              <SubItem class="my-2 -ml-4 border-b">&nbsp;</SubItem>
              {#each $settings.savedQueries.filter((q) => q.type === "workplan") as query}
                <SubItem
                  active={$location.includes("/reports/workplan") &&
                    $qs.get("label") === query.label}
                  to={`${query.url}&label=${encodeURI(query.label)}`}
                  on:navigate
                >
                  <Icon slot="icon" class="text-neutral-light" icon="carbon:plan" />
                  {query.label}
                </SubItem>
              {/each}
            {/if}
          </SubNav>
        {/if}
      </MainItem>
    {/if}
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
