import { MDConnection } from "@motherduckdb/wasm-client";
import { useCallback, useState } from "react";

export function useMDConnection() {
  const [connection, setConnection] = useState<MDConnection | null>(null);
  const connect = useCallback(
    (token: string) => {
      if (!connection) {
        setConnection(
          MDConnection.create({
            mdToken: token,
          })
        );
      } else {
        console.warn("Already connected!");
      }
    },
    [connection]
  );
  return { connection, connect };
}
