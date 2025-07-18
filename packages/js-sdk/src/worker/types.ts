import Signals from "../signals/signals";

export interface IMessageEventData {
  promiseId: string;
  type: "init" | "generate_payload" | "get_default_endpoint" | "get_dispatch_id" | "get_version";
  error?: Error;
}

interface GeneratePayloadData extends IMessageEventData {
  result: Uint8Array;
  type: "generate_payload";
  signals: Signals;
}

interface GetDefaultEndpointData extends IMessageEventData {
  result: string;
  type: "get_default_endpoint";
}

interface GetDispatchIdData extends IMessageEventData {
  result: string;
  type: "get_dispatch_id";
}

interface GetVersionData extends IMessageEventData {
  result: string;
  type: "get_version";
}

interface GetInitData extends IMessageEventData {
  result: undefined;
  type: "init";
}

export type MessageEventData =
  | GeneratePayloadData
  | GetDefaultEndpointData
  | GetDispatchIdData
  | GetVersionData
  | GetInitData;
