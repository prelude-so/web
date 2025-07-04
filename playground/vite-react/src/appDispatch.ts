import { dispatchSignals } from "@prelude.so/js-sdk/signals/slim";

export const appDispatch = async (sdkKey: string) => {
  return dispatchSignals(sdkKey);
};
