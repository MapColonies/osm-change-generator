import { BaseElement } from '@map-colonies/node-osm-elements';
import { Feature, LineString, Point, Polygon } from 'geojson';

export type Tags = Record<string, string> | undefined;
export type OsmPoint = Feature<Point, Tags>;
export type OsmLine = Feature<LineString, Tags>;
export type OsmPolygon = Feature<Polygon, Tags>;

export interface CreateNodeArgs {
  lon: number;
  lat: number;
  tags?: Tags;
  version?: number;
  id?: number;
}

export interface CreateChangeArgs {
  feature?: Feature;
  osmElement?: BaseElement;
}

export enum Actions {
  CREATE = 'create',
  MODIFY = 'modify',
  DELETE = 'delete',
}
