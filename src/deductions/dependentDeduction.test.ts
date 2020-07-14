import { TaxType, DependentFamilyMemberCounts } from "../config";
import dependentDeduction from "./dependentDeduction";

describe("dependentDeduction()", () => {
  const subject = (
    taxType: TaxType,
    dependentFamilyMemberCounts?: DependentFamilyMemberCounts,
  ) => {
    return dependentDeduction(dependentFamilyMemberCounts)(taxType);
  }

  it("扶養控除が計算できる", () => {
    expect(subject(
      TaxType.Income,
      {
        lt15: 1,
        gt16lt18: 2,
        gt19lt22: 3,
        gt23lt69: 4,
        gt70Parents: 5,
        gt70: 6,
      })).toBe(9_950_000);
    expect(subject(
      TaxType.Resident,
      { gt16lt18: 3, gt23lt69: 2, gt70: 1 }
    )).toBe(2_030_000);
  });
});
