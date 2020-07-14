import { TaxType } from "../config";
import basicDeduction from "./basicDeduction";

describe("basicDeduction()", () => {
  const subject = (taxType: TaxType) => {
    return basicDeduction(taxType);
  }

  it("基礎控除を計算できる", () => {
    expect(subject(TaxType.Income)).toBe(380_000);
    expect(subject(TaxType.Resident)).toBe(330_000);
  });
});
