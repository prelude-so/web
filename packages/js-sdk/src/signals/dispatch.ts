import { DEFAULT_FETCH_TIMEOUT_MS } from "../constants";
import { core } from "../core";
import { buildUserAgent } from "../user-agent";
import Config from "./config";
import Signals from "./signals";

export async function dispatchSignals(sdkKey: string, url?: string): Promise<string> {
  url = url ?? (await core.getDefaultEndpoint());
  const signals = await Signals.collect();
  const endpoint = `${url}/v1/signals`;
  const config = new Config(sdkKey, DEFAULT_FETCH_TIMEOUT_MS);

  const response = await fetch(endpoint, {
    method: "POST",
    mode: "cors",
    headers: {
      "Connection": "close",
      "Content-Encoding": "deflate",
      "Content-Type": "application/vnd.prelude.signals",
      "User-Agent": await buildUserAgent(),
      "X-SDK-DispatchID": signals.id,
      "X-SDK-Key": sdkKey,
      "X-SDK-Request-Date": new Date().toISOString(),
    },
    body: (await core.generatePayload(signals)) as BodyInit,
    signal: AbortSignal.timeout(config.timeout),
  });

  if (!response.ok) {
    throw new Error(`Failed to dispatch signals: ${response.status} ${response.statusText}`);
  }

  return signals.id;
}
