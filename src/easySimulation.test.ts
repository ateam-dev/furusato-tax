import { minimumSelfPayThresholdEasySimulation as easySimulation } from './easySimulation';
import { FamilyType } from './config';

describe("easySimulation()", () => {
  it("総務省掲載の「全額控除されるふるさと納税額（年間上限）の目安」が計算できる", () => {
    expect(easySimulation(3_250_000, FamilyType.Single)).toBe(31_000);
    expect(easySimulation(3_250_000, FamilyType.CoupleWithoutIncome)).toBe(23_000);
    expect(easySimulation(3_250_000, FamilyType.CoupleWithoutIncomeAndChild)).toBe(14_000);
    expect(easySimulation(3_250_000, FamilyType.CoupleWithoutIncomeAndChildAndCollerger)).toBe(3_000);

    expect(easySimulation(10_000_000, FamilyType.Single)).toBe(176_000);
    expect(easySimulation(10_000_000, FamilyType.CoupleWithoutIncome)).toBe(166_000);
    expect(easySimulation(10_000_000, FamilyType.CoupleWithoutIncomeAndChild)).toBe(157_000);
    expect(easySimulation(10_000_000, FamilyType.CoupleWithoutIncomeAndChildAndCollerger)).toBe(144_000);

    expect(easySimulation(25_000_000, FamilyType.Single)).toBe(849_000);
    expect(easySimulation(25_000_000, FamilyType.CoupleWithoutIncome)).toBe(849_000);
    expect(easySimulation(25_000_000, FamilyType.CoupleWithoutIncomeAndChild)).toBe(835_000);
    expect(easySimulation(25_000_000, FamilyType.CoupleWithoutIncomeAndChildAndCollerger)).toBe(817_000);
  });
});
