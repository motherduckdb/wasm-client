import * as vg from '@uwdata/vgplot';

export async function loadData() {
  await vg
    .coordinator()
    .exec(
      'create or replace table primes as select * from (values (1,2), (2,3), (3,5), (4,7)) t(i, p);'
    );
}

export function render() {
  return vg.plot(
    vg.barY(vg.from('primes'), { x: 'i', y: 'p', fill: 'steelblue' })
  );
}
