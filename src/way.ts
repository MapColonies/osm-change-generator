import { OsmWay, OsmNode, OsmChange } from '@map-colonies/node-osm-elements';
import { Feature, Polygon, LineString, Position } from 'geojson';
import { isFeatureCoordinatesClosed, createEmptyChange, extractCoordinates, extractCoordinateValues } from './helpers';
import { IdGenerator } from './idGenerator';
import { Tags, Actions } from './models';
import { createNode } from './node';
import { ALTITUDE_TAG } from './constants';

const createWayNodes = (coordinates: Position[], idGenerator: IdGenerator, oldWay?: OsmWay, shouldHandle3D?: boolean): [OsmNode[], Set<number>] => {
  const nodes: OsmNode[] = [];
  const usedNodeIds = new Set<number>();
  const isWayClosed = isFeatureCoordinatesClosed(coordinates);

  // calculate the number of nodes to loop over
  const coordinatesToAdd = isWayClosed ? coordinates.length - 1 : coordinates.length;

  for (let i = 0; i < coordinatesToAdd; i++) {
    const [lon, lat, alt] = extractCoordinateValues(coordinates[i]);

    const existingNode = oldWay ? doesNodeExistsInWay(coordinates[i], oldWay) : undefined;

    // remove pre change altitude tag
    if (shouldHandle3D === true && existingNode?.tags !== undefined) {
      delete existingNode.tags[ALTITUDE_TAG];
    }

    const existingTags = existingNode?.tags !== undefined ? existingNode.tags : {};

    const node = createNode({
      lon,
      lat,
      version: existingNode?.version ?? 0,
      id: existingNode?.id ?? idGenerator.getId(),
      tags: shouldHandle3D === true && alt !== undefined ? { ...existingTags, altitude: alt.toString() } : { ...existingTags },
    });

    nodes.push(node);

    if (existingNode) {
      usedNodeIds.add(existingNode.id);
    }
  }

  if (isWayClosed) {
    nodes.push(nodes[0]);
  }

  return [nodes, usedNodeIds];
};

const isWayClosed = (nodes: OsmNode[]): boolean => nodes[0].id === nodes[nodes.length - 1].id;

const doesNodeExistsInWay = (coordinate: Position, way: OsmWay): OsmNode | undefined =>
  way.nodes.find((node) => node.lon === coordinate[0] && node.lat === coordinate[1]);

const isNodeNew = (node: OsmNode): boolean => node.id <= 0;

const addNodeToChange = (action: Actions, node: OsmNode, change: OsmChange, orphanNodes: OsmNode[]): void => {
  // delete all nodes
  if (action === Actions.DELETE) {
    change.delete?.push(node);
    return;
  }

  if (isNodeNew(node)) {
    // check if there are nodes that we can reuse
    if (orphanNodes.length > 0) {
      const orphanedNode = orphanNodes.pop() as OsmNode;
      node.id = orphanedNode.id;
      node.version = orphanedNode.version;
      change.modify?.push(node);
    } else {
      change.create?.push(node);
    }
  }
};

export const createChangeFromWay = (action: Actions, way: OsmWay, orphanNodes: OsmNode[]): OsmChange => {
  const change: OsmChange = createEmptyChange();

  // add the way to the proper part
  change[action]?.push(way);
  const nodes = way.nodes;

  // check if way is closed
  const nodesToAddNumber = isWayClosed(nodes) ? nodes.length - 1 : nodes.length;

  for (let i = 0; i < nodesToAddNumber; i++) {
    const node = nodes[i];
    addNodeToChange(action, node, change, orphanNodes);
  }

  // delete all unused nodes
  orphanNodes.forEach((node) => change.delete?.push(node));

  return change;
};

export const createWay = <T extends Feature<Polygon | LineString, Tags>>(
  feature: T,
  oldWay?: OsmWay,
  shouldHandle3D?: boolean
): [OsmWay, OsmNode[]] => {
  const idGenerator = new IdGenerator();

  // get the feature coordinates
  const coordinates = extractCoordinates(feature);

  const way: OsmWay = {
    id: oldWay?.id ?? idGenerator.getId(),
    nodes: [],
    type: 'way',
    version: oldWay?.version ?? 0,
    tags: feature.properties,
  };

  const [nodes, usedNodeIds] = createWayNodes(coordinates, idGenerator, oldWay, shouldHandle3D);

  way.nodes = nodes;

  const unusedNodes = oldWay?.nodes.filter((node) => !usedNodeIds.has(node.id)) ?? [];

  return [way, unusedNodes];
};
