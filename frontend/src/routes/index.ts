import Main from "@/routes/Main.svelte";
import NotFound from "@/routes/NotFound.svelte";
import Timers from "@/routes/timers/List.svelte";
import TimerDetails from "@/routes/timers/Details.svelte";
import ProjectDetails from "@/routes/project/Details.svelte";

export default {
  "/": Main,
  "/timers/all": Timers,
  "/timers/day": Timers,
  "/timers/month": Timers,
  "/timers/week": Timers,
  "/timers/day/:date": Timers,
  "/timers/month/:date": Timers,
  "/timers/week/:date": Timers,
  "/timer/:id": TimerDetails,
  "/project/:id": ProjectDetails,
  "*": NotFound,
};
