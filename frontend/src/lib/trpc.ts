import type { AppRouter } from "@/backend/trpc/app";
import { createTRPCProxyClient, httpLink } from "@trpc/client";

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpLink({
      url: "/api/trpc",
    }),
  ],
  transformer: undefined,
});

export default trpc;
