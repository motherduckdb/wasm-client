import "./App.css";
import { ChartsPane } from "./ChartsPane";
import { ConnectPane } from "./ConnectPane";
import { Header } from "./Header";
import { useMDConnection } from "./useMDConnection";

export function App() {
  const { connection, connect } = useMDConnection();

  return (
    <>
      <Header />
      <div id="content-pane">
        {!connection ? (
          <ConnectPane connection={connection} connect={connect} />
        ) : (
          <ChartsPane connection={connection} />
        )}
      </div>
    </>
  );
}
