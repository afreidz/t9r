import Main from "@/routes/Main.svelte";
import Timers from "@/routes/Timers.svelte";
import NotFound from "@/routes/NotFound.svelte";
import NewProject from "@/routes/project/New.svelte";
import ProjectDetails from "@/routes/project/Details.svelte";

export default {
  "/": Main,
  "/timers": Timers,
  "/projects/new": NewProject,
  "/projects/:id": ProjectDetails,
  "*": NotFound,
};
