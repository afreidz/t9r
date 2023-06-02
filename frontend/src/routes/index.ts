import Main from "@/routes/Main.svelte";
import NotFound from "@/routes/NotFound.svelte";
import Timers from "@/routes/timers/List.svelte";
import ErrorPage from "@/routes/ErrorPage.svelte";
import Settings from "@/routes/settings/Settings.svelte";
import TimerDetails from "@/routes/timers/Details.svelte";
import ProjectDetails from "@/routes/project/Details.svelte";
import WorkplanReport from "@/routes/reports/Workplan.svelte";
import TimesheetReport from "@/routes/reports/Timesheet.svelte";
import UtilizationReport from "@/routes/reports/utilization/Utilization.svelte";

export default {
  "/": Main,
  "/timers/all": Timers,
  "/timers/day": Timers,
  "/timers/month": Timers,
  "/timers/week": Timers,
  "/timers/day/:date": Timers,
  "/timers/days/:date": Timers,
  "/account/settings": Settings,
  "/timers/month/:date": Timers,
  "/timers/months/:date": Timers,
  "/timers/week/:date": Timers,
  "/timers/weeks/:date": Timers,
  "/timer/:id": TimerDetails,
  "/project/:id": ProjectDetails,
  "/reports/week": TimesheetReport,
  "/reports/workplan": WorkplanReport,
  "/reports/workplan/:date": WorkplanReport,
  "/reports/week/:date": TimesheetReport,
  "/reports/utilization": UtilizationReport,
  "/error": ErrorPage,
  "*": NotFound,
};
