declare module '@uwdata/vgplot' {
  // core

  interface Query {
    sql: string;
    type: 'exec' | 'arrow' | 'json';
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

  // sql

  class AggregateFunction {}

  function count(...args: unknown[]): AggregateFunction;

  function loadObjects(
    tableName: string,
    data: { [key: string]: unknown }[],
    options?: { replace?: boolean; temp?: boolean; view?: boolean }
  ): string;

  // vgplot

  class Plot {}

  type Directive = (plot: Plot) => void;

  function plot(...directives: Directive[]): Element;

  // attributes
  function colorScheme(value: string): Directive;
  function height(value: number): Directive;
  function margins(value: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  }): Directive;
  function marginLeft(value: number): Directive;
  function width(value: number): Directive;
  
  function xAxis(value: 'top' | 'bottom' | null): Directive;
  function xDomain(value: [number, number]): Directive;
  function xGrid(value: boolean): Directive;
  function xTickFormat(value: string): Directive;

  function yAxis(value: 'left' | 'right' | null): Directive;
  function yDomain(value: [number, number]): Directive;
  function yGrid(value: boolean): Directive;
  function yTickFormat(value: string): Directive;

  // data
  function from(table: unknown, options?: unknown): unknown;

  // marks
  function areaY(...args: unknown[]): Directive;
  function barY(...args: unknown[]): Directive;
  function contour(...args: unknown[]): Directive;
  function denseLine(...args: unknown[]): Directive;
  function dot(...args: unknown[]): Directive;
  function hexbin(...args: unknown[]): Directive;
  function hexgrid(...args: unknown[]): Directive;
  function lineY(...args: unknown[]): Directive;
  function raster(...args: unknown[]): Directive;
  function regressionY(...args: unknown[]): Directive;
  function text(...args: unknown[]): Directive;
  function tickY(...args: unknown[]): Directive;

  // layout
  function hconcat(...elements: Element[]): Element;
  function vconcat(...elements: Element[]): Element;
}
