import { TaxType, MEDICAL_EXPENSES_DEDUCTION_LIMIT } from "../config";

/** 医療費控除 */
export default function(medicalExpensesDeductionAmount?: number): (_taxType: TaxType) => number {
  if (medicalExpensesDeductionAmount === undefined) return _x => 0;
  // 所得税でも住民税でも、「その年に実際に支払った金額」で一致
  return _taxType => Math.min(medicalExpensesDeductionAmount, MEDICAL_EXPENSES_DEDUCTION_LIMIT);
}
