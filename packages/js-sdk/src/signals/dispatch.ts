import { DEFAULT_FETCH_TIMEOUT_MS } from "../constants";
import { generatePayload, getDefaultEndpoint } from "#core";
import { buildUserAgent } from "../user-agent";
import Config from "./config";
import Signals from "./signals";

export async function dispatchSignals(sdkKey: string, url?: string): Promise<string> {
  url = url ?? (await getDefaultEndpoint());
  const signals = await Signals.collect();
  const endpoint = url + "/v1/signals";
  const config = new Config(sdkKey, DEFAULT_FETCH_TIMEOUT_MS);

  const response = await fetch(endpoint, {
    method: "POST",
    mode: "cors",
    headers: {
      "X-SDK-DispatchID": signals.dispatchId,
      "X-SDK-Key": sdkKey,
      Connection: "close",
      "User-Agent": await buildUserAgent(),
      "Content-Encoding": "deflate",
      "Content-Type": "application/vnd.prelude.signals",
    },
    body: await generatePayload(signals),
    signal: AbortSignal.timeout(config.timeout),
  });

  if (!response.ok) {
    throw new Error(`Failed to dispatch signals: ${response.status} ${response.statusText}`);
  }

  return signals.dispatchId;
}
