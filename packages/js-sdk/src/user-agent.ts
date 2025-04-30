import { getVersion } from "#core";
import { VERSION } from "./version";

export async function buildUserAgent(): Promise<string> {
  return `Prelude/${VERSION} Core/${await getVersion()} ${window.navigator.userAgent}`;
}
