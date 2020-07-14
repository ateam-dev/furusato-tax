import { TaxType, BASIC_DEDUCTION } from "../config";

/** 基礎控除 */
export default function(taxType: TaxType): number {
  return BASIC_DEDUCTION[taxType];
}
