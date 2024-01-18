import { MDConnection } from "@motherduckdb/wasm-client";
import { useCallback, useState } from "react";

export function useMDConnection() {
  const [connection, setConnection] = useState<MDConnection | null>(null);
  const connect = useCallback(
    (token: string) => {
      if (!connection) {
        let startTime = new Date();
        console.log(startTime.toISOString(),'CONNECTION STARTING');
        const createdConnection = MDConnection.create({
          mdToken: token,
          mdServerURL: 'https://api.staging.motherduck.com',
        });
        setConnection(
          createdConnection
        );
        createdConnection.isInitialized().then(() => {
          let endTime = new Date();
          let timeDelta = (endTime - startTime) / 1000;
          console.log(endTime.toISOString(),'CONNECTION COMPLETED', timeDelta, 'seconds');
        })
      } else {
        console.warn("Already connected!");
      }
    },
    [connection]
  );
  return { connection, connect };
}
