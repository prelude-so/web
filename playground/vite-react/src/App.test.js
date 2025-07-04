import { describe, expect, test } from "vitest";
import { appDispatch } from "./appDispatch";

describe("appDispatch", () => {
  test("with SDK key", async () => {
    await expect(appDispatch(import.meta.env.VITE_PRELUDE_SDK_KEY)).resolves.toBeTruthy();
  });
  test("without SDK key", async () => {
    await expect(appDispatch()).rejects.toThrow("Unauthorized");
  });
});
