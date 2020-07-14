import { TaxType } from "../config";
import lifeInsuranceDeduction from "./lifeInsuranceDeduction";

describe("lifeInsuranceDeduction()", () => {
  const subject = (taxType: TaxType, lifeInsuranceDeductionAmount?: number) => {
    return lifeInsuranceDeduction(lifeInsuranceDeductionAmount)(taxType);
  }

  it("生命保険控除を計算できる", () => {
    expect(subject(TaxType.Income)).toBe(0);
    expect(subject(TaxType.Resident)).toBe(0);
    expect(subject(TaxType.Income, 50_000)).toBe(50_000);
    expect(subject(TaxType.Resident, 50_000)).toBe(50_000);
    expect(subject(TaxType.Income, 150_000)).toBe(120_000);
    expect(subject(TaxType.Resident, 150_000)).toBe(70_000);
  });
});
