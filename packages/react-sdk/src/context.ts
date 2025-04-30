import { PrldIdentifier } from "@prelude.so/js-sdk";
import { createContext } from "react";
import { initialSessionState, PrldSessionState } from "./state";

const stub = (): never => {
  throw new Error("You forgot to wrap your component in <PrldSessionProvider>.");
};

export interface PrldSessionContextValue extends PrldSessionState {
  startOTPLogin: (identifier: PrldIdentifier) => Promise<void>;
  checkOTP: (code: string) => Promise<void>;
  retryOTP: () => Promise<void>;
  refresh: () => Promise<void>;
  getUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const PrldSessionContext = createContext<PrldSessionContextValue>({
  ...initialSessionState,
  startOTPLogin: stub,
  checkOTP: stub,
  retryOTP: stub,
  refresh: stub,
  getUser: stub,
  logout: stub,
});
