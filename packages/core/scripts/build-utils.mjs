import { parseArgs } from "node:util";

export const parseBuildArgs = () => {
  const { values } = parseArgs({
    options: {
      mode: {
        type: "string",
      },
    },
  });
  return values;
};
