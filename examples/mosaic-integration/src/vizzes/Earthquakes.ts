import * as vg from '@uwdata/vgplot';
import * as topojson from 'topojson-client';
import { Viz } from '../Viz';
import countries from '../assets/countries-110m.json?url';

// Depends on the mosaic_examples share. Attach this by running the following:
// ATTACH 'md:_share/mosaic_examples/b01cfda8-239e-4148-a228-054b94cdc3b4';

export class EarthquakeViz implements Viz {
  private land: unknown | null = null;
  async initialize() {
    this.land = await fetch(countries)
      .then((r) => r.json())
      .then((json: Parameters<typeof topojson.feature>[0]) => {
        if (json.objects['land'].type !== 'GeometryCollection') {
          throw Error('unexpected geojson type');
        }
        return topojson.feature(json, json.objects['land']).features;
      });
  }

  render(): Element {
    const $longitude = vg.Param.value(-180);
    const $latitude = vg.Param.value(-30);
    const $rotate = vg.Param.array([$longitude, $latitude]);

    return vg.vconcat(
      vg.hconcat(
        vg.slider({
          label: 'Longitude',
          as: $longitude,
          min: -180,
          max: 180,
          step: 1,
        }),
        vg.slider({
          label: 'Latitude',
          as: $latitude,
          min: -90,
          max: 90,
          step: 1,
        })
      ),
      vg.plot(
        vg.geo(this.land, { fill: 'currentColor', fillOpacity: 0.2 }),
        vg.sphere(),
        vg.dot(vg.from('mosaic_examples.main.earthquakes'), {
          x: 'longitude',
          y: 'latitude',
          r: vg.sql`POW(10, magnitude)`,
          stroke: 'red',
          fill: 'red',
          fillOpacity: 0.2,
        }),
        vg.style('overflow: visible;'),
        vg.projectionType('orthographic'),
        vg.projectionRotate($rotate)
      )
    );
  }
}
