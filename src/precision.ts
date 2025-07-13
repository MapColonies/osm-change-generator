import { Position } from 'geojson';
import { extractCoordinateValues } from './helpers';

const DEFAULT_PRECISION = 7;
const PRECISION_SCALE_BASE = 10;

function getPrecisionScale(precision: number): number {
  return PRECISION_SCALE_BASE ** precision;
}

function imprecisionFn(input: number, precision: number): number {
  const precisionScale = getPrecisionScale(precision);
  return Math.round(input * precisionScale) / precisionScale;
}

export function isPrecisionAffected(coordinates: Position[], precision: number = DEFAULT_PRECISION): boolean {
  // execute imprecisionFn on each coordinate to see if affected the precision
  return coordinates.some((coord) => {
    const [lon, lat] = extractCoordinateValues(coord);
    const impreciseLon = imprecisionFn(lon, precision);
    const impreciseLat = imprecisionFn(lat, precision);
    return lon !== impreciseLon || lat !== impreciseLat;
  });
}
