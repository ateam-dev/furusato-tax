import { TaxType } from "./config";
import { Deduction } from "./deduction";

import medicalExpensesDeduction from "./deductions/medicalExpensesDeduction";
import smallBusinessMutualAidDeduction from "./deductions/smallBusinessMutualAidDeduction";
import earthquakeInsuranceDeduction from "./deductions/earthquakeInsuranceDeduction";
import lifeInsuranceDeduction from "./deductions/lifeInsuranceDeduction";
import socialInsuranceDeduction from "./deductions/socialInsuranceDeduction";
import challengedDeduction from "./deductions/challengedDeduction";
import lostSpouseDeduction from "./deductions/lostSpouseDeduction";
import dependentDeduction from "./deductions/dependentDeduction";
import spouseDeduction from "./deductions/spouseDeduction";
import { spouseSpecialDeduction, spouseSpecialDeductionDiff } from "./deductions/spouseSpecialDeduction";
jest.mock("./deductions/medicalExpensesDeduction");
jest.mock("./deductions/smallBusinessMutualAidDeduction");
jest.mock("./deductions/earthquakeInsuranceDeduction");
jest.mock("./deductions/lifeInsuranceDeduction");
jest.mock("./deductions/socialInsuranceDeduction");
jest.mock("./deductions/challengedDeduction");
jest.mock("./deductions/lostSpouseDeduction");
jest.mock("./deductions/dependentDeduction");
jest.mock("./deductions/spouseDeduction");
jest.mock("./deductions/spouseSpecialDeduction");

describe("Deduction", () => {
  describe("totalPersonalDeductionDiff()", () => {
    const subject = (
      spouseDeductionIncome: number, spouseDeductionResident: number,
      lostSpouseDeductionIncome: number, lostSpouseDeductionResident: number,
      challengedDeductionIncome: number, challengedDeductionResident: number,
      dependentDeductionIncome: number, dependentDeductionResident: number,
      spouseSpecialDeductionDiffAmount: number
    ) => {
      const deduction = new Deduction({}, 1);
      (spouseDeduction as jest.Mock).mockReturnValue((taxType: TaxType) => { return taxType === TaxType.Income ? spouseDeductionIncome : spouseDeductionResident });
      (lostSpouseDeduction as jest.Mock).mockReturnValue((taxType: TaxType) => { return taxType === TaxType.Income ? lostSpouseDeductionIncome : lostSpouseDeductionResident });
      (challengedDeduction as jest.Mock).mockReturnValue((taxType: TaxType) => { return taxType === TaxType.Income ? challengedDeductionIncome : challengedDeductionResident });
      (dependentDeduction as jest.Mock).mockReturnValue((taxType: TaxType) => { return taxType === TaxType.Income ? dependentDeductionIncome : dependentDeductionResident });
      (spouseSpecialDeductionDiff as jest.Mock).mockImplementation(
        (_x: number, _y?: number, _z?: boolean) => spouseSpecialDeductionDiffAmount);

      return deduction.totalPersonalDeductionDiff();
    }

    it("人的控除の差額の合計値を計算できる", () => {
      expect(subject(380_000, 330_000, 0, 0, 3_190_000, 2_410_000, 9_950_000, 7_860_000, 0)).toBe(2_970_000);
      expect(subject(0, 0, 0, 0, 3_190_000, 2_410_000, 9_950_000, 7_860_000, 0)).toBe(2_920_000);
      expect(subject(0, 0, 0, 0, 3_190_000, 2_410_000, 9_950_000, 7_860_000, 30_000)).toBe(2_950_000);
    });
  });

  describe("totalDeductions()", () => {
    const subject = (
      taxType: TaxType,
      spouseDeductionAmount: number,
      spouseSpecialDeductionAmount: number,
      dependentDeductionAmount: number,
      lostSpouseDeductionAmount: number,
      challengedDeductionAmount: number,
      socialInsuranceDeductionAmount: number,
      lifeInsuranceDeductionAmount: number,
      earthquakeInsuranceDeductionAmount: number,
      smallBusinessMutualAidDeductionAmount: number,
      medicalExpensesDeductionAmount: number
    ) => {
      const deduction = new Deduction({}, 1);
      (spouseDeduction as jest.Mock).mockReturnValue((_taxType: TaxType) => spouseDeductionAmount);
      (spouseSpecialDeduction as jest.Mock).mockReturnValue((_taxType: TaxType) => spouseSpecialDeductionAmount);
      (dependentDeduction as jest.Mock).mockReturnValue((_taxType: TaxType) => dependentDeductionAmount);
      (lostSpouseDeduction as jest.Mock).mockReturnValue((_taxType: TaxType) => lostSpouseDeductionAmount);
      (challengedDeduction as jest.Mock).mockReturnValue((_taxType: TaxType) => challengedDeductionAmount);
      (socialInsuranceDeduction as jest.Mock).mockReturnValue((_taxType: TaxType) => socialInsuranceDeductionAmount);
      (lifeInsuranceDeduction as jest.Mock).mockReturnValue((_taxType: TaxType) => lifeInsuranceDeductionAmount);
      (earthquakeInsuranceDeduction as jest.Mock).mockReturnValue((_taxType: TaxType) => earthquakeInsuranceDeductionAmount);
      (smallBusinessMutualAidDeduction as jest.Mock).mockReturnValue((_taxType: TaxType) => smallBusinessMutualAidDeductionAmount);
      (medicalExpensesDeduction as jest.Mock).mockReturnValue((_taxType: TaxType) => medicalExpensesDeductionAmount);
      return deduction.totalDeductions(taxType);
    }

    it("控除合計値を計算できる", () => {
      expect(subject(TaxType.Income, 0, 0, 2_380_000, 0, 670_000, 20_000, 5_000, 50_000, 3_000, 1_000)).toBe(3_509_000);
      expect(subject(TaxType.Resident, 330_000, 0, 2_030_000, 0, 560_000, 20_000, 5_000, 25_000, 3_000, 1_000)).toBe(3_304_000);
    });
  });
});
