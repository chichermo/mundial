import { isRedirectError } from "next/dist/client/components/redirect-error";

export function rethrowIfNavigationError(err: unknown): void {
  if (isRedirectError(err)) throw err;
}
