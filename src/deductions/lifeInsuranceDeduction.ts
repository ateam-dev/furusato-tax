import { TaxType, LIFE_INSURANCE_DEDUCTION_LIMIT } from "../config";

/** 生命保険控除 */
export default function(lifeInsuranceDeductionAmount?: number): (taxType: TaxType) => number {
  if (lifeInsuranceDeductionAmount === undefined) return _x => 0;
  return taxType => Math.min(lifeInsuranceDeductionAmount, LIFE_INSURANCE_DEDUCTION_LIMIT[taxType]);
}
