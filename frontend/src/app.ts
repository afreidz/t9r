import "./app.postcss";
import App from "./App.svelte";
import "temporal-polyfill/global";

const app = new App({ target: document.body });

export default app;
