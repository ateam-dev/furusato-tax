import { FurusatoTax } from "./furusato";
import { Props, SpouseLossType } from "./config";

describe("FurusatoTax", () => {
  const subject = (props: Props) => {
    const house = new FurusatoTax(props);
    return house.minimumSelfPayThreshold();
  };

  it("何円までの寄附なら自己負担2,000円で済むか計算できる", () => {
    expect(subject({
      selfSalary: 3_000_000
    })).toBe(38_869);

    expect(subject({
      selfSalary: 6_420_000
    })).toBe(123_902);

    expect(subject({
      selfSalary: 6_240_000,
      socialInsuranceAmount: 20_000,
      lifeInsuranceDeductionAmount: 5_000,
      medicalExpensesDeductionAmount: 1_000
    })).toBe(119_016);

    expect(subject({
      selfSalary: 1_400_000,
      partnerSalary: 1_030_000,
      isExistPartner: true,
      isSeniorSpouse: false,
      dependentFamilyMemberCounts: {
        gt16lt18: 3,
        gt23lt69: 2,
        gt70: 1
      },
      spouseLossType: SpouseLossType.lossWife,
      challengedFamilyMemberCounts: {
        challenged: 1,
        severeChallengedSelfOrLiveSeparately: 1
      },
      socialInsuranceAmount: 20_000,
      smallBusinessMutualAidAmount: 3_000,
      lifeInsuranceDeductionAmount: 150_000,
      earthquakeInsuranceAmount: 12_345,
      medicalExpensesDeductionAmount: 2_000_001
    })).toBe(2_000);
  });
});
