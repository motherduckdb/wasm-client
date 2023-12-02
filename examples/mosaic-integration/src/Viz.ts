export interface Viz {
  initialize(): Promise<void>;
  render(): Element;
}
