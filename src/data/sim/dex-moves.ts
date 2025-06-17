// Type definitions for moves data

export interface MoveData {
  num: number;
  accuracy: true | number;
  basePower: number;
  category: "Physical" | "Special" | "Status";
  name: string;
  pp: number;
  priority: number;
  flags: { [key: string]: number };
  isNonstandard?: "Past" | "Future" | "Unobtainable" | "CAP" | "LGPE" | "Custom";
  isZ?: string;
  critRatio?: number;
  drain?: [number, number];
  secondary?: any;
  target: string;
  type: string;
  contestType?: string;
  [key: string]: any;
}

export interface MoveDataTable {
  [key: string]: MoveData;
}
