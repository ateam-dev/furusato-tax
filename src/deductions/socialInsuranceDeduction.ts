import { TaxType } from "../config";

  /** 社会保険控除 */
export default function(socialInsuranceAmount?: number): (_taxType: TaxType) => number {
  // 所得税でも住民税でも、「その年に実際に支払った金額」で一致
  if (socialInsuranceAmount === undefined) return _x => 0;
  return _x => socialInsuranceAmount;
}
