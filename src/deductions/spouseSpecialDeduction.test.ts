import { TaxType } from "../config";
import { spouseSpecialDeduction, spouseSpecialDeductionDiff } from "./spouseSpecialDeduction";

describe("spouseSpecialDeductionDiff()", () => {
  const subject = (selfIncome: number, partnerIncome?: number, existPartner?: boolean) => {
    return spouseSpecialDeductionDiff(selfIncome, partnerIncome, existPartner);
  }

  it("配偶者特別控除の差額を計算できる", () => {
    expect(subject(0, 400_000)).toBe(0);
    expect(subject(0, 400_000, true)).toBe(30_000);
    expect(subject(9_200_000, 400_000, true)).toBe(20_000);
    expect(subject(9_800_000, 400_000, true)).toBe(10_000);
    expect(subject(7_800_000, 399_999, true)).toBe(50_000);
    expect(subject(9_300_000, 399_999, true)).toBe(40_000);
    expect(subject(9_800_000, 399_999, true)).toBe(20_000);
  });
});

describe("spouseSpecialDeduction()", () => {
  const subject = (taxType: TaxType, selfIncome: number, partnerIncome?: number, existPartner?: boolean) => {
    return spouseSpecialDeduction(selfIncome, partnerIncome, existPartner)(taxType);
  }

  it("配偶者特別控除を計算できる", () => {
    expect(subject(TaxType.Income, 7_350_000, 399_999)).toBe(0);
    expect(subject(TaxType.Resident, 7_350_000, 399_999)).toBe(0);
    expect(subject(TaxType.Income, 7_350_000, 399_999, true)).toBe(380_000);
    expect(subject(TaxType.Resident, 7_350_000, 399_999, true)).toBe(330_000);
    expect(subject(TaxType.Income, 10_800_000, 399_999, true)).toBe(0);
    expect(subject(TaxType.Resident, 10_800_000, 399_999, true)).toBe(0);
    expect(subject(TaxType.Income, 4_580_000, 1_020_000, true)).toBe(210_000);
    expect(subject(TaxType.Resident, 4_580_000, 1_020_000, true)).toBe(210_000);
    expect(subject(TaxType.Income, 4_580_000, 1_239_600, true)).toBe(0);
    expect(subject(TaxType.Resident, 4_580_000, 1_239_600, true)).toBe(0);
  });
});
