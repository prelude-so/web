import { PrldIdentifier, PrldUser } from "@prelude.so/js-sdk";
import { createContext } from "react";
import { initialSessionState, PrldSessionState } from "./state";

const stub = (): never => {
  throw new Error("You forgot to wrap your component in <PrldSessionProvider>.");
};

export interface PrldSessionContextValue extends PrldSessionState {
  startOTPLogin: (identifier: PrldIdentifier) => Promise<void>;
  checkOTP: (code: string) => Promise<void>;
  retryOTP: () => Promise<void>;
  refresh: () => Promise<PrldUser | undefined>;
  logout: () => Promise<void>;
  invalidateCache: () => Promise<void>;
}

export const PrldSessionContext = createContext<PrldSessionContextValue>({
  ...initialSessionState,
  startOTPLogin: stub,
  checkOTP: stub,
  retryOTP: stub,
  refresh: stub,
  logout: stub,
  invalidateCache: stub,
});
