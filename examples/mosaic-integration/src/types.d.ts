declare module "@uwdata/vgplot" {
  // core

  interface Query {
    sql: string;
    type: "exec" | "arrow" | "json";
  }

  interface Connector {
    query(query: Query): Promise<unknown>;
  }

  class Coordinator {
    databaseConnector(connector: Connector): Connector;
    exec(query: string): Promise<void>;
  }

  function coordinator(instance?: Coordinator): Coordinator;

  interface WASMConnectorOptions {
    log?: boolean;
  }

  function wasmConnector(options?: WASMConnectorOptions): Promise<Connector>;

  // vgplot

  class Plot {}

  type Directive = (plot: Plot) => void;

  function from(table: unknown, options?: unknown): unknown;

  function barY(...args: unknown[]): Directive;

  function plot(...directives: Directive[]): Element;
}
