import { TaxType, EARTHQUAKE_INSURANCE_DEDUCTION_LIMIT } from "../config";

/** 地震保険控除 */
export default function (earthquakeInsuranceAmount?: number): (taxType: TaxType) => number {
  if (earthquakeInsuranceAmount === undefined) return _x => 0;

  return (taxType) => {
    let deduction = earthquakeInsuranceAmount;
    if (taxType === TaxType.Resident) deduction = Math.floor(deduction / 2);
    return Math.min(deduction, EARTHQUAKE_INSURANCE_DEDUCTION_LIMIT[taxType]);
  }
}
