import type { AppRouter } from "../../../backend/trpc/app";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
    }),
  ],
  transformer: undefined,
});

export default client;
