import * as vg from '@uwdata/vgplot';
import { Viz } from '../Viz';

// From https://uwdata.github.io/mosaic/examples/mark-types.html

// By default, this viz uses local data.
// To use a MotherDuck share, first attach the mosaic_examples share by running the following:
// ATTACH 'md:_share/mosaic_examples/b01cfda8-239e-4148-a228-054b94cdc3b4';
// Then, set this to `true`.
const useShare = false;

const defaultAttributes = [
  vg.xAxis(null),
  vg.yAxis(null),
  vg.margins({ left: 5, top: 5, right: 5, bottom: 5 }),
  vg.width(160),
  vg.height(100),
  vg.yDomain([0, 9]),
];

export class MarkTypesViz implements Viz {
  async initialize() {
    if (useShare) {
      // Copy the necessary data from the remote mosaic_examples share to a local temp table to improve performance of subsequent queries.
      await vg
        .coordinator()
        .exec(
          'create temp table if not exists md as select * from mosaic_examples.main.md'
        );
    } else {
      // Create the necessary data in a local temp table from scratch.
      await vg.coordinator().exec(
        vg.loadObjects('md', [
          { i: 0, u: 'A', v: 2 },
          { i: 1, u: 'B', v: 8 },
          { i: 2, u: 'C', v: 3 },
          { i: 3, u: 'D', v: 7 },
          { i: 4, u: 'E', v: 5 },
          { i: 5, u: 'F', v: 4 },
          { i: 6, u: 'G', v: 6 },
          { i: 7, u: 'H', v: 1 },
        ])
      );
    }
  }

  render(): Element {
    return vg.vconcat(
      vg.hconcat(
        vg.plot(
          vg.barY(vg.from('md'), { x: 'u', y: 'v', fill: 'steelblue' }),
          ...defaultAttributes
        ),
        vg.plot(
          vg.lineY(vg.from('md'), {
            x: 'u',
            y: 'v',
            stroke: 'steelblue',
            curve: 'monotone-x',
            marker: 'circle',
          }),
          ...defaultAttributes
        ),
        vg.plot(
          vg.text(vg.from('md'), {
            x: 'u',
            y: 'v',
            text: 'u',
            fill: 'steelblue',
          }),
          ...defaultAttributes
        ),
        vg.plot(
          vg.tickY(vg.from('md'), { x: 'u', y: 'v', stroke: 'steelblue' }),
          ...defaultAttributes
        ),
        vg.plot(
          vg.areaY(vg.from('md'), { x: 'u', y: 'v', fill: 'steelblue' }),
          ...defaultAttributes
        )
      ),
      vg.hconcat(
        vg.plot(
          vg.dot(vg.from('md'), {
            x: 'i',
            y: 'v',
            fill: 'currentColor',
            r: 1.5,
          }),
          vg.regressionY(vg.from('md'), {
            x: 'i',
            y: 'v',
            stroke: 'steelblue',
          }),
          ...defaultAttributes,
          vg.xDomain([-0.5, 7.5])
        ),
        vg.plot(
          vg.hexgrid({ stroke: '#aaa', strokeOpacity: 0.5 }),
          vg.hexbin(vg.from('md'), { x: 'i', y: 'v', fill: vg.count() }),
          ...defaultAttributes,
          vg.colorScheme('blues'),
          vg.xDomain([-1, 8])
        ),
        vg.plot(
          vg.contour(vg.from('md'), {
            x: 'i',
            y: 'v',
            stroke: 'steelblue',
            bandwidth: 15,
          }),
          ...defaultAttributes,
          vg.xDomain([-1, 8])
        ),
        vg.plot(
          vg.raster(vg.from('md'), {
            x: 'i',
            y: 'v',
            fill: 'density',
            bandwidth: 15,
          }),
          ...defaultAttributes,
          vg.colorScheme('blues'),
          vg.xDomain([-1, 8])
        ),
        vg.plot(
          vg.denseLine(vg.from('md'), {
            x: 'i',
            y: 'v',
            fill: 'density',
            bandwidth: 2,
            binWidth: 1,
          }),
          ...defaultAttributes,
          vg.colorScheme('blues'),
          vg.xDomain([-1, 8])
        )
      )
    );
  }
}
