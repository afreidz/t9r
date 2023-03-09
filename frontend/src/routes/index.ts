import Main from "@/routes/Main.svelte";
import Timers from "@/routes/Timers.svelte";
import NotFound from "@/routes/NotFound.svelte";
import ProjectDetails from "@/routes/project/Details.svelte";

export default {
  "/": Main,
  "/timers/daily": Timers,
  "/timers/monthly": Timers,
  "/timers/daily/:date": Timers,
  "/timers/monthly/:date": Timers,
  "/project/:id": ProjectDetails,
  "*": NotFound,
};
