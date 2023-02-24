import { TRPCError } from "@trpc/server";
import type {
  HTTPRequest,
  HTTPResponse,
  ResponseMetaFn,
} from "@trpc/server/dist/http/internals/types";
import type { AnyRouter, inferRouterContext } from "@trpc/server";
import type { OnErrorFunction } from "@trpc/server/dist/internals/types";
import { HttpRequest as AzureHttpRequest, Context } from "@azure/functions";

export function funcTriggerToHTTPRequest(req: AzureHttpRequest): HTTPRequest {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(req.query)) {
    if (typeof value !== "undefined") {
      query.append(key, value);
    }
  }

  return {
    method: req.method || "get",
    query: query,
    headers: req.headers,
    body: req.bufferBody,
  };
}

export function urlToPath(url: string): string {
  const parsedUrl = new URL(url);
  const pathParts = parsedUrl.pathname.split("/");
  const trpcPath = pathParts[pathParts.length - 1];

  if (trpcPath === undefined) {
    throw new TRPCError({
      code: "BAD_REQUEST",
    });
  } else {
    return trpcPath;
  }
}

export type CreateAzureFuncContextOptions = {
  context: Context;
  req: AzureHttpRequest;
};

export type AzureFuncCreateContextFn<TRouter extends AnyRouter> = ({
  req,
  context,
}: CreateAzureFuncContextOptions) =>
  | inferRouterContext<TRouter>
  | Promise<inferRouterContext<TRouter>>;

export type AzureFunctionOptions<TRouter extends AnyRouter> = {
  router: TRouter;
  batching?: {
    enabled: boolean;
  };
  onError?: OnErrorFunction<TRouter, AzureHttpRequest>;
  responseMeta?: ResponseMetaFn<TRouter>;
  createContext?: AzureFuncCreateContextFn<TRouter>;
};

export function tRPCOutputToAzureFuncOutput(
  response: HTTPResponse
): Record<string, any> {
  return {
    body: response.body ?? undefined,
    status: response.status,
    headers: {
      "Content-Type": "application/json",
      ...(response.headers ?? {}),
    },
  };
}
