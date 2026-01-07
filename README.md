# osm-change-generator

This package contains the logic to create osm changes from geojson, and previous version of the entity.

## installation
```sh
npm install --save @map-colonies/osm-change-generator
```
## usage
call the request function based on the feature you want to create change from

## options
the following options are available with every getChange call:
- shouldHandleLOD2 - boolean flag determening the handling of lod2 tags enrichment
- shouldHandlePrecision - boolean flag determening the handling of precision tags enrichment
- maxTagKeyLength - the maximum length of a tag's key. if the key exceeds the maximum value, the tag will be ignored
- maxTagValueLength - the maximum length of a tag's value. if the value exceeds the maximum value, the tag will be ignored

### create
```typescript
import { getChangeFromPoint } from '@map-colonies/osm-change-generator';

const point = { geometry: { type: 'Point', coordinates: [18, 17] }, type: 'Feature', properties: { dog: 'meow' } };

const change = getChangeFromPoint({ action: Actions.CREATE, feature: point });

console.log(change)
```
result:
```json
{
  "type": "osmchange",
  "generator": "osm_change_generator",
  "version": "0.6",
  "create": [
    {
      "id": -1,
      "lon": 18,
      "lat": 17,
      "version": 0,
      "type": "node",
      "tags": { "dog": "meow" }
    }
  ],
  "modify": [],
  "delete": []
}
```
3d point:
```typescript
const 3dPoint = { geometry: { type: 'Point', coordinates: [18, 17, 6.66] }, type: 'Feature', properties: { dog: 'meow' } };

const change = getChangeFromPoint({ action: Actions.CREATE, feature: point, { shouldHandleLOD2: true }});

console.log(change)
```
result:
```json
{
  "type": "osmchange",
  "generator": "osm_change_generator",
  "version": "0.6",
  "create": [
    {
      "id": -1,
      "lon": 18,
      "lat": 17,
      "version": 0,
      "type": "node",
      "tags": { "dog": "meow", "altitude": "6.66" }
    }
  ],
  "modify": [],
  "delete": []
}
```
tag filtering
```typescript
import { getChangeFromPoint } from '@map-colonies/osm-change-generator';

const point = { geometry: { type: 'Point', coordinates: [18, 17] }, type: 'Feature', properties: { key1: 'val', longKey: 'val', key2: 'longValue' } };

const change = getChangeFromPoint({ action: Actions.CREATE, feature: point, options: { maxTagKeyLength: 5, maxTagValueLength: 5 } });

console.log(change)
```
result:
```json
{
  "type": "osmchange",
  "generator": "osm_change_generator",
  "version": "0.6",
  "create": [
    {
      "id": -1,
      "lon": 18,
      "lat": 17,
      "version": 0,
      "type": "node",
      "tags": { "key1": "val" } // longKey and longValue were filtered due to length
    }
  ],
  "modify": [],
  "delete": []
}
```
### modify
```typescript
import { getChangeFromLine } from '@map-colonies/osm-change-generator';

const line = {
  geometry: {
    type: 'LineString',
    coordinates: [
      [16, 16],
      [17, 17],
      [18, 18],
      [19, 19],
    ],
  },
  type: 'Feature',
  properties: { dog: 'meow' },
};

const oldWay: OsmWay = {
  id: 1,
  nodes: [
    { id: 2, lat: 16, lon: 16, type: 'node', version: 1 },
    { id: 3, lat: 18, lon: 18, type: 'node', version: 2 },
    { id: 4, lat: 17, lon: 17, type: 'node', version: 1 },
  ],
  type: 'way',
  tags: { cat: 'bark' },
  version: 3,
};

const change = getChangeFromLine({ action: Actions.MODIFY, feature: line, oldElement: oldWay });

console.log(change);
```
result:
```json
{
  "type": "osmchange",
  "generator": "osm_change_generator",
  "version": "0.6",
  "create": [
    { "id": -1, "lon": 19, "lat": 19, "version": 0, "type": "node", "tags": {} }
  ],
  "modify": [
    {
      "id": 1,
      "nodes": [
        {
          "id": 2,
          "lon": 16,
          "lat": 16,
          "version": 1,
          "type": "node",
          "tags": {}
        },
        {
          "id": 4,
          "lon": 17,
          "lat": 17,
          "version": 1,
          "type": "node",
          "tags": {}
        },
        {
          "id": 3,
          "lon": 18,
          "lat": 18,
          "version": 2,
          "type": "node",
          "tags": {}
        },
        {
          "id": -1,
          "lon": 19,
          "lat": 19,
          "version": 0,
          "type": "node",
          "tags": {}
        }
      ],
      "type": "way",
      "version": 3,
      "tags": { "dog": "meow" }
    }
  ],
  "delete": []
}
```
3d modify:
```typescript
const line = {
  geometry: {
    type: 'LineString',
    coordinates: [
      [16, 16, 1],
      [17, 17],
      [18, 18, 3],
      [19, 19, 4],
    ],
  },
  type: 'Feature',
  properties: { dog: 'meow' },
};

const oldWay: OsmWay = {
  id: 1,
  nodes: [
    { id: 2, lat: 16, lon: 16, type: 'node', version: 1 },
    { id: 3, lat: 18, lon: 18, type: 'node', version: 2, tags: { altitude: '10' } },
    { id: 4, lat: 17, lon: 17, type: 'node', version: 1, tags: { altitude: '10' } },
  ],
  type: 'way',
  tags: { cat: 'bark' },
  version: 3,
};

const change = getChangeFromLine({ action: Actions.MODIFY, feature: line, oldElement: oldWay, { shouldHandleLOD2: true } });

console.log(change);
```
result:
```json
{
  "type": "osmchange",
  "generator": "osm_change_generator",
  "version": "0.6",
  "create": [
    { "id": -1, "lon": 19, "lat": 19, "version": 0, "type": "node", "tags": {} }
  ],
  "modify": [
    {
      "id": 1,
      "nodes": [
        {
          "id": 2,
          "lon": 16,
          "lat": 16,
          "version": 1,
          "type": "node",
          "tags": { "altitude": "1" }
        },
        {
          "id": 4,
          "lon": 17,
          "lat": 17,
          "version": 1,
          "type": "node",
          "tags": {}
        },
        {
          "id": 3,
          "lon": 18,
          "lat": 18,
          "version": 2,
          "type": "node",
          "tags": { "altitude": "3" }
        },
        {
          "id": -1,
          "lon": 19,
          "lat": 19,
          "version": 0,
          "type": "node",
          "tags": { "altitude": "4" }
        }
      ],
      "type": "way",
      "version": 3,
      "tags": { "dog": "meow" }
    }
  ],
  "delete": []
}
```
### delete
```typescript
import { getChangeFromPolygon } from '@map-colonies/osm-change-generator';

const oldWay: OsmWay = {
  id: 1,
  nodes: [
    { id: 2, lat: 16, lon: 16, type: 'node', version: 1 },
    { id: 3, lat: 17, lon: 17, type: 'node', version: 2 },
    { id: 4, lat: 18, lon: 18, type: 'node', version: 1 },
    { id: 2, lat: 16, lon: 16, type: 'node', version: 1 }
  ],
  type: 'way',
  tags: { cat: 'bark' },
  version: 3,
};

const change = getChangeFromPolygon({ action: Actions.DELETE, oldElement: oldWay });

console.log(change);
```
result:
```json
{
  "type": "osmchange",
  "generator": "osm_change_generator",
  "version": "0.6",
  "create": [],
  "modify": [],
  "delete": [
    {
      "id": 1,
      "nodes": [
        { "id": 2, "lat": 16, "lon": 16, "type": "node", "version": 1 },
        { "id": 3, "lat": 17, "lon": 17, "type": "node", "version": 2 },
        { "id": 4, "lat": 18, "lon": 18, "type": "node", "version": 1 },
        { "id": 2, "lat": 16, "lon": 16, "type": "node", "version": 1 }
      ],
      "type": "way",
      "tags": { "cat": "bark" },
      "version": 3
    },
    { "id": 2, "lat": 16, "lon": 16, "type": "node", "version": 1 },
    { "id": 3, "lat": 17, "lon": 17, "type": "node", "version": 2 },
    { "id": 4, "lat": 18, "lon": 18, "type": "node", "version": 1 }
  ]
}
```
