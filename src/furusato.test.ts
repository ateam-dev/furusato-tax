import { FurusatoTax } from './index';
import { ResidentTaxType, TaxType, SpouseLossType, DependentFamilyMemberCounts, DEPENDANT_DEDUCTION_AMOUNTS_INCOME, DEPENDANT_DEDUCTION_AMOUNTS_RESIDENT, ChallengedFamilyMemberCounts, CHALLENGED_DEDUCTION_AMOUNTS_INCOME, CHALLENGED_DEDUCTION_AMOUNTS_RESIDENT } from "./config";

describe("FurusatoTax", () => {
  describe("minimumSelfPayThreshold()", () => {
    const subject = (salaly: number,
        incomeCity: number,
        incomePrefecture: number,
        residentTaxableIncome: number,
        deductions: number,
        taxRate: number) => {
      const house = new FurusatoTax({selfSalary: salaly});
      house.incomeBeforeDonationApply = jest.fn().mockImplementation(
        (type) => (type === ResidentTaxType.prefecture) ? incomePrefecture : incomeCity
      );
      house.residentTaxableIncome = jest.fn().mockReturnValue(residentTaxableIncome);
      house.deduction.totalPersonalDeductionDiff = jest.fn().mockReturnValue(deductions);
      house.findIncomeTaxRate = jest.fn().mockReturnValue(taxRate);

      return house.minimumSelfPayThreshold();
    }

    it("自己負担2,000円で済む寄付額を計算できる", () => {
      expect(subject(10_000_000, 162_840, 244_260, 4_096_000, 50_000, 0.2)).toBe(119_016);
    });

    it("課税される所得が人的控除金額の合計値を下回る場合に、自己負担2,000円で済む寄付額を計算できる", () => {
      expect(subject(10_000_000, 400, 600, 20_000, 50_000, 0.2)).toBe(2_222);
    });
  });
  describe("income()", () => {
    const subject = (salary: number, taxableIncome: number) => {
      const house = new FurusatoTax({selfSalary: salary});
      house.findTaxableIncome = jest.fn().mockReturnValue(taxableIncome);

      return house.income(salary);
    }

    it("収入から所得を計算できる", () => {
      expect(subject(6_240_000, 4_452_000)).toBe(4_452_000);
    });
  });

  describe("residentTaxableIncome()", () => {
    const subject = (income: number, residentTaxTotalDeductions: number) => {
      const house = new FurusatoTax({selfSalary: 1});
      house.income = jest.fn().mockReturnValue(income);
      house.deduction.totalDeductions = jest.fn().mockReturnValue(residentTaxTotalDeductions);

      return house.residentTaxableIncome();
    }
    it("住民税課税の所得金額を計算できる", () => {
      expect(subject(4_452_000, 356_000)).toBe(4_096_000);
    });
  });

  describe("incomeBeforeDonationApply()", () => {
    const subject = (
      type: ResidentTaxType,
      isResidentTaxFree: boolean,
      residentTaxableIncome: number,
      fixedDeduction: number
    ) => {
      const house = new FurusatoTax({selfSalary: 1});
      house.isResidentTaxFree = jest.fn().mockReturnValue(isResidentTaxFree);
      house.residentTaxableIncome = jest.fn().mockReturnValue(residentTaxableIncome);
      house.fixedDeduction = jest.fn().mockReturnValue(fixedDeduction);

      return house.incomeBeforeDonationApply(type);
    }

    it("都道府県民税について、寄付金適用前の所得割額が計算できる", () => {
      expect(subject(ResidentTaxType.prefecture, false, 4_096_000, 1_000)).toBe(162_840);
    })
    it("市区町村民税について、寄付金適用前の所得割額が計算できる", () => {
      expect(subject(ResidentTaxType.city, false, 4_096_000, 1_500)).toBe(244_260);
    })
  });

  describe("limitTaxRate()", () => {
    const subject = (
      residentTaxableIncome: number,
      totalPersonalDeductions: number,
      incomeTaxRate: number
    ) => {
      const house = new FurusatoTax({selfSalary: 1});
      house.residentTaxableIncome = jest.fn().mockReturnValue(residentTaxableIncome);
      house.deduction.totalPersonalDeductionDiff = jest.fn().mockReturnValue(totalPersonalDeductions);
      house.findIncomeTaxRate = jest.fn().mockReturnValue(incomeTaxRate);

      return house.limitTaxRate();
    }

    it("寄付者に適用される所得税の限界税率を計算できる", () => {
      expect(subject(4_096_000, 50_000, 0.2)).toBe(0.2042);
    })
  });

  describe("findTaxableIncome()", () => {
    const subject = (salary: number) => {
      const house = new FurusatoTax({selfSalary: salary});
      house.deduction.totalDeductions = jest.fn().mockRejectedValue(1);
      return house.findTaxableIncome(salary);
    }

    it("給与収入から所得を計算できる", () => {
      expect(subject(650_999)).toBe(0);
      expect(subject(651_000)).toBe(1_000);
      expect(subject(1_618_999)).toBe(968_999);
      expect(subject(1_619_000)).toBe(969_000);
      expect(subject(1_619_999)).toBe(969_000);
      expect(subject(1_620_000)).toBe(970_000);
      expect(subject(1_621_999)).toBe(970_000);
      expect(subject(1_622_000)).toBe(972_000);
      expect(subject(1_623_999)).toBe(972_000);
      expect(subject(1_624_000)).toBe(974_000);
      expect(subject(1_627_999)).toBe(974_000);
      expect(subject(1_628_000)).toBe(976_800);
      expect(subject(1_799_999)).toBe(1_077_600);
      expect(subject(1_800_000)).toBe(1_080_000);
      expect(subject(1_800_001)).toBe(1_080_000);
      expect(subject(3_599_999)).toBe(2_337_200);
      expect(subject(3_600_000)).toBe(2_340_000);
      expect(subject(3_600_001)).toBe(2_340_000);
      expect(subject(5_000_000)).toBe(3_460_000);
      expect(subject(6_240_000)).toBe(4_452_000);
      expect(subject(6_599_999)).toBe(4_736_800);
      expect(subject(6_600_000)).toBe(4_740_000);
      expect(subject(6_600_001)).toBe(4_740_000);
      expect(subject(7_799_999)).toBe(5_819_999);
      expect(subject(10_000_000)).toBe(7_800_000);
      expect(subject(10_000_001)).toBe(7_800_001);
    })
  });
  describe("findIncomeTaxRate()", () => {
    const subject = (income: number) => {
      const house = new FurusatoTax({selfSalary: 1});
      return house.findIncomeTaxRate(income);
    };

    it("所得税率を計算できる", () => {
      expect(subject(750_000)).toBe(0.05);
      expect(subject(4_096_000)).toBe(0.2);
    });
  });

  describe("isResidentTaxFree()", () => {
    const subject = (income: number, residentTaxFreeIncomeLimit: number) => {
      const house = new FurusatoTax({selfSalary: 1});
      house.income = jest.fn().mockReturnValue(income);
      house.residentTaxFreeIncomeLimit = jest.fn().mockReturnValue(residentTaxFreeIncomeLimit);

      return house.isResidentTaxFree();
    }

    it("住民税非課税かどうかを返せる", () => {
      expect(subject(4_452_000, 350_000)).toBe(false);
    });
  });


  describe("residentTaxFreeIncomeLimit()", () => {
    const subject = (countPartner: number, countDependentFamilyMember: number) => {
      const house = new FurusatoTax({selfSalary: 1});
      house.countPartner = jest.fn().mockReturnValue(countPartner);
      house.countDependentFamilyMember = jest.fn().mockReturnValue(countDependentFamilyMember)

      return house.residentTaxFreeIncomeLimit();
    }

    it("所得割非課税の限度額を計算できる", () => {
      expect(subject(0, 0)).toBe(350_000);
      expect(subject(1, 21)).toBe(8_370_000);
    });
  });

  describe("countPartner()", () => {
    const subject = (partnerTaxableIncome?: number) => {
      const house = new FurusatoTax({selfSalary: 1, partnerSalary: partnerTaxableIncome});
      house.findTaxableIncome = jest.fn().mockReturnValue(partnerTaxableIncome);

      return house.countPartner();
    }

    it("同一生計配偶者の人数を計算できる", () => {
      expect(subject(undefined)).toBe(0);
      expect(subject(380_000)).toBe(1);
      expect(subject(380_001)).toBe(0);
    });
  });

  describe("countDependentFamilyMember()", () => {
    const subject = (family?: DependentFamilyMemberCounts) => {
      const house = new FurusatoTax({selfSalary: 1, dependentFamilyMemberCounts: family});
      return house.countDependentFamilyMember();
    }

    it("扶養家族人数を計算できる", () => {
      expect(subject(undefined)).toBe(0);
      expect(subject({
        lt15: 1,
        gt16lt18: 2,
        gt19lt22: 3,
        gt23lt69: 4,
        gt70: 5,
        gt70Parents: 6
      })).toBe(21);
    });
  });


  describe("fixedDeduction()", () => {
    const subject = (
      type: ResidentTaxType,
      residentTaxableIncome: number,
      totalPersonalDeductions: number
    ) => {
      const house = new FurusatoTax({selfSalary: 1});
      house.residentTaxableIncome = jest.fn().mockReturnValue(residentTaxableIncome);
      house.deduction.totalPersonalDeductionDiff = jest.fn().mockReturnValue(totalPersonalDeductions);

      return house.fixedDeduction(type);
    }

    it("都道府県の住民税の、調整後控除額が計算できる", () => {
      expect(subject(ResidentTaxType.prefecture, 4_580_000, 50_000)).toBe(1_000);
    });
    it("市区町村の住民税の、調整後控除額が計算できる", () => {
      expect(subject(ResidentTaxType.city, 4_580_000, 50_000)).toBe(1_500);
    });
    it("人的控除額から「合計課税所得金額から200万円を控除した金額」が5万円を超える場合の、市区町村の住民税の、調整後控除額が計算できる", () => {
      expect(subject(ResidentTaxType.city, 2_100_000, 300_000)).toBe(6_000);
    });
    it("合計課税所得金額が200万円以下の場合の、市区町村の住民税の、調整後控除額が計算できる", () => {
      expect(subject(ResidentTaxType.city, 1_990_000, 1_000)).toBe(30);
    });
    it("合計課税所得金額が200万円以下で、人的控除額が課税所得金額よりも大きい場合の、市区町村の住民税の、調整後控除額が計算できる", () => {
      expect(subject(ResidentTaxType.city, 1_990_000, 3_000_000)).toBe(59_700);
    });
  });

  describe("furusatoTaxSpecialDeduction()", () => {
    const subject = (incomePrefecture: number, incomeCity: number) => {
      const house = new FurusatoTax({selfSalary: 1});
      house.incomeBeforeDonationApply = jest.fn().mockImplementation(
        (type) => (type === ResidentTaxType.prefecture) ? incomePrefecture : incomeCity
      );
      return house.furusatoTaxSpecialDeduction();
    }

    it("特別控除額を計算できる", () => {
      expect(subject(162_840, 244_260)).toBe(81_420);
    });
  });

});
