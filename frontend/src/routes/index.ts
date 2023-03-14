import Main from "@/routes/Main.svelte";
import NotFound from "@/routes/NotFound.svelte";
import Timers from "@/routes/timers/List.svelte";
import TimerDetails from "@/routes/timers/Details.svelte";
import ProjectDetails from "@/routes/project/Details.svelte";

export default {
  "/": Main,
  "/timers/daily": Timers,
  "/timers/monthly": Timers,
  "/timers/daily/:date": Timers,
  "/timers/monthly/:date": Timers,
  "/timer/:id": TimerDetails,
  "/project/:id": ProjectDetails,
  "*": NotFound,
};
