import { globalError } from "@/lib/stores/ui";
import type { AppRouter } from "@/backend/trpc/app";
import { observable } from "@trpc/server/observable";
import type { RequestInitEsque } from "@trpc/client/dist/internals/types";
import { createTRPCProxyClient, httpLink, type TRPCLink } from "@trpc/client";

const errorLink: TRPCLink<AppRouter> = () => {
  return ({ next, op }) => {
    return observable((observer) => {
      const unsubscribe = next(op).subscribe({
        next(value) {
          observer.next(value);
        },
        error(error) {
          globalError.set(error.message);
          observer.error(error);
        },
        complete() {
          observer.complete();
        },
      });
      return unsubscribe;
    });
  };
};

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    errorLink,
    httpLink({
      url: "/api/trpc",
      fetch: shimFetch,
    }),
  ],
  transformer: undefined,
});

function shimFetch(url: RequestInfo | URL, options?: RequestInit | RequestInitEsque) {
  return fetch(url, {
    ...options,
    credentials: "include",
  }).then((r) => {
    if (r.redirected && r.url.includes("/.auth/login")) {
      const url = new URL(r.url);

      if (url.searchParams.get("post_login_redirect_uri")?.includes("/api")) {
        url.searchParams.set("post_login_redirect_uri", "/");
      }

      window.location.href = url.href;
    }
    return r;
  });
}

export default trpc;
