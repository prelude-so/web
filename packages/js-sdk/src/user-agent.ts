import { core } from "./core";
import { VERSION } from "./version";

export async function buildUserAgent(): Promise<string> {
  return `Prelude/${VERSION} Core/${await core.getVersion()} ${window.navigator.userAgent}`;
}
