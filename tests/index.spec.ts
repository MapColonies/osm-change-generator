import { BaseElement, OsmNode, OsmWay } from '@map-colonies/node-osm-elements';
import { getChangeFromLine, getChangeFromPoint, getChangeFromPolygon } from '../src';
import { Actions, FlattenedGeoJSONLine, FlattenedGeoJSONPoint, FlattenedGeoJSONPolygon } from '../src/models';

describe('index', function () {
  describe('#getChangeFromPoint', function () {
    it('should add a node to the create part of the change', function () {
      const point: FlattenedGeoJSONPoint = { geometry: { type: 'Point', coordinates: [18, 17] }, type: 'Feature', properties: { dog: 'meow' } };
      const expectedNode = { type: 'node', lon: point.geometry.coordinates[0], lat: point.geometry.coordinates[1], tags: { dog: 'meow' } };

      const change = getChangeFromPoint({ action: Actions.CREATE, feature: point, generatorValue: 'test' });

      expect(change).toHaveChangeActionLengths(1, 0, 0);
      expect(change).toHaveProperty('generator', 'test');
      const node = (change.create as BaseElement[])[0];
      expect(node.id).toBeLessThan(0);
      expect(node).toMatchObject(expectedNode);
    });

    it('should add a node to the modify part of the change', function () {
      const point: FlattenedGeoJSONPoint = { geometry: { type: 'Point', coordinates: [18, 17] }, type: 'Feature', properties: { dog: 'meow' } };
      const oldNode: OsmNode = { id: 1, lat: 20, lon: 21, type: 'node', tags: { cat: 'bark' }, version: 2 };
      const expectedNode = {
        type: 'node',
        id: oldNode.id,
        version: oldNode.version,
        lon: point.geometry.coordinates[0],
        lat: point.geometry.coordinates[1],
        tags: { dog: 'meow' },
      };

      const change = getChangeFromPoint({ action: Actions.MODIFY, feature: point, oldElement: oldNode });

      expect(change).toHaveChangeActionLengths(0, 1, 0);
      const node = (change.modify as BaseElement[])[0];
      expect((node.tags as Record<string, string>)['cat']).toBeUndefined();
      expect(node).toMatchObject(expectedNode);
    });

    it('should add a node to the delete part of the chagne', function () {
      const node: OsmNode = { id: 1, lat: 20, lon: 21, type: 'node', tags: { cat: 'bark' }, version: 2 };

      const change = getChangeFromPoint({ action: Actions.DELETE, oldElement: node });

      expect(change).toHaveChangeActionLengths(0, 0, 1);
      const deletedNode = (change.delete as BaseElement[])[0];
      expect(deletedNode.type).toBe('node');
      expect(deletedNode).toMatchObject(node);
    });
  });

  describe('#getChangeFromLine', function () {
    it('should create a way with all its points', function () {
      const line: FlattenedGeoJSONLine = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [35.200434, 31.7697903],
            [35.3002677, 31.7696671],
            [35.200611, 31.7694414],
          ],
        },
      };

      const change = getChangeFromLine({ action: Actions.CREATE, feature: line, generatorValue: 'test' });

      expect(change).toHaveChangeActionLengths(line.geometry.coordinates.length + 1, 0, 0);
      expect(change).toHaveProperty('generator', 'test');

      const way = change.create?.find((elm) => elm.type === 'way') as OsmWay;
      expect(way).toBeDefined();
      expect(way).toHaveProperty('version', 0);
      expect(way).toHaveProperty('tags.dog', 'meow');

      const idSet = new Set<number>([way.id]);
      expect(way.nodes).toMatchPositionOrder(line.geometry.coordinates);

      // checks that each id is unique, and a matching node is created for it.
      line.geometry.coordinates.forEach(([lon, lat], index) => {
        const nodeInWay = way.nodes[index];
        expect(idSet).not.toContain(nodeInWay.id);
        idSet.add(nodeInWay.id);

        const createdNode = change.create?.find((elm) => elm.id === nodeInWay.id);
        expect(createdNode).toBeDefined();
        expect(createdNode).toMatchObject({ lon, lat, id: nodeInWay.id });
        expect(createdNode).toHaveProperty('version', 0);
      });
    });

    it('should create a way, and the unique nodes, if line is closed', function () {
      const line: FlattenedGeoJSONLine = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [35.200434, 31.7697903],
            [35.3002677, 31.7696671],
            [35.200611, 31.7694414],
            [35.200434, 31.7697903],
          ],
        },
      };
      const change = getChangeFromLine({ action: Actions.CREATE, feature: line });

      expect(change.create).toHaveLength(line.geometry.coordinates.length);

      const way = change.create?.find((elm) => elm.type === 'way') as OsmWay;

      //check that the first point in the line appears twice, so its a closed way
      const firstPointCount = change.create?.filter((elm) => {
        if (elm.type === 'node') {
          const node = elm as OsmNode;
          return node.lon === line.geometry.coordinates[0][0] && node.lat === line.geometry.coordinates[0][1];
        }
        return false;
      }).length;

      expect(firstPointCount).toBe(1);

      line.geometry.coordinates.forEach(([lon, lat], index) => {
        const nodeInWay = way.nodes[index];
        expect(nodeInWay).toMatchObject({ lon, lat });
      });
    });

    it('should delete the way and all the nodes', function () {
      const wayToDelete: OsmWay = {
        id: 1,
        version: 2,
        type: 'way',
        nodes: [
          { id: 2, lat: 34, lon: 35, version: 2, type: 'node' },
          { id: 3, lat: 35, lon: 36, version: 1, type: 'node' },
        ],
      };

      const change = getChangeFromLine({ action: Actions.DELETE, oldElement: wayToDelete });

      wayToDelete.nodes.forEach((node) => {
        const deletedNodes = change.delete?.filter((elm) => elm.id === node.id) as BaseElement[];
        expect(deletedNodes).toHaveLength(1);
        expect(deletedNodes[0]).toHaveProperty('version', node.version);
      });

      const way = change.delete?.find((elm) => elm.type === 'way') as OsmWay;
      expect(way).toMatchObject({ id: wayToDelete.id, version: wayToDelete.version });
      expect(change.delete).toMatchObject(expect.arrayContaining(wayToDelete.nodes));
    });

    it('should only modify the way tags if only tags were changed', function () {
      const line: FlattenedGeoJSONLine = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [35, 34],
            [36, 35],
          ],
        },
      };
      const oldWay: OsmWay = {
        id: 1,
        version: 2,
        tags: { cat: 'bark' },
        type: 'way',
        nodes: [
          { id: 2, lat: 34, lon: 35, version: 2, type: 'node' },
          { id: 3, lat: 35, lon: 36, version: 1, type: 'node' },
        ],
      };

      const change = getChangeFromLine({ action: Actions.MODIFY, oldElement: oldWay, feature: line });

      expect(change).toHaveChangeActionLengths(0, 1, 0);
      const way = (change.modify as OsmWay[])[0];

      expect(way).toHaveProperty('tags.dog', 'meow');
      expect(way).not.toHaveProperty('tags.cat', 'bark');
    });

    it('should only change the order of the nodes', function () {
      const line: FlattenedGeoJSONLine = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [36, 35],
            [35, 34],
          ],
        },
      };
      const oldWay: OsmWay = {
        id: 1,
        version: 2,
        tags: { cat: 'bark' },
        type: 'way',
        nodes: [
          { id: 2, lat: 34, lon: 35, version: 2, type: 'node' },
          { id: 3, lat: 35, lon: 36, version: 1, type: 'node' },
        ],
      };

      const change = getChangeFromLine({ action: Actions.MODIFY, oldElement: oldWay, feature: line });

      expect(change).toHaveChangeActionLengths(0, 1, 0);
      const way = (change.modify as OsmWay[])[0];

      expect(way.nodes).toMatchPositionOrder(line.geometry.coordinates);
    });

    it('should add a new node and modify the way', function () {
      const line: FlattenedGeoJSONLine = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [37, 36],
            [36, 35],
            [35, 34],
          ],
        },
      };
      const oldWay: OsmWay = {
        id: 1,
        version: 2,
        tags: { dog: 'meow' },
        type: 'way',
        nodes: [
          { id: 2, lat: 34, lon: 35, version: 2, type: 'node' },
          { id: 3, lat: 35, lon: 36, version: 1, type: 'node' },
        ],
      };

      const change = getChangeFromLine({ action: Actions.MODIFY, oldElement: oldWay, feature: line });

      expect(change).toHaveChangeActionLengths(1, 1, 0);
      const way = (change.modify as OsmWay[])[0];
      const node = (change.create as OsmNode[])[0];

      expect(way.nodes).toMatchPositionOrder(line.geometry.coordinates);
      expect(node).toMatchObject({ lon: 37, lat: 36, id: way.nodes[0].id, version: 0 });
      expect(node.id).toBeLessThanOrEqual(0);
    });

    it('should modify an existing node when a point in line is changed', function () {
      const line: FlattenedGeoJSONLine = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [37, 35],
            [35, 34],
          ],
        },
      };
      const oldWay: OsmWay = {
        id: 1,
        version: 2,
        tags: { dog: 'meow' },
        type: 'way',
        nodes: [
          { id: 2, lat: 32, lon: 32, version: 2, type: 'node' },
          { id: 3, lat: 34, lon: 35, version: 1, type: 'node' },
        ],
      };

      const change = getChangeFromLine({ action: Actions.MODIFY, oldElement: oldWay, feature: line });

      expect(change).toHaveChangeActionLengths(0, 2, 0);
      const way = change.modify?.find((elm) => elm.type === 'way') as OsmWay;
      const node = change.modify?.find((elm) => elm.type === 'node') as OsmNode;

      expect(way.nodes).toMatchPositionOrder(line.geometry.coordinates);
      expect(node).toMatchObject({ lon: 37, lat: 35, id: way.nodes[0].id, version: 2 });
    });

    it('should only change the order of the nodes when order is changed', function () {
      const line: FlattenedGeoJSONLine = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [36, 35],
            [35, 34],
          ],
        },
      };
      const oldWay: OsmWay = {
        id: 1,
        version: 2,
        tags: { dog: 'meow' },
        type: 'way',
        nodes: [
          { id: 2, lat: 34, lon: 35, version: 2, type: 'node' },
          { id: 3, lat: 35, lon: 36, version: 1, type: 'node' },
        ],
      };

      const change = getChangeFromLine({ action: Actions.MODIFY, oldElement: oldWay, feature: line });

      expect(change).toHaveChangeActionLengths(0, 1, 0);

      const way = (change.modify as OsmWay[])[0];

      expect(way.nodes[0].id).toEqual(oldWay.nodes[1].id);
      expect(way.nodes[1].id).toEqual(oldWay.nodes[0].id);
    });

    it('should delete the node when a position is removed', function () {
      const line: FlattenedGeoJSONLine = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [35, 34],
            [36, 35],
          ],
        },
      };
      const oldWay: OsmWay = {
        id: 1,
        version: 2,
        tags: { dog: 'meow' },
        type: 'way',
        nodes: [
          { id: 2, lat: 34, lon: 35, version: 2, type: 'node' },
          { id: 3, lat: 35, lon: 36, version: 1, type: 'node' },
          { id: 4, lat: 36, lon: 38, version: 1, type: 'node' },
        ],
      };

      const change = getChangeFromLine({ action: Actions.MODIFY, oldElement: oldWay, feature: line });

      expect(change).toHaveChangeActionLengths(0, 1, 1);

      const way = (change.modify as OsmWay[])[0];
      const node = (change.delete as OsmNode[])[0];

      expect(way.nodes).toMatchPositionOrder(line.geometry.coordinates);
      expect(node).toMatchObject(oldWay.nodes[2]);
    });
  });

  describe('#getChangeFromPolygon', function () {
    it('should create a way with all its points', function () {
      const polygon: FlattenedGeoJSONPolygon = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [35.200434, 31.7697903],
              [35.3002677, 31.7696671],
              [35.200611, 31.7694414],
              [35.200434, 31.7697903],
            ],
          ],
        },
      };

      const change = getChangeFromPolygon({ action: Actions.CREATE, feature: polygon, generatorValue: 'test' });

      expect(change).toHaveChangeActionLengths(polygon.geometry.coordinates[0].length, 0, 0);
      expect(change).toHaveProperty('generator', 'test');

      const way = change.create?.find((elm) => elm.type === 'way') as OsmWay;
      expect(way).toBeDefined();
      expect(way).toHaveProperty('version', 0);
      expect(way).toHaveProperty('tags.dog', 'meow');

      const idSet = new Set<number>([way.id]);
      expect(way.nodes).toMatchPositionOrder(polygon.geometry.coordinates[0]);

      const length = polygon.geometry.coordinates[0].length - 1;
      expect(way.nodes[0].id).toEqual(way.nodes[length].id);
      // checks that each id is unique, and a matching node is created for it.
      for (let i = 0; i < length; i++) {
        const [lon, lat] = polygon.geometry.coordinates[0][i];

        const nodeInWay = way.nodes[i];
        expect(idSet).not.toContain(nodeInWay.id);
        idSet.add(nodeInWay.id);

        const createdNode = change.create?.find((elm) => elm.id === nodeInWay.id);
        expect(createdNode).toBeDefined();
        expect(createdNode).toMatchObject({ lon, lat, id: nodeInWay.id });
        expect(createdNode).toHaveProperty('version', 0);
      }
    });

    it('should delete the way and all the nodes', function () {
      const wayToDelete: OsmWay = {
        id: 1,
        version: 2,
        type: 'way',
        nodes: [
          { id: 2, lat: 34, lon: 35, version: 2, type: 'node' },
          { id: 3, lat: 35, lon: 36, version: 1, type: 'node' },
          { id: 4, lat: 36, lon: 37, version: 1, type: 'node' },
          { id: 2, lat: 34, lon: 35, version: 2, type: 'node' },
        ],
      };

      const change = getChangeFromPolygon({ action: Actions.DELETE, oldElement: wayToDelete });

      wayToDelete.nodes.forEach((node) => {
        const deletedNodes = change.delete?.filter((elm) => elm.id === node.id) as BaseElement[];
        expect(deletedNodes).toHaveLength(1);
        expect(deletedNodes[0]).toHaveProperty('version', node.version);
      });

      const way = change.delete?.find((elm) => elm.type === 'way') as OsmWay;
      expect(way).toMatchObject({ id: wayToDelete.id, version: wayToDelete.version });
      expect(change.delete).toMatchObject(expect.arrayContaining(wayToDelete.nodes));
    });

    it('should only modify the way tags if only tags were changed', function () {
      const polygon: FlattenedGeoJSONPolygon = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [35, 34],
              [36, 35],
            ],
          ],
        },
      };
      const oldWay: OsmWay = {
        id: 1,
        version: 2,
        tags: { cat: 'bark' },
        type: 'way',
        nodes: [
          { id: 2, lat: 34, lon: 35, version: 2, type: 'node' },
          { id: 3, lat: 35, lon: 36, version: 1, type: 'node' },
        ],
      };

      const change = getChangeFromPolygon({ action: Actions.MODIFY, oldElement: oldWay, feature: polygon });

      expect(change).toHaveChangeActionLengths(0, 1, 0);
      const way = (change.modify as OsmWay[])[0];

      expect(way).toHaveProperty('tags.dog', 'meow');
      expect(way).not.toHaveProperty('tags.cat', 'bark');
    });

    it('should only change the order of the nodes', function () {
      const line: FlattenedGeoJSONPolygon = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [35, 34],
              [35, 36],
              [33, 32],
              [35, 34],
            ],
          ],
        },
      };
      const oldWay: OsmWay = {
        id: 1,
        version: 2,
        tags: { cat: 'bark' },
        type: 'way',
        nodes: [
          { id: 2, lat: 34, lon: 35, version: 2, type: 'node' },
          { id: 3, lat: 32, lon: 33, version: 1, type: 'node' },
          { id: 4, lat: 36, lon: 35, version: 1, type: 'node' },
          { id: 2, lat: 34, lon: 35, version: 2, type: 'node' },
        ],
      };

      const change = getChangeFromPolygon({ action: Actions.MODIFY, oldElement: oldWay, feature: line });

      expect(change).toHaveChangeActionLengths(0, 1, 0);
      const way = (change.modify as OsmWay[])[0];

      expect(way.nodes).toMatchPositionOrder(line.geometry.coordinates[0]);
    });

    it('should add a new node and modify the way', function () {
      const line: FlattenedGeoJSONPolygon = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [37, 36],
              [36, 35],
              [35, 34],
              [32, 33],
              [37, 36],
            ],
          ],
        },
      };
      const oldWay: OsmWay = {
        id: 1,
        version: 2,
        tags: { dog: 'meow' },
        type: 'way',
        nodes: [
          { id: 2, lat: 36, lon: 37, version: 2, type: 'node' },
          { id: 3, lat: 35, lon: 36, version: 1, type: 'node' },
          { id: 4, lat: 34, lon: 35, version: 1, type: 'node' },
          { id: 2, lat: 36, lon: 37, version: 2, type: 'node' },
        ],
      };

      const change = getChangeFromPolygon({ action: Actions.MODIFY, oldElement: oldWay, feature: line });

      expect(change).toHaveChangeActionLengths(1, 1, 0);
      const way = (change.modify as OsmWay[])[0];
      const node = (change.create as OsmNode[])[0];

      expect(way.nodes).toMatchPositionOrder(line.geometry.coordinates[0]);
      expect(node).toMatchObject({ lon: 32, lat: 33, id: way.nodes[3].id, version: 0 });
      expect(node.id).toBeLessThanOrEqual(0);
    });

    it('should modify an existing node when a point in polygon is changed', function () {
      const line: FlattenedGeoJSONPolygon = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [32, 32],
              [35, 34],
              [37, 35],
              [32, 32],
            ],
          ],
        },
      };
      const oldWay: OsmWay = {
        id: 1,
        version: 2,
        tags: { dog: 'meow' },
        type: 'way',
        nodes: [
          { id: 2, lat: 32, lon: 32, version: 2, type: 'node' },
          { id: 3, lat: 34, lon: 35, version: 1, type: 'node' },
          { id: 4, lat: 36, lon: 35, version: 1, type: 'node' },
          { id: 2, lat: 32, lon: 32, version: 2, type: 'node' },
        ],
      };

      const change = getChangeFromPolygon({ action: Actions.MODIFY, oldElement: oldWay, feature: line });

      expect(change).toHaveChangeActionLengths(0, 2, 0);

      const way = change.modify?.find((elm) => elm.type === 'way') as OsmWay;
      const node = change.modify?.find((elm) => elm.type === 'node') as OsmNode;

      expect(way.nodes).toMatchPositionOrder(line.geometry.coordinates[0]);
      expect(node).toMatchObject({ lon: 37, lat: 35, id: way.nodes[2].id, version: 1 });
    });

    it('should only change the order of the nodes when order is changed', function () {
      const line: FlattenedGeoJSONPolygon = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [36, 35],
              [35, 34],
              [37, 36],
              [36, 35],
            ],
          ],
        },
      };
      const oldWay: OsmWay = {
        id: 1,
        version: 2,
        tags: { dog: 'meow' },
        type: 'way',
        nodes: [
          { id: 2, lat: 35, lon: 36, version: 2, type: 'node' },
          { id: 3, lat: 36, lon: 37, version: 1, type: 'node' },
          { id: 4, lat: 34, lon: 35, version: 1, type: 'node' },
          { id: 2, lat: 35, lon: 36, version: 2, type: 'node' },
        ],
      };

      const change = getChangeFromPolygon({ action: Actions.MODIFY, oldElement: oldWay, feature: line });

      expect(change).toHaveChangeActionLengths(0, 1, 0);

      const way = (change.modify as OsmWay[])[0];

      expect(way.nodes[1].id).toEqual(oldWay.nodes[2].id);
      expect(way.nodes[2].id).toEqual(oldWay.nodes[1].id);
    });

    it('should delete the node when a position is removed', function () {
      const line: FlattenedGeoJSONPolygon = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [35, 34],
              [36, 35],
              [37, 36],
              [35, 34],
            ],
          ],
        },
      };
      const oldWay: OsmWay = {
        id: 1,
        version: 2,
        tags: { dog: 'meow' },
        type: 'way',
        nodes: [
          { id: 2, lat: 34, lon: 35, version: 2, type: 'node' },
          { id: 3, lat: 35, lon: 36, version: 1, type: 'node' },
          { id: 4, lat: 36, lon: 37, version: 2, type: 'node' },
          { id: 5, lat: 36, lon: 38, version: 1, type: 'node' },
          { id: 2, lat: 34, lon: 35, version: 2, type: 'node' },
        ],
      };

      const change = getChangeFromPolygon({ action: Actions.MODIFY, oldElement: oldWay, feature: line });

      expect(change).toHaveChangeActionLengths(0, 1, 1);

      const way = (change.modify as OsmWay[])[0];
      const node = (change.delete as OsmNode[])[0];

      expect(way.nodes).toMatchPositionOrder(line.geometry.coordinates[0]);
      expect(node).toMatchObject(oldWay.nodes[3]);
    });
  });
});
