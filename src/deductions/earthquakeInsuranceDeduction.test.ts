import { TaxType } from "../config";
import earthquakeInsuranceDeduction from "./earthquakeInsuranceDeduction";

describe("earthquakeInsuranceDeduction()", () => {
  const subject = (taxType: TaxType, earthquakeInsuranceAmount?: number) => {
    return earthquakeInsuranceDeduction(earthquakeInsuranceAmount)(taxType);
  }

  it("地震保険控除を計算できる", () => {
    expect(subject(TaxType.Income)).toBe(0);
    expect(subject(TaxType.Resident)).toBe(0);
    expect(subject(TaxType.Income, 12_345)).toBe(12_345);
    expect(subject(TaxType.Resident, 12_345)).toBe(6_172);
    expect(subject(TaxType.Income, 110_000)).toBe(50_000);
    expect(subject(TaxType.Resident, 110_000)).toBe(25_000);
  });
});
