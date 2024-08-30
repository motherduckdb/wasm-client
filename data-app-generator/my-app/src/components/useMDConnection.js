import { MDConnection } from "@motherduck/wasm-client";
import { useCallback, useState } from "react";

export function useMDConnection() {
    const [connection, setConnection] = useState(null);
    const connect = useCallback(() => {
        if (!connection) {
            setConnection(
                MDConnection.create({
                    mdToken: import.meta.env.VITE_MOTHERDUCK_TOKEN,
                })
            );
        } else {
            console.warn("Connection to MotherDuck exists!");
        }
    }, [connection]);
    return { connection, connect };
}