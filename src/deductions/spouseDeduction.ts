import {
  TaxType,
  SENIOR_SPOUSE_DEDUCTIONS,
  SPOUSE_DEDUCTIONS
} from "../config";

function findSpouseDeductionFor(selfIncome: number, isSeniorSpouse?: boolean): (taxType: TaxType) => number {
  const deductions = (isSeniorSpouse === true ?
    SENIOR_SPOUSE_DEDUCTIONS :
    SPOUSE_DEDUCTIONS
  ).find(e => e.cond(selfIncome))?.deductions; // eslint-disable-line

  if (deductions === undefined) throw new Error(`Unexpected Income: ${selfIncome}.`);

  return taxType => deductions[taxType];
}

/** 配偶者控除 */
export default function(selfIncome: number, isExistSpouse?: boolean, spouseIncome?: number, isSeniorSpouse?: boolean): (taxType: TaxType) => number {
  if (!isExistSpouse) return _x => 0;
  if (spouseIncome === undefined || spouseIncome > 380_000) return _x => 0;
  return taxType => findSpouseDeductionFor(selfIncome, isSeniorSpouse)(taxType);
}
