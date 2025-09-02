import { DEFAULT_FETCH_TIMEOUT_MS } from "../constants";
import { core } from "../core";
import { buildUserAgent } from "../user-agent";
import Config from "./config";
import Signals from "./signals";

export async function dispatchSignals(sdkKey: string, url?: string): Promise<string> {
  url = url ?? (await core.getDefaultEndpoint());
  const config = new Config(sdkKey, DEFAULT_FETCH_TIMEOUT_MS);

  const userAgent = await buildUserAgent();
  const signals = await Signals.collect();
  const body = await core.generatePayload(signals);

  const response = await fetch(`${url}/v1/signals`, {
    method: "POST",
    mode: "cors",
    headers: {
      "Connection": "close",
      "Content-Encoding": "deflate",
      "Content-Type": "application/vnd.prelude.signals",
      "User-Agent": userAgent,
      "X-SDK-DispatchID": signals.id,
      "X-SDK-Key": sdkKey,
      "X-SDK-Request-Date": new Date().toISOString(),
    },
    body: body as BodyInit,
    signal: AbortSignal.timeout(config.timeout),
  });

  if (!response.ok) {
    throw new Error(`Failed to dispatch signals: ${response.status} ${response.statusText}`);
  }

  return signals.id;
}
