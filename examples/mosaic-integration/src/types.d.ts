declare module '@uwdata/vgplot' {
  // core

  interface Query {
    sql: string;
    type: 'exec' | 'arrow' | 'json';
  }


  class AsyncDispatch {
    addEventListener(type: unknown, callback: (...args: unknown[]) => unknown);
  }

  class Param extends AsyncDispatch {
    static value(value): Param;
    static array(value: any[]): any;
  }

  class Selection extends Param {
    static crossfilter(): Selection;
    static single(): Selection;
    static intersect(): Selection;
    value: unknown;
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

  // inputs

  interface TableOptions {
    from: string; // Other types possible
    filterBy: Selection;
    format: { [column: string]: unknown };
    width: number | { [column: string]: number };
    height: number;
  }

  function table(options: TableOptions): Element

  // vgplot

  const Fixed: symbol;

  class Plot {}

  type Directive = (plot: Plot) => void;

  function plot(...directives: Directive[]): Element;

  // attributes
  function colorLegend(...args: unknown[]): Directive;
  function colorDomain(...args: unknown[]): Directive;
  function colorRange(...args: unknown[]): Directive;
  function colorScheme(value: string): Directive;
  function colorScale(value: Param): Directive;

  function height(value: number): Directive;
  function margins(value: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  }): Directive;
  function margin(value: number): Directive;
  function marginLeft(value: number): Directive;
  function marginTop(value: number): Directive;
  function marginBottom(value: number): Directive;
  function marginRight(value: number): Directive;
  function width(value: number): Directive;
  
  function xAxis(value: 'top' | 'bottom' | null): Directive;
  function xDomain(value: [number, number] | symbol): Directive;
  function xGrid(value: boolean): Directive;
  function xTickFormat(value: string): Directive;
  function xLabel(value: string): Directive;

  function yAxis(value: 'left' | 'right' | null): Directive;
  function yDomain(value: [number, number] | symbol): Directive;
  function rDomain(...args: unknown[]): Directive;
  function yGrid(value: boolean): Directive;
  function yTickFormat(value: string): Directive;
  function yScale(value: Param): Directive;
  function yReverse(value: boolean): Directive;
  function rRange(...args: unknown[]): Directive;

  // data
  function dateMonthDay(string): unknown;
  function from(table: unknown, options?: unknown): JSONResponse;
  function loadParquet(tableName: string, fileName: string, options?: unknown): string;
  function sql(table: unknown, options?: unknown): unknown;

  // interactors
  function highlight(...args: unknown[]): Directive;
  function intervalX(...args: unknown[]): Directive;
  function intervalXY(...args: unknown[]): Directive;
  function toggleX(...args: unknown[]): Directive;
  function xyDomain(...args: unknown[]): Directive;

  // marks
  function areaY(...args: unknown[]): Directive;
  function barX(...args: unknown[]): Directive;
  function barY(...args: unknown[]): Directive;
  function contour(...args: unknown[]): Directive;
  function denseLine(...args: unknown[]): Directive;
  function dot(...args: unknown[]): Directive;
  function geo(...args: unknown[]): Directive;
  function hexbin(...args: unknown[]): Directive;
  function hexgrid(...args: unknown[]): Directive;
  function lineY(...args: unknown[]): Directive;
  function raster(...args: unknown[]): Directive;
  function rect(...args: unknown[]): Directive;
  function rectX(...args: unknown[]): Directive;
  function rectY(...args: unknown[]): Directive;
  function regressionY(...args: unknown[]): Directive;
  function sphere(...args: unknown[]): Directive;
  function style(...args: unknown[]): Directive;
  function text(...args: unknown[]): Directive;
  function tickY(...args: unknown[]): Directive;
  function toggleY(...args: unknown[]): Directive;
  function projectionRotate(...args: unknown[]): Directive;
  function projectionType(...args: unknown[]): Directive;
  function yLabel(...args: unknown[]): Directive;

  // layout
  function hconcat(...elements: Element[]): Element;
  function vconcat(...elements: Element[]): Element;
  function hspace(...args: unknown): Element;
  function vspace(...args: unknown): Element;
  function slider(...args: unknown[]): Element;
  
  // transforms
  function bin(field: string): unknown
}
