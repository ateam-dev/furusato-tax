import { TaxType, ChallengedFamilyMemberCounts } from "../config";
import challengedDeduction from "./challengedDeduction";

describe("challengedDeduction()", () => {
  const subject = (
    taxType: TaxType,
    challengedFamilyMemberCounts?: ChallengedFamilyMemberCounts,
  ) => {
    return challengedDeduction(challengedFamilyMemberCounts)(taxType);
  }

  it("障害者控除を計算できる", () => {
    expect(subject(
      TaxType.Income,
      { challenged: 2, severeChallengedLiveIn: 3, severeChallengedSelfOrLiveSeparately: 1 }
    )).toBe(3_190_000);
    expect(subject(
      TaxType.Resident,
      { challenged: 1, severeChallengedSelfOrLiveSeparately: 1 }
    )).toBe(560_000);
  });
});
