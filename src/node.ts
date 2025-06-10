import { OsmChange, OsmNode } from '@map-colonies/node-osm-elements';
import { DEFAULT_ID, TAGS } from './constants';
import { addTagsConditionally, createEmptyChange, extractCoordinateValues } from './helpers';
import { Actions, CreateNodeArgs, FlattenedGeoJSONPoint } from './models';
import { isPrecisionAffected } from './precision';
import { GetChangeOptions } from '.';

export const createNode = (args: CreateNodeArgs): OsmNode => {
  const { lat, lon, id, tags, version } = args;
  return { id: id ?? DEFAULT_ID, lon, lat, version: version ?? 0, type: 'node', tags };
};

export const createNodeFromPoint = (point: FlattenedGeoJSONPoint, oldNode?: OsmNode, options?: GetChangeOptions): OsmNode => {
  const [lon, lat, alt] = extractCoordinateValues(point.geometry.coordinates);

  const precionAffected = isPrecisionAffected([point.geometry.coordinates]);

  const tags = addTagsConditionally(point.properties, [
    { condition: options?.shouldHandleLOD2 === true && alt !== undefined, tags: { [TAGS.ALTITUDE]: alt } },
    {
      condition: precionAffected,
      tags: { [TAGS.GEOMETRY_PRECISION_AFFECTED]: 'true', [TAGS.PRECISED_LON]: lon, [TAGS.PRECISED_LAT]: lat },
    },
  ]);

  const node = createNode({
    lon,
    lat,
    tags,
  });

  if (oldNode) {
    node.id = oldNode.id;
    node.version = oldNode.version;
  }

  return node;
};

export const createChangeFromNode = (action: Actions, node: OsmNode): OsmChange => {
  const change = createEmptyChange();

  change[action]?.push(node);

  return change;
};
