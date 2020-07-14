import { TaxType, DependentFamilyMemberCounts, DEPENDANT_DEDUCTION_AMOUNTS_INCOME, DEPENDANT_DEDUCTION_AMOUNTS_RESIDENT } from "../config";

/** 扶養控除 */
export default function(family?: DependentFamilyMemberCounts): (taxType: TaxType) => number {
  if (family === undefined) return _x => 0;
  return taxType => {
    const deductionAmounts = dependantDeductionAmounts(taxType);

    return Object.entries(family).reduce((acc, [key, value]) => {
      if (value === undefined) return acc;

      return acc + deductionAmounts[key as keyof typeof family] * value;
    }, 0);
  }
}

function dependantDeductionAmounts(taxType: TaxType): { [K in keyof Required<DependentFamilyMemberCounts>]: number } {
  switch (taxType) {
    case TaxType.Income:
      return DEPENDANT_DEDUCTION_AMOUNTS_INCOME;
    case TaxType.Resident:
      return DEPENDANT_DEDUCTION_AMOUNTS_RESIDENT;
    default:
      throw new Error(`Unexpected TaxType: ${taxType}.`);
  }
}
