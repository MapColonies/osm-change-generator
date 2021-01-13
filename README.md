# osm-change-generator

This package contains the logic to create osm changes from geojson, and previous version of the entity.

## installation
```sh
npm install --save-dev @map-colonies/osm-change-generator
```
## usage
call the request function based on the feature you want to create change from

for example, creating a change from new point:
```typescript
import { getChangeFromPoint } from '@map-colonies/osm-change-generator';

const point: OsmPoint = { geometry: { type: 'Point', coordinates: [18, 17] }, type: 'Feature', properties: { dog: 'meow' } };

const change = getChangeFromPoint({ action: Actions.CREATE, feature: point });

console.log(change)
