import { writable } from "svelte/store";

export type User = {
  id: string;
  email: string;
};

export const user = writable<User | undefined>();

export async function update() {
  const resp = await fetch("/.auth/me");
  const { userDetails, userId } = (await resp.json()).clientPrincipal;

  user.update(() => ({ id: userId, email: userDetails }));
}

update();
