import {
  TaxType,
  SpouseLossType,
  LOST_SPOUSE_DEDUCTION_INCOME,
  LOST_SPECIFIC_DEDUCTION_INCOME,
  LOST_SPECIFIC_DEDUCTION_RESIDENT,
  LOST_SPOUSE_DEDUCTION_RESIDENT
} from "../config";

/** 寡婦控除 */
export default function(isExistPartner?: boolean, spouseLossType?: SpouseLossType): (taxType: TaxType) => number {
  if (isExistPartner) return _x => 0;

  return taxType => {
    switch (spouseLossType) {
      case SpouseLossType.lossHusband:
      case SpouseLossType.lossWife:
        return taxType === TaxType.Income ? LOST_SPOUSE_DEDUCTION_INCOME : LOST_SPOUSE_DEDUCTION_RESIDENT;
      case SpouseLossType.specificLossHusband:
        return taxType === TaxType.Income ? LOST_SPECIFIC_DEDUCTION_INCOME : LOST_SPECIFIC_DEDUCTION_RESIDENT;
      default:
        return 0;
    }
  }
}
