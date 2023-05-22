import { writable } from "svelte/store";

const gi = localStorage.getItem.bind(localStorage);
const si = localStorage.setItem.bind(localStorage);

export type SavedQuery = {
  label: string;
  url: string;
};

const savedQueries = writable<SavedQuery[]>(JSON.parse(gi("saved-queries") || "[]"));
savedQueries.subscribe((sq: SavedQuery[]) => si("saved-queries", JSON.stringify(sq)));

export default savedQueries;
