import Main from "@/routes/Main.svelte";
import Timers from "@/routes/Timers.svelte";
import NotFound from "@/routes/NotFound.svelte";
import NewProject from "@/routes/project/New.svelte";

export default {
  "/": Main,
  "/timers": Timers,
  "/projects/new": NewProject,
  "*": NotFound,
};
