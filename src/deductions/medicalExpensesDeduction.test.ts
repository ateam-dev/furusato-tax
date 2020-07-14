import { TaxType } from "../config";
import medicalExpensesDeduction from "./medicalExpensesDeduction";

describe("medicalExpensesDeduction()", () => {
  const subject = (taxType: TaxType, medicalExpensesDeductionAmount?: number) => {
    return medicalExpensesDeduction(medicalExpensesDeductionAmount)(taxType);
  }

  it("医療費控除を計算できる", () => {
    expect(subject(TaxType.Income)).toBe(0);
    expect(subject(TaxType.Resident)).toBe(0);
    expect(subject(TaxType.Income, 1_000)).toBe(1_000);
    expect(subject(TaxType.Resident, 1_000)).toBe(1_000);
    expect(subject(TaxType.Income, 2_000_001)).toBe(2_000_000);
    expect(subject(TaxType.Resident, 2_000_001)).toBe(2_000_000);
  });
});
