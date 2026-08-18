import type { Feature, FeatureCollection, Polygon } from "geojson";

export type NeighborhoodCode =
  | "KP01"
  | "KP02"
  | "KP03"
  | "KP04"
  | "KP05"
  | "KP06"
  | "KP07"
  | "KP08"
  | "KP09"
  | "KP10"
  | "KP11"
  | "KP12"
  | "KP13"
  | "KP14"
  | "KP15"
  | "KP16";

export interface NeighborhoodFeatureProperties {
  code: NeighborhoodCode | "WARD";
  name: string;
  kind: "ward" | "neighborhood";
  fillColor: string;
  borderColor: string;
  canToggle: boolean;
}

export type NeighborhoodFeature = Feature<
  Polygon,
  NeighborhoodFeatureProperties
>;

export type NeighborhoodFeatureCollection = FeatureCollection<
  Polygon,
  NeighborhoodFeatureProperties
>;
