import { TaxType } from "../config";
import socialInsuranceDeduction from "./socialInsuranceDeduction";

describe("socialInsuranceDeduction()", () => {
  const subject = (taxType: TaxType, socialInsuranceAmount?: number) => {
    return socialInsuranceDeduction(socialInsuranceAmount)(taxType);
  };

  it("社会保険料控除を計算できる", () => {
    expect(subject(TaxType.Income)).toBe(0);
    expect(subject(TaxType.Resident)).toBe(0);
    expect(subject(TaxType.Income, 20_000)).toBe(20_000);
    expect(subject(TaxType.Resident, 20_000)).toBe(20_000);
  });
});
