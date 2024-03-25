import { MDConnection } from "@motherduck/wasm-client";
import { Button, TextInput } from "@tremor/react";
import { useCallback, useEffect, useState } from "react";
import "./ConnectPane.css";

// TODO: use https://app.motherduck.com
const motherDuckUrl = 'http://localhost:8080';

const appName = 'WASM Client Library Example: NYPD Complaints';

export function ConnectPane({
  connection,
  connect,
}: {
  connection: MDConnection | null;
  connect: (token: string) => void;
}) {
  const [token, setToken] = useState<string | null>(null);

  const handleTokenInputChange = useCallback((value: string) => {
    setToken(value);
  }, []);

  const handleGetTokenButtonClick = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('paste', 'y');
    window.location.href = `${motherDuckUrl}/token-request?appName=${encodeURIComponent(appName)}&returnTo=${encodeURIComponent(url.toString())}`;
  }, []);

  const handleConnectButtonClick = useCallback(() => {
    if (token) {
      connect(token);
    }
  }, [connect, token]);

  useEffect(() => {
    async function attemptConnect() {
      const url = new URL(window.location.href);
      if (url.searchParams.get('paste')) {
        url.searchParams.delete('paste');
        history.pushState({}, '', url);
        // This only works in Chrome. User has to manually paste in other browsers (Firefox, Safari).
        const token = await navigator.clipboard.readText();
        if (token) {
          connect(token);
        }
      }
    }
    attemptConnect();
  }, [connect]);

  return (
    <div id="connect-pane" className="pt-32">
      <div id="token-input-row">
        <TextInput
          type="password"
          autoComplete="off"
          placeholder="Paste MotherDuck Service Token Here"
          onValueChange={handleTokenInputChange}
        />
      </div>
      <div id="connect-button-row">
        <Button
          onClick={handleGetTokenButtonClick}
        >
          Get Token
        </Button>
        <Button
          disabled={!(!connection && token)}
          onClick={handleConnectButtonClick}
          style={{ marginLeft: 8 }}
        >
          Connect
        </Button>
      </div>
    </div>
  );
}
