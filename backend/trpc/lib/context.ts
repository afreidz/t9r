import { CreateAzureFuncContextOptions } from "./utils";

export function createContext(opts: CreateAzureFuncContextOptions) {
  const val = opts.req.headers["x-ms-client-principal"];

  if (!val) return { user: null };

  const enc = Buffer.from(val, "base64");
  const user = JSON.parse(enc.toString("ascii"));

  return { user };
}
