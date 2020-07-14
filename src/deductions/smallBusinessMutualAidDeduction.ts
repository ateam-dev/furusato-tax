import { TaxType } from "../config";

/** 小規模企業共済等掛金控除 */
export default function(smallBusinessMutualAidAmount?: number): (_taxType: TaxType) => number {
  // 所得税でも住民税でも、「その年に実際に支払った金額」で一致
  if (smallBusinessMutualAidAmount === undefined) return _x => 0;
  return _x => smallBusinessMutualAidAmount;
}
