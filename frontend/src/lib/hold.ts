const duration = 600;

export default function hold(node: HTMLElement) {
  let timer: ReturnType<typeof setTimeout>;

  node.addEventListener("touchstart", (e) => {
    timer = setTimeout(() => {
      e.preventDefault();
      node.dispatchEvent(new CustomEvent("hold"));
    }, duration);
  });

  node.addEventListener("touchend", () => {
    clearTimeout(timer);
    node.dispatchEvent(new CustomEvent("release"));
  });
}
