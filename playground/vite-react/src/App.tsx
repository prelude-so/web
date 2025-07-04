import { dispatchSignals } from "@prelude.so/js-sdk/signals/slim";
import { useState } from "react";
import { createRoot } from "react-dom/client";

function App() {
  const [dispatchId, setDispatchId] = useState<string>("");
  const handleDIspatch = async () => {
    if (import.meta.env.VITE_PRELUDE_SDK_KEY) {
      const newDispatchId = await dispatchSignals(import.meta.env.VITE_PRELUDE_SDK_KEY);
      setDispatchId(newDispatchId);
    }
  };

  return (
    <div>
      <h1>{`Prelude's web SDK Playground`}</h1>
      <button type="button" onClick={handleDIspatch}>
        Dispatch signals
      </button>
      <pre>{dispatchId}</pre>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById("root")!).render(<App />);
