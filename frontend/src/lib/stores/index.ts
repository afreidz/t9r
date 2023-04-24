import { showLoader } from "@/lib/stores/ui";
import { updateTags } from "@/lib/stores/tags";
import { updateUser } from "@/lib/stores/user";
import { updateProjects } from "@/lib/stores/projects";
import { updateSettings } from "@/lib/stores/settings";

export default async function updateStores() {
  showLoader.update(() => true);
  await updateProjects();
  await updateSettings();
  await updateTags();
  await updateUser();
  showLoader.update(() => false);
}
