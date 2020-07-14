import { TaxType } from "../config";
import spouseDeduction from "./spouseDeduction";

describe("spouseDeduction()", () => {
  const subject = (taxType: TaxType, selfIncome: number, existSpouse?: boolean, spouseIncome?: number, senior?: boolean) => {
    return spouseDeduction(selfIncome, existSpouse, spouseIncome, senior)(taxType);
  };
  it("所得税 配偶者控除が計算できる", () => {
    expect(subject(TaxType.Income, 9_000_000)).toBe(0);
    expect(subject(TaxType.Income, 9_000_000, true, 300_000)).toBe(380_000);
    expect(subject(TaxType.Income, 9_500_000, true, 300_000)).toBe(260_000);
    expect(subject(TaxType.Income, 10_000_000, true, 300_000)).toBe(130_000);
    expect(subject(TaxType.Income, 9_000_000, true, 300_000, true)).toBe(480_000);
    expect(subject(TaxType.Income, 9_500_000, true, 300_000, true)).toBe(320_000);
    expect(subject(TaxType.Income, 10_000_000, true, 300_000, true)).toBe(160_000);
  });
  it("住民税 配偶者控除が計算できる", () => {
    expect(subject(TaxType.Resident, 9_000_000, true, 300_000)).toBe(330_000);
    expect(subject(TaxType.Resident, 9_500_000, true, 300_000)).toBe(220_000);
    expect(subject(TaxType.Resident, 10_000_000, true, 300_000)).toBe(110_000);
    expect(subject(TaxType.Resident, 9_000_000, true, 300_000, true)).toBe(380_000);
    expect(subject(TaxType.Resident, 9_500_000, true, 300_000, true)).toBe(260_000);
    expect(subject(TaxType.Resident, 10_000_000, true, 300_000, true)).toBe(130_000);
  });
});
