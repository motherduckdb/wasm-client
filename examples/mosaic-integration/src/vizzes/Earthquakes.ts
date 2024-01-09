import * as vg from '@uwdata/vgplot';
import * as topojson from 'topojson-client';
import { Viz } from '../Viz';

// Requires the MotherDuck sample_data database to be present.
// It is automatically shared to all new MotherDuck accounts, but if you've detached it you can get it back with the following:
// ATTACH 'md:_share/mosaic_examples/b01cfda8-239e-4148-a228-054b94cdc3b4';
// More details: https://motherduck.com/docs/sample-data-queries/attach-sample-database/

export class EarthquakeViz implements Viz {
  private land: any | null = null;
  async initialize() {
    // Materialize the data for the viz into a local temp table.
    await vg.coordinator().exec(
      "CREATE TEMP TABLE IF NOT EXISTS earthquakes_viz AS SELECT * FROM mosaic_examples.main.earthquakes"
    );
    const land = await fetch("https://raw.githubusercontent.com/uwdata/mosaic/1faee8bcd386f341df937dc161a0fbc67db29596/docs/public/data/countries-110m.json")
      .then(r => r.json())
      .then(json => topojson.feature(json, json.objects['land']).features);
    this.land = land;
    console.log(vg.from("countries_110m"));
  }

  render(): Element {
    const $longitude = vg.Param.value(-180);
    const $latitude = vg.Param.value(-30);
    const $rotate = vg.Param.array([$longitude, $latitude]);

    return vg.vconcat(
      vg.hconcat(
        vg.slider({ label: "Longitude", as: $longitude, min: -180, max: 180, step: 1 }),
        vg.slider({ label: "Latitude", as: $latitude, min: -90, max: 90, step: 1 })
      ),
      vg.plot(
        vg.geo(
          this.land,
          { fill: "currentColor", fillOpacity: 0.2 }
        ),
        vg.sphere(),
        vg.dot(
          vg.from("earthquakes_viz"),
          { x: "longitude", y: "latitude", r: vg.sql`POW(10, magnitude)`, stroke: "red", fill: "red", fillOpacity: 0.2 }
        ),
        vg.style("overflow: visible;"),
        vg.projectionType("orthographic"),
        vg.projectionRotate($rotate)
      )
    );
  }
}
