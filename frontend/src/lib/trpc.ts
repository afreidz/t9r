import { globalError } from "@/lib/stores/ui";
import type { AppRouter } from "@/backend/trpc/app";
import { observable } from "@trpc/server/observable";
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
    }),
  ],
  transformer: undefined,
});

export default trpc;
