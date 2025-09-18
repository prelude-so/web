import { dispatchSignals } from "@prelude.so/js-sdk/signals/slim";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { preStyle, Session } from "@prelude.so/react-components";

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
      <h2>Signals</h2>
      {import.meta.env.VITE_PRELUDE_SDK_KEY ?
        <>
          <button type="button" onClick={handleDIspatch}>
            Dispatch
          </button>
          {dispatchId && <pre style={preStyle}>{dispatchId}</pre>}
        </>
      : <p>You need to set VITE_PRELUDE_SDK_KEY to dispatch signals.</p>}
      <h2>Session</h2>
      {import.meta.env.VITE_PRELUDE_SESSION_DOMAIN ?
        <Session
          options={{
            domain: import.meta.env.VITE_PRELUDE_SESSION_DOMAIN,
            sdkKey: import.meta.env.VITE_PRELUDE_SDK_KEY,
          }}
        />
      : <p>You need to set VITE_PRELUDE_SESSION_DOMAIN to use the session SDK.</p>}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById("root")!).render(<App />);
