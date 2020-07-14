import { TaxType } from "../config";
import smallBusinessMutualAidDeduction from "./smallBusinessMutualAidDeduction";


describe("smallBusinessMutualAidDeduction()", () => {
  const subject = (taxType: TaxType, smallBusinessMutualAidAmount?: number) => {
    return smallBusinessMutualAidDeduction(smallBusinessMutualAidAmount)(taxType);
  }

  it("小規模企業共済等掛金控除を計算できる", () => {
    expect(subject(TaxType.Income)).toBe(0);
    expect(subject(TaxType.Resident)).toBe(0);
    expect(subject(TaxType.Income, 3_000)).toBe(3_000);
    expect(subject(TaxType.Resident, 3_000)).toBe(3_000);
  });
});
