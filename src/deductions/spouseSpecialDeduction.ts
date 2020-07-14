import {
  TaxType,
  SPOUSE_SPECIAL_DEDUCTION_CONDITIONS,
  SPOUSE_SPECIAL_DEDUCTION_DIFF_CONDITIONS
} from "../config";

/** 配偶者特別控除の対象かどうか */
function isSpouseSpecialDeduction(selfIncome: number, isExistPartner?: boolean): boolean {
  if (!isExistPartner) return false;
  if (selfIncome > 10_000_000) return false;
  return true;
}

/** 配偶者特別控除 */
export function spouseSpecialDeduction(selfIncome: number, spouseIncome?: number, isExistPartner?: boolean): (taxType: TaxType) => number {
  if (!isSpouseSpecialDeduction(selfIncome, isExistPartner)) return _x => 0;
  const partnerIncome = spouseIncome ? spouseIncome : 0;

  return taxType => {
    // 控除のテーブルを取得
    const deductionConditions = SPOUSE_SPECIAL_DEDUCTION_CONDITIONS[taxType].find(e => e.cond(partnerIncome))?.deductions;
    if (deductionConditions === undefined) throw new Error(`Unexpected Income: ${partnerIncome}.`);

    const deduction = deductionConditions.find(e => e.cond(selfIncome))?.deduction;
    if (deduction === undefined) throw new Error(`Unexpected Income: ${selfIncome}.`);

    return deduction;
  }
}

/** 配偶者特別控除の、調整控除における人的控除額の差 */
export function spouseSpecialDeductionDiff(selfIncome: number, spouseIncome?: number, isExistPartner?: boolean): number {
  if (!isSpouseSpecialDeduction(selfIncome, isExistPartner)) return 0;
  const partnerIncome = spouseIncome ? spouseIncome : 0;

  // 控除差額のテーブルを取得
  const deductionConditions = SPOUSE_SPECIAL_DEDUCTION_DIFF_CONDITIONS.find(e => e.cond(selfIncome))?.deductions;
  if (deductionConditions === undefined) throw new Error(`Unexpected Income: ${selfIncome}.`);

  const deduction = deductionConditions.find(e => e.cond(partnerIncome))?.deduction;
  if (deduction === undefined) throw new Error(`Unexpected Income: ${partnerIncome}.`);

  return deduction;
}
