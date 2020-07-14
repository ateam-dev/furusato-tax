import {
  TaxType,
  ChallengedFamilyMemberCounts,
  CHALLENGED_DEDUCTION_AMOUNTS_INCOME,
  CHALLENGED_DEDUCTION_AMOUNTS_RESIDENT
} from "../config";

function challengedDeductionAmounts(taxType: TaxType): { [K in keyof Required<ChallengedFamilyMemberCounts>]: number } {
  switch (taxType) {
    case TaxType.Income:
      return CHALLENGED_DEDUCTION_AMOUNTS_INCOME;
    case TaxType.Resident:
      return CHALLENGED_DEDUCTION_AMOUNTS_RESIDENT;
    default:
      throw new Error(`Unexpected TaxType: ${taxType}.`);
  }
}

/** 障害者控除 */
export default function(family?: ChallengedFamilyMemberCounts): (taxType: TaxType) => number {
  if (family === undefined) return _x => 0;
  return taxType => {
    const deductionAmounts = challengedDeductionAmounts(taxType);

    return Object.entries(family).reduce((acc, [key, value]) => {
      if (value === undefined) return acc;

      return acc + deductionAmounts[key as keyof typeof family] * value;
    }, 0);
  };
}
