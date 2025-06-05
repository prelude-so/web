import {
  PrldIdentifier,
  PrldSessionClient,
  PrldSessionClientOptions,
  PrldUser,
  UnauthorizedError,
} from "@prelude.so/js-sdk";
import { ReactNode, useCallback, useEffect, useReducer, useRef, useState } from "react";

import { PrldSessionContext } from "./context";
import { reducer } from "./reducer";
import { initialSessionState } from "./state";

interface PrldSessionProviderProps {
  children: ReactNode;
  clientOptions: PrldSessionClientOptions;
}

export const PrldSessionProvider = ({ children, clientOptions }: PrldSessionProviderProps) => {
  const [client] = useState<PrldSessionClient>(() => new PrldSessionClient(clientOptions));

  const [state, dispatch] = useReducer(reducer, initialSessionState);
  const didInitialise = useRef(false);

  useEffect(() => {
    if (didInitialise.current) {
      return;
    }
    didInitialise.current = true;

    const initialRefresh = async () => {
      try {
        await client.refresh();
      } catch (error) {
        // Do not throw on initial refresh when user is not logged in
        if (error instanceof UnauthorizedError) {
          return;
        }
        throw error;
      }
    };

    initialRefresh();
  }, [client]);

  const startOTPLogin = useCallback(
    async (identifier: PrldIdentifier) => {
      try {
        dispatch({ type: "START_OTP_LOGIN" });
        await client.startOTPLogin({ identifier });
      } catch (error) {
        let e: Error;
        if (error instanceof Error) {
          e = error;
        } else {
          e = new Error("Start OTP Login error");
        }
        dispatch({ type: "ERROR", error: e });
        throw e;
      }
    },
    [client],
  );

  const checkOTP = useCallback(
    async (code: string) => {
      try {
        await client.checkOTP(code);
        dispatch({ type: "OTP_CHECK_COMPLETE" });
      } catch (error) {
        let e: Error;
        if (error instanceof Error) {
          e = error;
        } else {
          e = new Error("Check OTP error");
        }
        dispatch({ type: "ERROR", error: e });
        throw e;
      }
    },
    [client],
  );

  const retryOTP = useCallback(async () => {
    try {
      dispatch({ type: "RETRY_OTP" });
      await client.retryOTP();
    } catch (error) {
      let e: Error;
      if (error instanceof Error) {
        e = error;
      } else {
        e = new Error("Retry OTP error");
      }
      dispatch({ type: "ERROR", error: e });
      throw e;
    }
  }, [client]);

  const refresh: () => Promise<PrldUser | undefined> = useCallback(async () => {
    try {
      const { user } = await client.refresh();
      dispatch({ type: "REFRESH_COMPLETE", user });
      return user;
    } catch (error) {
      let e: Error;
      if (error instanceof Error) {
        e = error;
      } else {
        e = new Error("Refresh error");
      }
      dispatch({ type: "ERROR", error: e });
      throw e;
    }
  }, [client]);

  const logout = useCallback(async () => {
    try {
      await client.logout();
      dispatch({ type: "LOGOUT_COMPLETE" });
    } catch (error) {
      let e: Error;
      if (error instanceof Error) {
        e = error;
      } else {
        e = new Error("Logout error");
      }
      dispatch({ type: "ERROR", error: e });
      throw e;
    }
  }, [client]);

  return (
    <PrldSessionContext.Provider
      value={{
        ...state,
        startOTPLogin,
        checkOTP,
        retryOTP,
        refresh,
        logout,
      }}
    >
      {children}
    </PrldSessionContext.Provider>
  );
};
