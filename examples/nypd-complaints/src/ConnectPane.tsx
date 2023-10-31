import { MDConnection } from "@motherduckdb/wasm-client";
import { Button, TextInput } from "@tremor/react";
import { useCallback, useState } from "react";
import "./ConnectPane.css";

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

  const handleConnectButtonClick = useCallback(() => {
    if (token) {
      connect(token);
    }
  }, [connect, token]);

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
          disabled={!(!connection && token)}
          onClick={handleConnectButtonClick}
        >
          Connect
        </Button>
      </div>
    </div>
  );
}
