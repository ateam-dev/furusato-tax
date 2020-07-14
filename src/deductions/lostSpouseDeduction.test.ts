import { TaxType, SpouseLossType } from "../config";
import lostSpouseDeduction from "./lostSpouseDeduction";

describe("lostSpouseDeduction()", () => {
  const subject = (taxType: TaxType, existPartner?: boolean, spouseLossType?: SpouseLossType) => {
    return lostSpouseDeduction(existPartner, spouseLossType)(taxType);
  }

  it("寡婦控除が計算できる", () => {
    expect(subject(TaxType.Income)).toBe(0);
    expect(subject(TaxType.Income, true)).toBe(0);
    expect(subject(TaxType.Income, true, SpouseLossType.lossWife)).toBe(0);
    expect(subject(TaxType.Income, false, SpouseLossType.lossWife)).toBe(270_000);
    expect(subject(TaxType.Resident, false, SpouseLossType.lossWife)).toBe(260_000);
    expect(subject(TaxType.Income, false, SpouseLossType.specificLossHusband)).toBe(350_000);
    expect(subject(TaxType.Resident, false, SpouseLossType.specificLossHusband)).toBe(300_000);
  });
});
