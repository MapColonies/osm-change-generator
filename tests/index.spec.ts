/* eslint-disable jest/no-conditional-expect */ // some expections are conditional
import { BaseElement, OsmNode, OsmWay } from '@map-colonies/node-osm-elements';
import { getChangeFromLine, getChangeFromPoint, getChangeFromPolygon } from '../src';
import { Actions, FlattenedGeoJSONLine, FlattenedGeoJSONPoint, FlattenedGeoJSONPolygon } from '../src/models';
import { TAGS } from '../src/constants';

describe('index', function () {
  describe('#getChangeFromPoint', function () {
    it('should add a node with no tags to the create part of the change', function () {
      const point: FlattenedGeoJSONPoint = { geometry: { type: 'Point', coordinates: [18, 17] }, type: 'Feature', properties: undefined };
      const expectedNode = { type: 'node', lon: point.geometry.coordinates[0], lat: point.geometry.coordinates[1], tags: {} };

      const change = getChangeFromPoint({ action: Actions.CREATE, feature: point, generatorValue: 'test', options: { shouldHandleLOD2: false } });

      expect(change).toHaveChangeActionLengths(1, 0, 0);
      expect(change).toHaveProperty('generator', 'test');
      const node = (change.create as BaseElement[])[0];
      expect(node.id).toBeLessThan(0);
      expect(node).toMatchObject(expectedNode);
    });

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

    it('should add a node with altitude to the create part of the change', function () {
      const point: FlattenedGeoJSONPoint = { geometry: { type: 'Point', coordinates: [18, 17, 6.66] }, type: 'Feature', properties: { dog: 'meow' } };
      const expectedNode = {
        type: 'node',
        lon: point.geometry.coordinates[0],
        lat: point.geometry.coordinates[1],
        tags: { dog: 'meow', [TAGS.ALTITUDE]: '6.66' },
      };

      const change = getChangeFromPoint({ action: Actions.CREATE, feature: point, generatorValue: 'test', options: { shouldHandleLOD2: true } });

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

    it('should add a node with altitude to the modify part of the change', function () {
      const point: FlattenedGeoJSONPoint = { geometry: { type: 'Point', coordinates: [18, 17, 6.66] }, type: 'Feature', properties: { dog: 'meow' } };
      const oldNode: OsmNode = { id: 1, lat: 20, lon: 21, type: 'node', tags: { cat: 'bark', [TAGS.ALTITUDE]: '3.33' }, version: 2 };
      const expectedNode = {
        type: 'node',
        id: oldNode.id,
        version: oldNode.version,
        lon: point.geometry.coordinates[0],
        lat: point.geometry.coordinates[1],
        tags: { dog: 'meow', [TAGS.ALTITUDE]: '6.66' },
      };

      const change = getChangeFromPoint({ action: Actions.MODIFY, feature: point, oldElement: oldNode, options: { shouldHandleLOD2: true } });

      expect(change).toHaveChangeActionLengths(0, 1, 0);
      const node = (change.modify as BaseElement[])[0];
      expect((node.tags as Record<string, string>)['cat']).toBeUndefined();
      expect(node).toMatchObject(expectedNode);
    });

    it('should add a node with altitude to the modify part of the change if only altitude has changed', function () {
      const point: FlattenedGeoJSONPoint = { geometry: { type: 'Point', coordinates: [18, 17, 6.66] }, type: 'Feature', properties: { dog: 'meow' } };
      const oldNode: OsmNode = { id: 1, lat: 20, lon: 21, type: 'node', tags: { dog: 'meow', [TAGS.ALTITUDE]: '3.33' }, version: 2 };
      const expectedNode = {
        type: 'node',
        id: oldNode.id,
        version: oldNode.version,
        lon: point.geometry.coordinates[0],
        lat: point.geometry.coordinates[1],
        tags: { dog: 'meow', [TAGS.ALTITUDE]: '6.66' },
      };

      const change = getChangeFromPoint({ action: Actions.MODIFY, feature: point, oldElement: oldNode, options: { shouldHandleLOD2: true } });

      expect(change).toHaveChangeActionLengths(0, 1, 0);
      const node = (change.modify as BaseElement[])[0];
      expect(node).toMatchObject(expectedNode);
    });

    it('should add a node to the delete part of the change', function () {
      const node: OsmNode = { id: 1, lat: 20, lon: 21, type: 'node', tags: { cat: 'bark' }, version: 2 };

      const change = getChangeFromPoint({ action: Actions.DELETE, oldElement: node });

      expect(change).toHaveChangeActionLengths(0, 0, 1);
      const deletedNode = (change.delete as BaseElement[])[0];
      expect(deletedNode.type).toBe('node');
      expect(deletedNode).toMatchObject(node);
    });

    it('should add a node with altitude to the delete part of the change', function () {
      const node: OsmNode = { id: 1, lat: 20, lon: 21, type: 'node', tags: { cat: 'bark', [TAGS.ALTITUDE]: '6.66' }, version: 2 };

      const change = getChangeFromPoint({ action: Actions.DELETE, oldElement: node });

      expect(change).toHaveChangeActionLengths(0, 0, 1);
      const deletedNode = (change.delete as BaseElement[])[0];
      expect(deletedNode.type).toBe('node');
      expect(deletedNode).toMatchObject(node);
    });

    it('should add a created node affected by coordinate precision and attribute it', function () {
      const point: FlattenedGeoJSONPoint = {
        geometry: { type: 'Point', coordinates: [18.12345678, 17.12345675] },
        type: 'Feature',
        properties: undefined,
      };
      const expectedNode = {
        type: 'node',
        lon: point.geometry.coordinates[0],
        lat: point.geometry.coordinates[1],
        tags: {
          [TAGS.GEOMETRY_PRECISION_AFFECTED]: 'true',
          [TAGS.PRECISED_LON]: '18.12345678',
          [TAGS.PRECISED_LAT]: '17.12345675',
        },
      };

      const change = getChangeFromPoint({
        action: Actions.CREATE,
        feature: point,
        generatorValue: 'test',
        options: { shouldHandleLOD2: false, shouldHandlePrecision: true },
      });

      expect(change).toHaveChangeActionLengths(1, 0, 0);
      expect(change).toHaveProperty('generator', 'test');
      const node = (change.create as BaseElement[])[0];
      expect(node.id).toBeLessThan(0);
      expect(node).toMatchObject(expectedNode);
    });

    it('should add a modified node affected by coordinate precision and its altitude and attribute it', function () {
      const point: FlattenedGeoJSONPoint = {
        geometry: { type: 'Point', coordinates: [0.1234567, 0.12345678, 0.123456789] },
        type: 'Feature',
        properties: { dog: 'meow' },
      };
      const oldNode: OsmNode = { id: 1, lon: 0.123, lat: 0.123, type: 'node', tags: { cat: 'bark', [TAGS.ALTITUDE]: '0.123456789' }, version: 2 };
      const expectedNode = {
        type: 'node',
        id: oldNode.id,
        version: oldNode.version,
        lon: point.geometry.coordinates[0],
        lat: point.geometry.coordinates[1],
        tags: {
          dog: 'meow',
          [TAGS.ALTITUDE]: '0.123456789',
          [TAGS.GEOMETRY_PRECISION_AFFECTED]: 'true',
          [TAGS.PRECISED_LON]: '0.1234567',
          [TAGS.PRECISED_LAT]: '0.12345678',
        },
      };

      const change = getChangeFromPoint({
        action: Actions.MODIFY,
        feature: point,
        oldElement: oldNode,
        generatorValue: 'test',
        options: { shouldHandleLOD2: true, shouldHandlePrecision: true },
      });

      expect(change).toHaveChangeActionLengths(0, 1, 0);
      expect(change).toHaveProperty('generator', 'test');
      const node = (change.modify as BaseElement[])[0];
      expect(node).toMatchObject(expectedNode);
    });

    it('should add a modified node affected by coordinate precision and unattribute it', function () {
      const point: FlattenedGeoJSONPoint = { geometry: { type: 'Point', coordinates: [0.123, 0.456] }, type: 'Feature', properties: { dog: 'meow' } };
      const oldNode: OsmNode = {
        id: 1,
        lon: 0.1234567,
        lat: 0.1234568,
        type: 'node',
        tags: {
          cat: 'bark',
          [TAGS.ALTITUDE]: '0.123456789',
          [TAGS.PRECISED_LON]: '0.1234567',
          [TAGS.PRECISED_LAT]: '0.12345678',
        },
        version: 2,
      };
      const expectedNode = {
        type: 'node',
        id: oldNode.id,
        version: oldNode.version,
        lon: 0.123,
        lat: 0.456,
        tags: { dog: 'meow' },
      };

      const change = getChangeFromPoint({
        action: Actions.MODIFY,
        feature: point,
        oldElement: oldNode,
        generatorValue: 'test',
        options: { shouldHandleLOD2: true, shouldHandlePrecision: true },
      });

      expect(change).toHaveChangeActionLengths(0, 1, 0);
      expect(change).toHaveProperty('generator', 'test');
      const node = (change.modify as BaseElement[])[0];
      expect(node).toMatchObject(expectedNode);
    });

    it('should add a modified node affected by coordinate precision and re-attribute it', function () {
      const point: FlattenedGeoJSONPoint = {
        geometry: { type: 'Point', coordinates: [0.12345678, 0.1, 0.987654321] },
        type: 'Feature',
        properties: { dog: 'meow' },
      };
      const oldNode: OsmNode = {
        id: 1,
        lon: 0.1,
        lat: 0.1234568,
        type: 'node',
        tags: { cat: 'bark', [TAGS.ALTITUDE]: '0.123456789', [TAGS.PRECISED_LON]: '0.1', [TAGS.PRECISED_LAT]: '0.12345678' },
        version: 2,
      };
      const expectedNode = {
        type: 'node',
        id: oldNode.id,
        version: oldNode.version,
        lon: 0.12345678,
        lat: 0.1,
        tags: { dog: 'meow', [TAGS.ALTITUDE]: '0.987654321', [TAGS.PRECISED_LON]: '0.12345678', [TAGS.PRECISED_LAT]: '0.1' },
      };

      const change = getChangeFromPoint({
        action: Actions.MODIFY,
        feature: point,
        oldElement: oldNode,
        generatorValue: 'test',
        options: { shouldHandleLOD2: true, shouldHandlePrecision: true },
      });

      expect(change).toHaveChangeActionLengths(0, 1, 0);
      expect(change).toHaveProperty('generator', 'test');
      const node = (change.modify as BaseElement[])[0];
      expect(node).toMatchObject(expectedNode);
    });

    it('should add a node which was geometry affected to the delete part of the change', function () {
      const node: OsmNode = {
        id: 1,
        lon: 0.1,
        lat: 0.1234568,
        type: 'node',
        tags: { cat: 'bark', [TAGS.ALTITUDE]: '0.123456789', [TAGS.PRECISED_LON]: '0.1', [TAGS.PRECISED_LAT]: '0.12345678' },
        version: 2,
      };

      const change = getChangeFromPoint({ action: Actions.DELETE, oldElement: node });

      expect(change).toHaveChangeActionLengths(0, 0, 1);
      const deletedNode = (change.delete as BaseElement[])[0];
      expect(deletedNode.type).toBe('node');
      expect(deletedNode).toMatchObject(node);
    });
  });

  describe('#getChangeFromLine', function () {
    it('should create a way with all its points and no tags', function () {
      const line: FlattenedGeoJSONLine = {
        type: 'Feature',
        properties: undefined,
        geometry: {
          type: 'LineString',
          coordinates: [
            [35.200434, 31.7697903],
            [35.3002677, 31.7696671],
            [35.200611, 31.7694414],
          ],
        },
      };

      const change = getChangeFromLine({ action: Actions.CREATE, feature: line, generatorValue: 'test', options: { shouldHandleLOD2: false } });

      expect(change).toHaveChangeActionLengths(line.geometry.coordinates.length + 1, 0, 0);
      expect(change).toHaveProperty('generator', 'test');

      const way = change.create?.find((elm) => elm.type === 'way') as OsmWay;
      expect(way).toBeDefined();
      expect(way).toHaveProperty('version', 0);
      expect(way.tags).toBeUndefined();

      const idSet = new Set<number>([way.id]);
      expect(way.nodes).toMatchPositionOrder(line.geometry.coordinates);

      // checks that each id is unique, and a matching node is created for it.
      line.geometry.coordinates.forEach(([lon, lat], index) => {
        const nodeInWay = way.nodes[index];
        expect(idSet).not.toContain(nodeInWay.id);
        idSet.add(nodeInWay.id);

        const createdNode = change.create?.find((elm) => elm.id === nodeInWay.id);
        expect(createdNode).toBeDefined();
        expect(createdNode).toMatchObject({ lon, lat, id: nodeInWay.id, tags: {} });
        expect(createdNode).toHaveProperty('version', 0);
      });
    });

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

    it('should create a way with all its points which have altitude', function () {
      const line: FlattenedGeoJSONLine = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [35.200434, 31.7697903, 1.1],
            [35.3002677, 31.7696671, 2.2],
            [35.200611, 31.7694414, 3.3],
          ],
        },
      };

      const change = getChangeFromLine({ action: Actions.CREATE, feature: line, generatorValue: 'test', options: { shouldHandleLOD2: true } });

      expect(change).toHaveChangeActionLengths(line.geometry.coordinates.length + 1, 0, 0);
      expect(change).toHaveProperty('generator', 'test');

      const way = change.create?.find((elm) => elm.type === 'way') as OsmWay;
      expect(way).toBeDefined();
      expect(way).toHaveProperty('version', 0);
      expect(way).toHaveProperty('tags.dog', 'meow');

      const idSet = new Set<number>([way.id]);
      expect(way.nodes).toMatchPositionOrder3D(line.geometry.coordinates);

      // checks that each id is unique, and a matching node is created for it.
      line.geometry.coordinates.forEach(([lon, lat, alt], index) => {
        const nodeInWay = way.nodes[index];
        expect(idSet).not.toContain(nodeInWay.id);
        idSet.add(nodeInWay.id);

        const createdNode = change.create?.find((elm) => elm.id === nodeInWay.id);
        expect(createdNode).toBeDefined();
        expect(createdNode).toMatchObject({ lon, lat, id: nodeInWay.id });
        expect(createdNode).toHaveProperty('version', 0);
        expect(createdNode).toHaveProperty(`tags.${TAGS.ALTITUDE}`, alt.toString());
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

    it('should create a way, and the unique nodes, if line with altitudes is closed', function () {
      const line: FlattenedGeoJSONLine = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [35.200434, 31.7697903, 1.1],
            [35.3002677, 31.7696671, 2.2],
            [35.200611, 31.7694414, 3.3],
            [35.200434, 31.7697903, 1.1],
          ],
        },
      };
      const change = getChangeFromLine({ action: Actions.CREATE, feature: line, options: { shouldHandleLOD2: true } });

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

      line.geometry.coordinates.forEach(([lon, lat, alt], index) => {
        const nodeInWay = way.nodes[index];
        expect(nodeInWay).toMatchObject({ lon, lat });
        expect(nodeInWay).toHaveProperty(`tags.${TAGS.ALTITUDE}`, alt.toString());
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

    it('should delete the way (which has altitude) and all the nodes', function () {
      const wayToDelete: OsmWay = {
        id: 1,
        version: 2,
        type: 'way',
        nodes: [
          { id: 2, lat: 34, lon: 35, version: 2, type: 'node', tags: { [TAGS.ALTITUDE]: '1' } },
          { id: 3, lat: 35, lon: 36, version: 1, type: 'node', tags: { [TAGS.ALTITUDE]: '2' } },
        ],
      };

      const change = getChangeFromLine({ action: Actions.DELETE, oldElement: wayToDelete });

      wayToDelete.nodes.forEach((node) => {
        const deletedNodes = change.delete?.filter((elm) => elm.id === node.id) as BaseElement[];
        expect(deletedNodes).toHaveLength(1);
        expect(deletedNodes[0]).toHaveProperty('version', node.version);
        expect(deletedNodes[0]).toHaveProperty(`tags.${TAGS.ALTITUDE}`);
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

    it('should only modify the way (which has altitude) tags if only tags were changed', function () {
      const line: FlattenedGeoJSONLine = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [35, 34, 1],
            [36, 35, 2],
          ],
        },
      };
      const oldWay: OsmWay = {
        id: 1,
        version: 2,
        tags: { cat: 'bark' },
        type: 'way',
        nodes: [
          { id: 2, lat: 34, lon: 35, version: 2, type: 'node', tags: { [TAGS.ALTITUDE]: '1' } },
          { id: 3, lat: 35, lon: 36, version: 1, type: 'node', tags: { [TAGS.ALTITUDE]: '2' } },
        ],
      };

      const change = getChangeFromLine({ action: Actions.MODIFY, oldElement: oldWay, feature: line, options: { shouldHandleLOD2: false } });

      expect(change).toHaveChangeActionLengths(0, 1, 0);
      const way = (change.modify as OsmWay[])[0];

      expect(way).toHaveProperty('tags.dog', 'meow');
      expect(way).not.toHaveProperty('tags.cat', 'bark');

      line.geometry.coordinates.forEach(([lon, lat], index) => {
        const nodeInWay = way.nodes[index];
        expect(nodeInWay).toMatchObject({ lon, lat });
        expect(nodeInWay).not.toHaveProperty(`tags.${TAGS.ALTITUDE}`);
      });
    });

    it('should only modify the way (which has altitude) tags if only altitude tags were changed', function () {
      const line: FlattenedGeoJSONLine = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [35, 34, 1],
            [36, 35, 2],
          ],
        },
      };
      const oldWay: OsmWay = {
        id: 1,
        version: 2,
        tags: { dog: 'meow' },
        type: 'way',
        nodes: [
          { id: 2, lat: 34, lon: 35, version: 2, type: 'node', tags: { [TAGS.ALTITUDE]: '-1' } },
          { id: 3, lat: 35, lon: 36, version: 1, type: 'node', tags: { [TAGS.ALTITUDE]: '-2' } },
        ],
      };

      const change = getChangeFromLine({ action: Actions.MODIFY, oldElement: oldWay, feature: line, options: { shouldHandleLOD2: true } });

      expect(change).toHaveChangeActionLengths(0, 1, 0);
      const way = (change.modify as OsmWay[])[0];

      expect(way).toHaveProperty('tags.dog', 'meow');

      line.geometry.coordinates.forEach(([lon, lat, alt], index) => {
        const nodeInWay = way.nodes[index];
        expect(nodeInWay).toMatchObject({ lon, lat });
        expect(nodeInWay).toHaveProperty(`tags.${TAGS.ALTITUDE}`, alt.toString());
      });
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

    it('should only change the order of the nodes for a way with altitudes', function () {
      const line: FlattenedGeoJSONLine = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [36, 35, 10],
            [35, 34, 20],
          ],
        },
      };
      const oldWay: OsmWay = {
        id: 1,
        version: 2,
        tags: { cat: 'bark' },
        type: 'way',
        nodes: [
          { id: 2, lat: 34, lon: 35, version: 2, type: 'node', tags: { [TAGS.ALTITUDE]: '10' } },
          { id: 3, lat: 35, lon: 36, version: 1, type: 'node', tags: { [TAGS.ALTITUDE]: '20' } },
        ],
      };

      const change = getChangeFromLine({ action: Actions.MODIFY, oldElement: oldWay, feature: line, options: { shouldHandleLOD2: true } });

      expect(change).toHaveChangeActionLengths(0, 1, 0);
      const way = (change.modify as OsmWay[])[0];

      expect(way.nodes).toMatchPositionOrder3D(line.geometry.coordinates);
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

    it('should add a new node and modify the way which has altitudes', function () {
      const line: FlattenedGeoJSONLine = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [37, 36, 10],
            [36, 35],
            [35, 34, 20],
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
          { id: 3, lat: 35, lon: 36, version: 1, type: 'node', tags: { [TAGS.ALTITUDE]: '5' } },
        ],
      };

      const change = getChangeFromLine({ action: Actions.MODIFY, oldElement: oldWay, feature: line, options: { shouldHandleLOD2: true } });

      expect(change).toHaveChangeActionLengths(1, 1, 0);
      const way = (change.modify as OsmWay[])[0];
      const node = (change.create as OsmNode[])[0];

      expect(way.nodes).toMatchPositionOrder3D(line.geometry.coordinates);
      expect(node).toMatchObject({ lon: 37, lat: 36, id: way.nodes[0].id, version: 0, tags: { [TAGS.ALTITUDE]: '10' } });
      expect(node.id).toBeLessThanOrEqual(0);

      line.geometry.coordinates.forEach(([lon, lat, alt], index) => {
        const nodeInWay = way.nodes[index];
        expect(nodeInWay).toMatchObject({ lon, lat });
        if ((alt as number | undefined) !== undefined) {
          expect(nodeInWay).toHaveProperty(`tags.${TAGS.ALTITUDE}`, alt.toString());
        } else {
          expect(nodeInWay).not.toHaveProperty(`tags.${TAGS.ALTITUDE}`);
        }
      });
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

    it('should modify an existing node when a point in line with altitudes is changed', function () {
      const line: FlattenedGeoJSONLine = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [37, 35, 10],
            [35, 34, 2],
          ],
        },
      };
      const oldWay: OsmWay = {
        id: 1,
        version: 2,
        tags: { dog: 'meow' },
        type: 'way',
        nodes: [
          { id: 2, lat: 32, lon: 32, version: 2, type: 'node', tags: { [TAGS.ALTITUDE]: '9' } },
          { id: 3, lat: 34, lon: 35, version: 1, type: 'node', tags: { [TAGS.ALTITUDE]: '2' } },
        ],
      };

      const change = getChangeFromLine({ action: Actions.MODIFY, oldElement: oldWay, feature: line, options: { shouldHandleLOD2: true } });

      expect(change).toHaveChangeActionLengths(0, 2, 0);
      const way = change.modify?.find((elm) => elm.type === 'way') as OsmWay;
      const node = change.modify?.find((elm) => elm.type === 'node') as OsmNode;

      expect(way.nodes).toMatchPositionOrder3D(line.geometry.coordinates);
      expect(node).toMatchObject({ lon: 37, lat: 35, id: way.nodes[0].id, version: 2, tags: { altitude: '10' } });
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

    it('should only change the order of the nodes when order is changed to line with altitudes', function () {
      const line: FlattenedGeoJSONLine = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [36, 35, 1],
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
          { id: 2, lat: 34, lon: 35, version: 2, type: 'node', tags: { [TAGS.ALTITUDE]: '1' } },
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

    it('should delete the node when a position is removed from line with altitudes', function () {
      const line: FlattenedGeoJSONLine = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [35, 34, 10],
            [36, 35, 20],
          ],
        },
      };
      const oldWay: OsmWay = {
        id: 1,
        version: 2,
        tags: { dog: 'meow' },
        type: 'way',
        nodes: [
          { id: 2, lat: 34, lon: 35, version: 2, type: 'node', tags: { [TAGS.ALTITUDE]: '10' } },
          { id: 3, lat: 35, lon: 36, version: 1, type: 'node', tags: { [TAGS.ALTITUDE]: '20' } },
          { id: 4, lat: 36, lon: 38, version: 1, type: 'node', tags: { [TAGS.ALTITUDE]: '30' } },
        ],
      };

      const change = getChangeFromLine({ action: Actions.MODIFY, oldElement: oldWay, feature: line });

      expect(change).toHaveChangeActionLengths(0, 1, 1);

      const way = (change.modify as OsmWay[])[0];
      const node = (change.delete as OsmNode[])[0];

      expect(way.nodes).toMatchPositionOrder3D(line.geometry.coordinates);
      expect(node).toMatchObject(oldWay.nodes[2]);
    });

    it('should create a line with affected precision and attribute it', function () {
      const line: FlattenedGeoJSONLine = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [35.123456789, 31.987654321],
            [35.3002677, 31.7696671],
            [35.200611, 31.7694414],
          ],
        },
      };

      const change = getChangeFromLine({
        action: Actions.CREATE,
        feature: line,
        generatorValue: 'test',
        options: { shouldHandlePrecision: true },
      });

      expect(change).toHaveChangeActionLengths(line.geometry.coordinates.length + 1, 0, 0);
      expect(change).toHaveProperty('generator', 'test');

      const way = change.create?.find((elm) => elm.type === 'way') as OsmWay;
      expect(way).toBeDefined();
      expect(way).toHaveProperty('version', 0);
      expect(way).toHaveProperty('tags.dog', 'meow');
      expect(way).toHaveProperty(`tags.${TAGS.GEOMETRY_PRECISION_AFFECTED}`, 'true');

      const idSet = new Set<number>([way.id]);
      expect(way.nodes).toMatchPositionOrder(line.geometry.coordinates);

      // checks that each id is unique, and a matching node is created for it.
      line.geometry.coordinates.forEach(([lon, lat], index) => {
        const nodeInWay = way.nodes[index];
        expect(idSet).not.toContain(nodeInWay.id);
        idSet.add(nodeInWay.id);

        const createdNode = change.create?.find((elm) => elm.id === nodeInWay.id);
        expect(createdNode).toBeDefined();
        expect(createdNode).toMatchObject({
          lon,
          lat,
          id: nodeInWay.id,
        });
        expect(createdNode).toHaveProperty('version', 0);

        expect(createdNode).toHaveProperty(`tags.${TAGS.PRECISED_LON}`, lon.toString());
        expect(createdNode).toHaveProperty(`tags.${TAGS.PRECISED_LAT}`, lat.toString());
      });
    });

    it('should modify a line with affected precision and attribute it', function () {
      const line: FlattenedGeoJSONLine = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [31.123456789, 32.987654321],
            [33.123456789, 34.987654321],
            [35.123456789, 36.987654321],
          ],
        },
      };

      const oldWay: OsmWay = {
        id: 1,
        version: 2,
        tags: { dog: 'meow' },
        type: 'way',
        nodes: [
          { id: 2, lon: 31, lat: 32, version: 2, type: 'node' },
          { id: 3, lon: 33, lat: 34, version: 1, type: 'node' },
          { id: 4, lon: 35, lat: 36, version: 1, type: 'node' },
        ],
      };

      const change = getChangeFromLine({
        action: Actions.MODIFY,
        oldElement: oldWay,
        feature: line,
        options: { shouldHandlePrecision: true },
      });

      expect(change).toHaveChangeActionLengths(0, 4, 0);

      const way = (change.modify as OsmWay[])[0];
      expect(way).toBeDefined();
      expect(way).toHaveProperty('version', 2);
      expect(way).toHaveProperty('tags.dog', 'meow');
      expect(way).toHaveProperty(`tags.${TAGS.GEOMETRY_PRECISION_AFFECTED}`, 'true');

      expect(way.nodes).toMatchPositionOrder(line.geometry.coordinates);

      line.geometry.coordinates.forEach(([lon, lat], index) => {
        const nodeInWay = way.nodes[index];

        const modifiedNode = change.modify?.find((elm) => elm.id === nodeInWay.id);
        expect(modifiedNode).toBeDefined();
        expect(modifiedNode).toMatchObject({
          lon,
          lat,
          id: nodeInWay.id,
        });

        expect(modifiedNode).toHaveProperty(`tags.${TAGS.PRECISED_LON}`, lon.toString());
        expect(modifiedNode).toHaveProperty(`tags.${TAGS.PRECISED_LAT}`, lat.toString());
      });
    });

    it('should modify a line with affected precision and re-attribute it', function () {
      const line: FlattenedGeoJSONLine = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [31, 32],
            [33.123456789, 34.987654321],
            [35.123456789, 36.987654321],
            [37.123456789, 38.987654321],
          ],
        },
      };

      const oldWay: OsmWay = {
        id: 1,
        version: 2,
        tags: { dog: 'meow', [TAGS.GEOMETRY_PRECISION_AFFECTED]: 'true' },
        type: 'way',
        nodes: [
          {
            id: 2,
            lon: 31.1234568,
            lat: 32.9876543,
            version: 2,
            type: 'node',
            tags: { [TAGS.PRECISED_LON]: '31.123456789', [TAGS.PRECISED_LAT]: '32.987654321' },
          },
          { id: 3, lon: 33, lat: 34, version: 1, type: 'node' },
          { id: 4, lon: 35, lat: 36, version: 1, type: 'node' },
        ],
      };

      const change = getChangeFromLine({
        action: Actions.MODIFY,
        oldElement: oldWay,
        feature: line,
        options: { shouldHandlePrecision: true },
      });

      expect(change).toHaveChangeActionLengths(1, 4, 0);

      const way = (change.modify as OsmWay[])[0];
      expect(way).toBeDefined();
      expect(way).toHaveProperty('version', 2);
      expect(way).toHaveProperty('tags.dog', 'meow');
      expect(way).toHaveProperty(`tags.${TAGS.GEOMETRY_PRECISION_AFFECTED}`, 'true');

      expect(way.nodes).toMatchPositionOrder(line.geometry.coordinates);

      line.geometry.coordinates.forEach(([lon, lat], index) => {
        const nodeInWay = way.nodes[index];

        const node = [...(change.create ?? []), ...(change.modify ?? [])].find((elm) => elm.id === nodeInWay.id);
        expect(node).toBeDefined();
        expect(node).toMatchObject({
          lon,
          lat,
          id: nodeInWay.id,
        });

        expect(nodeInWay).toHaveProperty(`tags.${TAGS.PRECISED_LON}`, lon.toString());
        expect(nodeInWay).toHaveProperty(`tags.${TAGS.PRECISED_LAT}`, lat.toString());
      });
    });

    it('should modify a line with unaffected precision and unattribute it', function () {
      const line: FlattenedGeoJSONLine = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [31, 32],
            [33, 34],
            [35, 36],
            [37, 38],
          ],
        },
      };

      const oldWay: OsmWay = {
        id: 1,
        version: 2,
        tags: { dog: 'meow', [TAGS.GEOMETRY_PRECISION_AFFECTED]: 'true' },
        type: 'way',
        nodes: [
          {
            id: 2,
            lon: 31.1234568,
            lat: 32.9876543,
            version: 2,
            type: 'node',
            tags: { [TAGS.PRECISED_LON]: '31.123456789', [TAGS.PRECISED_LAT]: '32.987654321' },
          },
          { id: 3, lon: 33, lat: 34, version: 1, type: 'node' },
          { id: 4, lon: 35, lat: 36, version: 1, type: 'node' },
        ],
      };

      const change = getChangeFromLine({
        action: Actions.MODIFY,
        oldElement: oldWay,
        feature: line,
        options: { shouldHandlePrecision: true },
      });

      expect(change).toHaveChangeActionLengths(1, 2, 0);

      const way = (change.modify as OsmWay[])[0];
      expect(way).toBeDefined();
      expect(way).toHaveProperty('version', 2);
      expect(way).toHaveProperty('tags.dog', 'meow');
      expect(way).not.toHaveProperty(`tags.${TAGS.GEOMETRY_PRECISION_AFFECTED}`);

      expect(way.nodes).toMatchPositionOrder(line.geometry.coordinates);

      line.geometry.coordinates.forEach((_, index) => {
        const nodeInWay = way.nodes[index];

        expect(nodeInWay).not.toHaveProperty(`tags.${TAGS.PRECISED_LON}`);
        expect(nodeInWay).not.toHaveProperty(`tags.${TAGS.PRECISED_LAT}`);
      });
    });

    it('should delete a line with affected geometry precision', function () {
      const wayToDelete: OsmWay = {
        id: 1,
        version: 2,
        type: 'way',
        tags: { [TAGS.GEOMETRY_PRECISION_AFFECTED]: 'true' },
        nodes: [
          {
            id: 2,
            lon: 31.1234568,
            lat: 32.1234568,
            version: 2,
            type: 'node',
            tags: { [TAGS.ALTITUDE]: '1', [TAGS.PRECISED_LON]: '31.123456789', [TAGS.PRECISED_LAT]: '33.12345678' },
          },
          {
            id: 3,
            lon: 33.1234568,
            lat: 34.1234568,
            version: 1,
            type: 'node',
            tags: { [TAGS.ALTITUDE]: '2', [TAGS.PRECISED_LON]: '33.12345675', [TAGS.PRECISED_LAT]: '34.123456800111' },
          },
        ],
      };

      const change = getChangeFromLine({ action: Actions.DELETE, oldElement: wayToDelete });

      wayToDelete.nodes.forEach((node) => {
        const deletedNodes = change.delete?.filter((elm) => elm.id === node.id) as BaseElement[];
        expect(deletedNodes).toHaveLength(1);
        expect(deletedNodes[0]).toHaveProperty('version', node.version);
        expect(deletedNodes[0]).toHaveProperty(`tags.${TAGS.ALTITUDE}`);
        expect(deletedNodes[0]).toHaveProperty(`tags.${TAGS.PRECISED_LON}`);
        expect(deletedNodes[0]).toHaveProperty(`tags.${TAGS.PRECISED_LAT}`);
      });

      const way = change.delete?.find((elm) => elm.type === 'way') as OsmWay;
      expect(way).toMatchObject({ id: wayToDelete.id, version: wayToDelete.version, tags: { [TAGS.GEOMETRY_PRECISION_AFFECTED]: 'true' } });
      expect(change.delete).toMatchObject(expect.arrayContaining(wayToDelete.nodes));
    });
  });

  describe('#getChangeFromPolygon', function () {
    it('should create a way with all its points and no tags', function () {
      const polygon: FlattenedGeoJSONPolygon = {
        type: 'Feature',
        properties: undefined,
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [35.200434, 31.7697903, 1],
              [35.3002677, 31.7696671, 2],
              [35.200611, 31.7694414, 3],
              [35.200434, 31.7697903, 1],
            ],
          ],
        },
      };

      const change = getChangeFromPolygon({ action: Actions.CREATE, feature: polygon, generatorValue: 'test', options: { shouldHandleLOD2: false } });

      expect(change).toHaveChangeActionLengths(polygon.geometry.coordinates[0].length, 0, 0);
      expect(change).toHaveProperty('generator', 'test');

      const way = change.create?.find((elm) => elm.type === 'way') as OsmWay;
      expect(way).toBeDefined();
      expect(way).toHaveProperty('version', 0);
      expect(way.tags).toBeUndefined();

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
        expect(createdNode).toMatchObject({ lon, lat, id: nodeInWay.id, tags: {} });
        expect(createdNode).toHaveProperty('version', 0);
      }
    });

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

    it('should create a way which has altitudes with all its points', function () {
      const polygon: FlattenedGeoJSONPolygon = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [35.200434, 31.7697903, 1],
              [35.3002677, 31.7696671, 2],
              [35.200611, 31.7694414, 3],
              [35.200434, 31.7697903, 4],
            ],
          ],
        },
      };

      const change = getChangeFromPolygon({ action: Actions.CREATE, feature: polygon, generatorValue: 'test', options: { shouldHandleLOD2: true } });

      expect(change).toHaveChangeActionLengths(polygon.geometry.coordinates[0].length, 0, 0);
      expect(change).toHaveProperty('generator', 'test');

      const way = change.create?.find((elm) => elm.type === 'way') as OsmWay;

      expect(way).toBeDefined();
      expect(way).toHaveProperty('version', 0);
      expect(way).toHaveProperty('tags.dog', 'meow');

      const idSet = new Set<number>([way.id]);
      expect(way.nodes).toMatchPositionOrder3D(polygon.geometry.coordinates[0]);

      const length = polygon.geometry.coordinates[0].length - 1;
      expect(way.nodes[0].id).toEqual(way.nodes[length].id);
      // checks that each id is unique, and a matching node is created for it.
      for (let i = 0; i < length; i++) {
        const [lon, lat, alt] = polygon.geometry.coordinates[0][i];

        const nodeInWay = way.nodes[i];
        expect(idSet).not.toContain(nodeInWay.id);
        idSet.add(nodeInWay.id);

        const createdNode = change.create?.find((elm) => elm.id === nodeInWay.id);
        expect(createdNode).toBeDefined();
        expect(createdNode).toMatchObject({ lon, lat, id: nodeInWay.id });
        expect(createdNode).toHaveProperty('version', 0);
        expect(createdNode).toHaveProperty(`tags.${TAGS.ALTITUDE}`, alt.toString());
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

    it('should delete the way (whitch has altitudes) and all the nodes', function () {
      const wayToDelete: OsmWay = {
        id: 1,
        version: 2,
        type: 'way',
        nodes: [
          { id: 2, lat: 34, lon: 35, version: 2, type: 'node', tags: { [TAGS.ALTITUDE]: '1' } },
          { id: 3, lat: 35, lon: 36, version: 1, type: 'node' },
          { id: 4, lat: 36, lon: 37, version: 1, type: 'node', tags: { [TAGS.ALTITUDE]: '2' } },
          { id: 2, lat: 34, lon: 35, version: 2, type: 'node', tags: { [TAGS.ALTITUDE]: '1' } },
        ],
      };

      const change = getChangeFromPolygon({ action: Actions.DELETE, oldElement: wayToDelete });

      wayToDelete.nodes.forEach((node) => {
        const deletedNodes = change.delete?.filter((elm) => elm.id === node.id) as BaseElement[];
        expect(deletedNodes).toHaveLength(1);
        expect(deletedNodes[0]).toHaveProperty('version', node.version);
        if (node.tags?.[TAGS.ALTITUDE] !== undefined) {
          expect(deletedNodes[0]).toHaveProperty(`tags.${TAGS.ALTITUDE}`, node.tags[TAGS.ALTITUDE].toString());
        } else {
          expect(deletedNodes[0]).not.toHaveProperty(`tags.${TAGS.ALTITUDE}`);
        }
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

    it('should only modify the way (which has altitudes) tags if only tags were changed', function () {
      const polygon: FlattenedGeoJSONPolygon = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [35, 34, 1],
              [36, 35, 2],
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
          { id: 2, lat: 34, lon: 35, version: 2, type: 'node', tags: { [TAGS.ALTITUDE]: '1' } },
          { id: 3, lat: 35, lon: 36, version: 1, type: 'node', tags: { [TAGS.ALTITUDE]: '2' } },
        ],
      };

      const change = getChangeFromPolygon({ action: Actions.MODIFY, oldElement: oldWay, feature: polygon });

      expect(change).toHaveChangeActionLengths(0, 1, 0);
      const way = (change.modify as OsmWay[])[0];

      expect(way).toHaveProperty('tags.dog', 'meow');
      expect(way).not.toHaveProperty('tags.cat', 'bark');

      const length = polygon.geometry.coordinates[0].length - 1;
      // checks that each id is unique, and a matching node is created for it.
      for (let i = 0; i < length; i++) {
        const [lon, lat] = polygon.geometry.coordinates[0][i];

        const nodeInWay = way.nodes[i];
        const node = way.nodes.find((elm) => elm.id === nodeInWay.id);
        expect(node).toBeDefined();
        expect(node).toMatchObject({ lon, lat, id: nodeInWay.id });
        expect(node).toHaveProperty('version', oldWay.nodes[i].version);
        expect(node).not.toHaveProperty(`tags.${TAGS.ALTITUDE}`);
      }
    });

    it('should only modify the way (which has altitudes) tags if only altitude tag was changed', function () {
      const polygon: FlattenedGeoJSONPolygon = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [35, 34],
              [36, 35, 3],
            ],
          ],
        },
      };
      const oldWay: OsmWay = {
        id: 1,
        version: 2,
        type: 'way',
        nodes: [
          { id: 2, lat: 34, lon: 35, version: 2, type: 'node', tags: { [TAGS.ALTITUDE]: '1' } },
          { id: 3, lat: 35, lon: 36, version: 1, type: 'node', tags: { [TAGS.ALTITUDE]: '2' } },
        ],
      };

      const change = getChangeFromPolygon({ action: Actions.MODIFY, oldElement: oldWay, feature: polygon, options: { shouldHandleLOD2: true } });

      expect(change).toHaveChangeActionLengths(0, 1, 0);
      const way = (change.modify as OsmWay[])[0];

      const length = polygon.geometry.coordinates[0].length - 1;
      // checks that each id is unique, and a matching node is created for it.
      for (let i = 0; i < length; i++) {
        const [lon, lat, alt] = polygon.geometry.coordinates[0][i];

        const nodeInWay = way.nodes[i];
        const node = way.nodes.find((elm) => elm.id === nodeInWay.id);
        expect(node).toBeDefined();
        expect(node).toMatchObject({ lon, lat, id: nodeInWay.id });
        expect(node).toHaveProperty('version', oldWay.nodes[i].version);
        if ((alt as number | undefined) !== undefined) {
          expect(nodeInWay).toHaveProperty(`tags.${TAGS.ALTITUDE}`, alt.toString());
        } else {
          expect(nodeInWay).not.toHaveProperty(`tags.${TAGS.ALTITUDE}`);
        }
      }
    });

    it('should only change the order of the nodes', function () {
      const polygon: FlattenedGeoJSONPolygon = {
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

      const change = getChangeFromPolygon({ action: Actions.MODIFY, oldElement: oldWay, feature: polygon });

      expect(change).toHaveChangeActionLengths(0, 1, 0);
      const way = (change.modify as OsmWay[])[0];

      expect(way.nodes).toMatchPositionOrder(polygon.geometry.coordinates[0]);
    });

    it('should only change the order of the nodes to a polygon with altitudes', function () {
      const polygon: FlattenedGeoJSONPolygon = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [35, 34, 1],
              [35, 36, 2],
              [33, 32, 3],
              [35, 34, 1],
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
          { id: 2, lat: 34, lon: 35, version: 2, type: 'node', tags: { [TAGS.ALTITUDE]: '1' } },
          { id: 3, lat: 32, lon: 33, version: 1, type: 'node', tags: { [TAGS.ALTITUDE]: '2' } },
          { id: 4, lat: 36, lon: 35, version: 1, type: 'node', tags: { [TAGS.ALTITUDE]: '3' } },
          { id: 2, lat: 34, lon: 35, version: 2, type: 'node', tags: { [TAGS.ALTITUDE]: '4' } },
        ],
      };

      const change = getChangeFromPolygon({ action: Actions.MODIFY, oldElement: oldWay, feature: polygon, options: { shouldHandleLOD2: true } });

      expect(change).toHaveChangeActionLengths(0, 1, 0);
      const way = (change.modify as OsmWay[])[0];

      expect(way.nodes).toMatchPositionOrder3D(polygon.geometry.coordinates[0]);
    });

    it('should add a new node and modify the way', function () {
      const polygon: FlattenedGeoJSONPolygon = {
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

      const change = getChangeFromPolygon({ action: Actions.MODIFY, oldElement: oldWay, feature: polygon });

      expect(change).toHaveChangeActionLengths(1, 1, 0);
      const way = (change.modify as OsmWay[])[0];
      const node = (change.create as OsmNode[])[0];

      expect(way.nodes).toMatchPositionOrder(polygon.geometry.coordinates[0]);
      expect(node).toMatchObject({ lon: 32, lat: 33, id: way.nodes[3].id, version: 0 });
      expect(node.id).toBeLessThanOrEqual(0);
    });

    it('should add a new node and modify the way which has altitude', function () {
      const polygon: FlattenedGeoJSONPolygon = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [37, 36, 1],
              [36, 35],
              [35, 34, 3],
              [32, 33],
              [37, 36, 1],
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
          { id: 2, lat: 36, lon: 37, version: 2, type: 'node', tags: { [TAGS.ALTITUDE]: '1' } },
          { id: 3, lat: 35, lon: 36, version: 1, type: 'node' },
          { id: 4, lat: 34, lon: 35, version: 1, type: 'node', tags: { [TAGS.ALTITUDE]: '3' } },
          { id: 2, lat: 36, lon: 37, version: 2, type: 'node', tags: { [TAGS.ALTITUDE]: '1' } },
        ],
      };

      const change = getChangeFromPolygon({ action: Actions.MODIFY, oldElement: oldWay, feature: polygon });

      expect(change).toHaveChangeActionLengths(1, 1, 0);
      const way = (change.modify as OsmWay[])[0];
      const node = (change.create as OsmNode[])[0];

      expect(way.nodes).toMatchPositionOrder3D(polygon.geometry.coordinates[0]);
      expect(node).toMatchObject({ lon: 32, lat: 33, id: way.nodes[3].id, version: 0 });
      expect(node.id).toBeLessThanOrEqual(0);
    });

    it('should modify an existing node when a point in polygon is changed', function () {
      const polygon: FlattenedGeoJSONPolygon = {
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

      const change = getChangeFromPolygon({ action: Actions.MODIFY, oldElement: oldWay, feature: polygon });

      expect(change).toHaveChangeActionLengths(0, 2, 0);

      const way = change.modify?.find((elm) => elm.type === 'way') as OsmWay;
      const node = change.modify?.find((elm) => elm.type === 'node') as OsmNode;

      expect(way.nodes).toMatchPositionOrder(polygon.geometry.coordinates[0]);
      expect(node).toMatchObject({ lon: 37, lat: 35, id: way.nodes[2].id, version: 1 });
    });

    it('should modify an existing node when a point in polygon (which has altitudes) is changed', function () {
      const polygon: FlattenedGeoJSONPolygon = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [32, 32, 1],
              [35, 34, 2],
              [37, 35, 3],
              [32, 32, 4],
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
          { id: 2, lat: 32, lon: 32, version: 2, type: 'node', tags: { [TAGS.ALTITUDE]: '1' } },
          { id: 3, lat: 34, lon: 35, version: 1, type: 'node', tags: { [TAGS.ALTITUDE]: '2' } },
          { id: 4, lat: 36, lon: 35, version: 1, type: 'node', tags: { [TAGS.ALTITUDE]: '3' } },
          { id: 2, lat: 32, lon: 32, version: 2, type: 'node', tags: { [TAGS.ALTITUDE]: '4' } },
        ],
      };

      const change = getChangeFromPolygon({ action: Actions.MODIFY, oldElement: oldWay, feature: polygon });

      expect(change).toHaveChangeActionLengths(0, 2, 0);

      const way = change.modify?.find((elm) => elm.type === 'way') as OsmWay;
      const node = change.modify?.find((elm) => elm.type === 'node') as OsmNode;

      expect(way.nodes).toMatchPositionOrder3D(polygon.geometry.coordinates[0]);
      expect(node).toMatchObject({ lon: 37, lat: 35, id: way.nodes[2].id, version: 1 });
    });

    it('should only change the order of the nodes when order is changed', function () {
      const polygon: FlattenedGeoJSONPolygon = {
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

      const change = getChangeFromPolygon({ action: Actions.MODIFY, oldElement: oldWay, feature: polygon });

      expect(change).toHaveChangeActionLengths(0, 1, 0);

      const way = (change.modify as OsmWay[])[0];

      expect(way.nodes).toMatchPositionOrder(polygon.geometry.coordinates[0]);
      expect(way.nodes[1].id).toEqual(oldWay.nodes[2].id);
      expect(way.nodes[2].id).toEqual(oldWay.nodes[1].id);
    });

    it('should only change the order of the nodes when order is changed in a polygon which has altitudes', function () {
      const polygon: FlattenedGeoJSONPolygon = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [36, 35, 1],
              [35, 34, 2],
              [37, 36, 3],
              [36, 35, 4],
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
          { id: 2, lat: 35, lon: 36, version: 2, type: 'node', tags: { [TAGS.ALTITUDE]: '1' } },
          { id: 3, lat: 36, lon: 37, version: 1, type: 'node', tags: { [TAGS.ALTITUDE]: '2' } },
          { id: 4, lat: 34, lon: 35, version: 1, type: 'node', tags: { [TAGS.ALTITUDE]: '3' } },
          { id: 2, lat: 35, lon: 36, version: 2, type: 'node', tags: { [TAGS.ALTITUDE]: '4' } },
        ],
      };

      const change = getChangeFromPolygon({ action: Actions.MODIFY, oldElement: oldWay, feature: polygon });

      expect(change).toHaveChangeActionLengths(0, 1, 0);

      const way = (change.modify as OsmWay[])[0];

      expect(way.nodes).toMatchPositionOrder3D(polygon.geometry.coordinates[0]);
      expect(way.nodes[1].id).toEqual(oldWay.nodes[2].id);
      expect(way.nodes[2].id).toEqual(oldWay.nodes[1].id);
    });

    it('should delete the node when a position is removed', function () {
      const polygon: FlattenedGeoJSONPolygon = {
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

      const change = getChangeFromPolygon({ action: Actions.MODIFY, oldElement: oldWay, feature: polygon });

      expect(change).toHaveChangeActionLengths(0, 1, 1);

      const way = (change.modify as OsmWay[])[0];
      const node = (change.delete as OsmNode[])[0];

      expect(way.nodes).toMatchPositionOrder(polygon.geometry.coordinates[0]);
      expect(node).toMatchObject(oldWay.nodes[3]);
    });

    it('should delete the node when a position is removed on a polygon which has altitudes', function () {
      const polygon: FlattenedGeoJSONPolygon = {
        type: 'Feature',
        properties: { dog: 'meow' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [35, 34, 1],
              [36, 35],
              [37, 36, 3],
              [35, 34, 1],
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
          { id: 2, lat: 34, lon: 35, version: 2, type: 'node', tags: { [TAGS.ALTITUDE]: '1' } },
          { id: 3, lat: 35, lon: 36, version: 1, type: 'node' },
          { id: 4, lat: 36, lon: 37, version: 2, type: 'node', tags: { [TAGS.ALTITUDE]: '3' } },
          { id: 5, lat: 36, lon: 38, version: 1, type: 'node' },
          { id: 2, lat: 34, lon: 35, version: 2, type: 'node', tags: { [TAGS.ALTITUDE]: '1' } },
        ],
      };

      const change = getChangeFromPolygon({ action: Actions.MODIFY, oldElement: oldWay, feature: polygon });

      expect(change).toHaveChangeActionLengths(0, 1, 1);

      const way = (change.modify as OsmWay[])[0];
      const node = (change.delete as OsmNode[])[0];

      expect(way.nodes).toMatchPositionOrder3D(polygon.geometry.coordinates[0]);
      expect(node).toMatchObject(oldWay.nodes[3]);
    });
  });

  it('should create a polygon with affected precision and attribute it', function () {
    const polygon: FlattenedGeoJSONPolygon = {
      type: 'Feature',
      properties: { dog: 'meow' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [35.2004341111, 31.76979032222, 1],
            [35.30026773333, 31.76966714444, 2],
            [35.2006115555, 31.76944146666, 3],
            [35.2004341111, 31.76979032222, 4],
          ],
        ],
      },
    };

    const change = getChangeFromPolygon({
      action: Actions.CREATE,
      feature: polygon,
      generatorValue: 'test',
      options: { shouldHandleLOD2: true, shouldHandlePrecision: true },
    });

    expect(change).toHaveChangeActionLengths(polygon.geometry.coordinates[0].length, 0, 0);
    expect(change).toHaveProperty('generator', 'test');

    const way = change.create?.find((elm) => elm.type === 'way') as OsmWay;

    expect(way).toBeDefined();
    expect(way).toHaveProperty('version', 0);
    expect(way).toHaveProperty('tags.dog', 'meow');
    expect(way).toHaveProperty(`tags.${TAGS.GEOMETRY_PRECISION_AFFECTED}`, 'true');

    const idSet = new Set<number>([way.id]);
    expect(way.nodes).toMatchPositionOrder3D(polygon.geometry.coordinates[0].map(([lon, lat, alt]) => [lon, lat, alt]));

    const length = polygon.geometry.coordinates[0].length - 1;
    expect(way.nodes[0].id).toEqual(way.nodes[length].id);
    // checks that each id is unique, and a matching node is created for it.
    for (let i = 0; i < length; i++) {
      const [lon, lat, alt] = polygon.geometry.coordinates[0][i];

      const nodeInWay = way.nodes[i];
      expect(idSet).not.toContain(nodeInWay.id);
      idSet.add(nodeInWay.id);

      const createdNode = change.create?.find((elm) => elm.id === nodeInWay.id);
      expect(createdNode).toBeDefined();
      expect(createdNode).toMatchObject({
        lon,
        lat,
        id: nodeInWay.id,
      });
      expect(createdNode).toHaveProperty('version', 0);
      expect(createdNode).toHaveProperty(`tags.${TAGS.ALTITUDE}`, alt.toString());
      expect(createdNode).toHaveProperty(`tags.${TAGS.PRECISED_LON}`, lon.toString());
      expect(createdNode).toHaveProperty(`tags.${TAGS.PRECISED_LAT}`, lat.toString());
    }
  });

  it('should modify a polygon with affected precision and attribute it', function () {
    const polygon: FlattenedGeoJSONPolygon = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [35.20041111, 31.769792222, 1],
            [35.12345678, 31.76, 2],
            [35, 31],
            [35.20041111, 31.769792222, 1],
          ],
        ],
      },
    };

    const oldWay: OsmWay = {
      id: 1,
      version: 2,
      type: 'way',
      nodes: [
        { id: 2, lon: 31, lat: 32, version: 2, type: 'node' },
        { id: 3, lon: 33, lat: 34, version: 1, type: 'node' },
        { id: 4, lon: 35, lat: 36, version: 1, type: 'node' },
        { id: 2, lon: 31, lat: 32, version: 2, type: 'node' },
      ],
    };

    const change = getChangeFromPolygon({
      action: Actions.MODIFY,
      oldElement: oldWay,
      feature: polygon,
      options: { shouldHandlePrecision: true, shouldHandleLOD2: true },
    });

    expect(change).toHaveChangeActionLengths(0, 4, 0);

    const way = (change.modify as OsmWay[])[0];
    expect(way).toBeDefined();
    expect(way).toHaveProperty('version', 2);
    expect(way).toHaveProperty(`tags.${TAGS.GEOMETRY_PRECISION_AFFECTED}`, 'true');

    expect(way.nodes).toMatchPositionOrder3D(polygon.geometry.coordinates[0]);

    const length = polygon.geometry.coordinates[0].length - 1;
    expect(way.nodes[0].id).toEqual(way.nodes[length].id);
    // checks that each id is unique, and a matching node is created for it.
    for (let i = 0; i < length; i++) {
      const [lon, lat, alt] = polygon.geometry.coordinates[0][i];

      const nodeInWay = way.nodes[i];

      const node = [...(change.create ?? []), ...(change.modify ?? [])].find((elm) => elm.id === nodeInWay.id);
      expect(node).toBeDefined();
      expect(node).toMatchObject({ lon, lat, id: nodeInWay.id });

      expect(nodeInWay).toHaveProperty(`tags.${TAGS.PRECISED_LON}`, lon.toString());
      expect(nodeInWay).toHaveProperty(`tags.${TAGS.PRECISED_LAT}`, lat.toString());

      if ((alt as number | undefined) !== undefined) {
        expect(nodeInWay).toHaveProperty(`tags.${TAGS.ALTITUDE}`, alt.toString());
      } else {
        expect(nodeInWay).not.toHaveProperty(`tags.${TAGS.ALTITUDE}`);
      }
    }
  });

  it('should modify a polygon with affected precision and re-attribute it', function () {
    const polygon: FlattenedGeoJSONPolygon = {
      type: 'Feature',
      properties: { dog: 'meow' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [35.2004341111, 31.76979032222, 1],
            [35.1, 31.76966714444, 2],
            [35, 31],
            [35.2004341111, 31.76979032222, 1],
          ],
        ],
      },
    };

    const oldWay: OsmWay = {
      id: 1,
      version: 2,
      tags: { dog: 'meow', [TAGS.GEOMETRY_PRECISION_AFFECTED]: 'true' },
      type: 'way',
      nodes: [
        { id: 2, lon: 35, lat: 31, version: 2, type: 'node', tags: { [TAGS.PRECISED_LON]: '35', [TAGS.PRECISED_LAT]: '31' } },
        {
          id: 3,
          lon: 35.1,
          lat: 31.7696671,
          version: 1,
          type: 'node',
          tags: { [TAGS.PRECISED_LON]: '35.1', [TAGS.PRECISED_LAT]: '31.76966714444' },
        },
        {
          id: 4,
          lon: 35.1234568,
          lat: 31.1234568,
          version: 1,
          type: 'node',
          tags: { [TAGS.PRECISED_LON]: '35.12345678', [TAGS.PRECISED_LAT]: '31.12345678' },
        },
      ],
    };

    const change = getChangeFromPolygon({
      action: Actions.MODIFY,
      oldElement: oldWay,
      feature: polygon,
      options: { shouldHandlePrecision: true, shouldHandleLOD2: true },
    });

    expect(change).toHaveChangeActionLengths(0, 3, 0);

    const way = (change.modify as OsmWay[])[0];
    expect(way).toBeDefined();
    expect(way).toHaveProperty('version', 2);
    expect(way).toHaveProperty('tags.dog', 'meow');
    expect(way).toHaveProperty(`tags.${TAGS.GEOMETRY_PRECISION_AFFECTED}`, 'true');

    expect(way.nodes).toMatchPositionOrder3D(polygon.geometry.coordinates[0]);

    const length = polygon.geometry.coordinates[0].length - 1;
    expect(way.nodes[0].id).toEqual(way.nodes[length].id);
    // checks that each id is unique, and a matching node is created for it.
    for (let i = 0; i < length; i++) {
      const [lon, lat, alt] = polygon.geometry.coordinates[0][i];

      const nodeInWay = way.nodes[i];

      const node = [...(change.create ?? []), ...(change.modify ?? [])].find((elm) => elm.id === nodeInWay.id);
      // node id:2 shouldn't be modified
      if (node) {
        expect(node).toMatchObject({ lon, lat, id: nodeInWay.id });
      }

      expect(nodeInWay).toHaveProperty(`tags.${TAGS.PRECISED_LON}`, lon.toString());
      expect(nodeInWay).toHaveProperty(`tags.${TAGS.PRECISED_LAT}`, lat.toString());

      if ((alt as number | undefined) !== undefined) {
        expect(nodeInWay).toHaveProperty(`tags.${TAGS.ALTITUDE}`, alt.toString());
      } else {
        expect(nodeInWay).not.toHaveProperty(`tags.${TAGS.ALTITUDE}`);
      }
    }
  });

  it('should modify a polygon with unaffected precision and un-attribute it', function () {
    const polygon: FlattenedGeoJSONPolygon = {
      type: 'Feature',
      properties: { dog: 'meow' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [35.1, 31.2, 1],
            [35.3, 31.4, 2],
            [35.5, 31.6],
            [35.1, 31.2, 1],
          ],
        ],
      },
    };

    const oldWay: OsmWay = {
      id: 1,
      version: 2,
      tags: { dog: 'meow', [TAGS.GEOMETRY_PRECISION_AFFECTED]: 'true' },
      type: 'way',
      nodes: [
        { id: 2, lon: 35, lat: 31, version: 2, type: 'node' },
        {
          id: 3,
          lon: 35.1,
          lat: 31.7696671,
          version: 1,
          type: 'node',
          tags: { [TAGS.PRECISED_LON]: '35.1', [TAGS.PRECISED_LAT]: '31.76966714444' },
        },
        {
          id: 4,
          lon: 35.1234568,
          lat: 31.1234568,
          version: 1,
          type: 'node',
          tags: { [TAGS.PRECISED_LON]: '35.12345678', [TAGS.PRECISED_LAT]: '31.12345678' },
        },
      ],
    };

    const change = getChangeFromPolygon({
      action: Actions.MODIFY,
      oldElement: oldWay,
      feature: polygon,
      options: { shouldHandlePrecision: true, shouldHandleLOD2: true },
    });

    expect(change).toHaveChangeActionLengths(0, 4, 0);

    const way = (change.modify as OsmWay[])[0];
    expect(way).toBeDefined();
    expect(way).toHaveProperty('version', 2);
    expect(way).toHaveProperty('tags.dog', 'meow');
    expect(way).not.toHaveProperty(`tags.${TAGS.GEOMETRY_PRECISION_AFFECTED}`);

    expect(way.nodes).toMatchPositionOrder3D(polygon.geometry.coordinates[0]);

    const length = polygon.geometry.coordinates[0].length - 1;
    expect(way.nodes[0].id).toEqual(way.nodes[length].id);
    // checks that each id is unique, and a matching node is created for it.
    for (let i = 0; i < length; i++) {
      const [lon, lat, alt] = polygon.geometry.coordinates[0][i];

      const nodeInWay = way.nodes[i];

      const node = [...(change.create ?? []), ...(change.modify ?? [])].find((elm) => elm.id === nodeInWay.id);
      expect(node).toBeDefined();
      expect(node).toMatchObject({ lon, lat, id: nodeInWay.id });

      expect(nodeInWay).not.toHaveProperty(`tags.${TAGS.PRECISED_LON}`);
      expect(nodeInWay).not.toHaveProperty(`tags.${TAGS.PRECISED_LAT}`);

      if ((alt as number | undefined) !== undefined) {
        expect(nodeInWay).toHaveProperty(`tags.${TAGS.ALTITUDE}`, alt.toString());
      } else {
        expect(nodeInWay).not.toHaveProperty(`tags.${TAGS.ALTITUDE}`);
      }
    }
  });

  it('should delete the way (whitch has altitudes) and all the nodes', function () {
    const wayToDelete: OsmWay = {
      id: 1,
      version: 2,
      tags: { dog: 'meow', [TAGS.GEOMETRY_PRECISION_AFFECTED]: 'true' },
      type: 'way',
      nodes: [
        { id: 2, lon: 35, lat: 31, version: 2, type: 'node' },
        {
          id: 3,
          lon: 35.1,
          lat: 31.7696671,
          version: 1,
          type: 'node',
          tags: { [TAGS.PRECISED_LON]: '35.1', [TAGS.PRECISED_LAT]: '31.76966714444' },
        },
        {
          id: 4,
          lon: 35.1234568,
          lat: 31.1234568,
          version: 1,
          type: 'node',
          tags: { [TAGS.PRECISED_LON]: '35.12345678', [TAGS.PRECISED_LAT]: '31.12345678', [TAGS.ALTITUDE]: '6.66' },
        },
      ],
    };

    const change = getChangeFromPolygon({ action: Actions.DELETE, oldElement: wayToDelete });

    let affectedNodesCount = 0;
    wayToDelete.nodes.forEach((node) => {
      const deletedNodes = change.delete?.filter((elm) => elm.id === node.id) as BaseElement[];
      expect(deletedNodes).toHaveLength(1);
      expect(deletedNodes[0]).toHaveProperty('version', node.version);

      if (node.tags?.[TAGS.PRECISED_LON] !== undefined || node.tags?.[TAGS.PRECISED_LAT] !== undefined) {
        affectedNodesCount++;
        expect(node).toHaveProperty(`tags.${TAGS.PRECISED_LON}`, node.tags[TAGS.PRECISED_LON].toString());
        expect(node).toHaveProperty(`tags.${TAGS.PRECISED_LAT}`, node.tags[TAGS.PRECISED_LAT].toString());
      } else {
        expect(node).not.toHaveProperty(`tags.${TAGS.PRECISED_LON}`);
        expect(node).not.toHaveProperty(`tags.${TAGS.PRECISED_LAT}`);
      }

      if (node.tags?.[TAGS.ALTITUDE] !== undefined) {
        expect(deletedNodes[0]).toHaveProperty(`tags.${TAGS.ALTITUDE}`, node.tags[TAGS.ALTITUDE].toString());
      } else {
        expect(deletedNodes[0]).not.toHaveProperty(`tags.${TAGS.ALTITUDE}`);
      }
    });

    expect(affectedNodesCount).toBe(2);

    const way = change.delete?.find((elm) => elm.type === 'way') as OsmWay;
    expect(way).toMatchObject({ id: wayToDelete.id, version: wayToDelete.version, tags: { [TAGS.GEOMETRY_PRECISION_AFFECTED]: 'true' } });
    expect(change.delete).toMatchObject(expect.arrayContaining(wayToDelete.nodes));
  });

  it('should create highly precised geometry and create a polygon with affected precision and attribute it', function () {
    const polygon: FlattenedGeoJSONPolygon = {
      type: 'Feature',
      properties: { dog: 'meow' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [35.123456789, 31.123456789],
            [35.1234567891, 31.1234567891],
            [35.1234567892, 31.1234567892],
            [35.1234567893, 31.1234567893],
            [35.1234567894, 31.1234567894],
            [35.1234567895, 31.1234567895],
            [35.1234567896, 31.1234567896],
            [35.1234567897, 31.1234567897],
            [35.1234567898, 31.1234567898],
            [35.1234567899, 31.1234567899],
            [35.123456789, 31.123456789],
          ],
        ],
      },
    };

    const change = getChangeFromPolygon({
      action: Actions.CREATE,
      feature: polygon,
      generatorValue: 'test',
      options: { shouldHandlePrecision: true },
    });

    expect(change).toHaveChangeActionLengths(polygon.geometry.coordinates[0].length, 0, 0);
    expect(change).toHaveProperty('generator', 'test');
    const way = change.create?.find((elm) => elm.type === 'way') as OsmWay;

    expect(way).toBeDefined();
    expect(way).toHaveProperty('version', 0);
    expect(way).toHaveProperty('tags.dog', 'meow');
    expect(way).toHaveProperty(`tags.${TAGS.GEOMETRY_PRECISION_AFFECTED}`, 'true');

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
      expect(createdNode).toHaveProperty(`tags.${TAGS.PRECISED_LON}`, lon.toString());
      expect(createdNode).toHaveProperty(`tags.${TAGS.PRECISED_LAT}`, lat.toString());
    }
  });
});
