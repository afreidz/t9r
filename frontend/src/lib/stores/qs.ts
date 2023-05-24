import { writable } from "svelte/store";
import { querystring } from "svelte-spa-router";

const query = writable<URLSearchParams>(new URLSearchParams());
querystring.subscribe((qs) => {
  query.set(new URLSearchParams(qs));
});

export default query;
