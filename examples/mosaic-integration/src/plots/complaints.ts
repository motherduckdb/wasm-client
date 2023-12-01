import * as vg from '@uwdata/vgplot';

export async function loadData() {
  await vg
    .coordinator()
    .exec(
      `create or replace table complaints as 
      select year(created_date)::int as Year, count(*)::int as Complaints
      from sample_data.nyc.service_requests
      where Year < 2023
      and agency_name = 'New York City Police Department'
      group by 1
      order by 1;`
    );
}

export function render() {
  return vg.plot(
    vg.xTickFormat('d'),
    vg.yGrid(true),
    vg.yTickFormat('s'),
    vg.barY(
      vg.from('complaints'),
      { x: 'Year', y: 'Complaints', fill: 'steelblue' }
    )
  );
}
