import { PrldUser } from "@prelude.so/js-sdk";

export interface PrldSessionState {
  user?: PrldUser;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: Error;
}

export const initialSessionState: PrldSessionState = {
  isAuthenticated: false,
  isLoading: true,
};
