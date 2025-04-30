import { DEFAULT_FETCH_TIMEOUT_MS } from "../constants";
import { generatePayload, getDefaultEndpoint, getDispatchId } from "#core";
import { buildUserAgent } from "../user-agent";
import Config from "./config";
import Signals from "./signals";

export async function dispatchSignals(sdkKey: string, url?: string): Promise<string> {
  url = url ?? (await getDefaultEndpoint());
  const dispatchId = await getDispatchId();
  const signals = await Signals.collect();
  const endpoint = url + "/v1/signals";
  const config = new Config(sdkKey, DEFAULT_FETCH_TIMEOUT_MS);

  fetch(endpoint, {
    method: "POST",
    mode: "cors",
    headers: {
      "X-SDK-DispatchID": dispatchId,
      "X-SDK-Key": sdkKey,
      Connection: "close",
      "User-Agent": await buildUserAgent(),
      "Content-Encoding": "deflate",
      "Content-Type": "application/vnd.prelude.signals",
    },
    body: await generatePayload(signals),
    signal: AbortSignal.timeout(config.timeout),
  });

  return dispatchId;
}
