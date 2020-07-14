/** 市町村民か都道府県か */
export enum ResidentTaxType {
  city,
  prefecture
}
export enum TaxType {
  /** 住民税 */
  Resident = "Resident",
  /** 所得税 */
  Income = "Income"
}
export enum SpouseLossType {
  /** 寡婦 */
  lossHusband,
  /** 寡夫 */
  lossWife,
  /** 特別の寡婦 */
  specificLossHusband,
  /** 非該当 */
  otherwise
}

export type Props = {
  /** 給与収入(本人) */
  selfSalary: number;
  /** 給与収入(配偶者) */
  partnerSalary?: number;
  /** 配偶者がいるかどうか */
  isExistPartner?: boolean;
  /** 配偶者が70歳以上かどうか */
  isSeniorSpouse?: boolean;
  /** 寡婦・寡夫に該当するかどうか */
  spouseLossType?: SpouseLossType;
  dependentFamilyMemberCounts?: DependentFamilyMemberCounts;
  challengedFamilyMemberCounts?: ChallengedFamilyMemberCounts;
  /** 社会保険料 */
  socialInsuranceAmount?: number;
  /** 地震保険契約にかかる地震等相当分保険料 */
  earthquakeInsuranceAmount?: number;
  /** 小規模企業共済等掛金 */
  smallBusinessMutualAidAmount?: number;
  /** 生命保険 控除額 */
  lifeInsuranceDeductionAmount?: number;
  /** 医療費 控除額 */
  medicalExpensesDeductionAmount?: number;
};
export type DependentFamilyMemberCounts = {
  lt15?: number; // 15歳以下の人数
  gt16lt18?: number; // 16～18歳の人数
  gt19lt22?: number; // 19～22歳の人数
  gt23lt69?: number; // 23～69歳の人数
  gt70Parents?: number; // 70歳以上（同居の親・祖父母）の人数
  gt70?: number; // 70歳以上（上記以外）の人数
};

export type ChallengedFamilyMemberCounts = {
  /** 普通障害者(身体障害者3～6級、療育手帳B級、精神障害者保健福祉手帳2級以下など)の人数 */
  challenged?: number;
  /** 別居または本人の特別障害者(身体障害者1・2級、療育手帳A級、精神障害者保健福祉手帳1級など) */
  severeChallengedSelfOrLiveSeparately?: number;
  /** 同居特別障害者 */
  severeChallengedLiveIn?: number;
};

/** 1,000未満切り捨て */
function floor1000(x: number): number {
  return Math.floor(x / 1_000) * 1_000;
}

type salaryCondition = (salary: number) => boolean;
type incomeExpression = (salary: number) => number;

/** 基礎控除 所得税 */
export const BASIC_DEDUCTION: { [K in TaxType]: number } = {
  Income: 380_000,
  Resident: 330_000
};

/** 給与所得控除金額 */
// prettier-ignore
export const SALARY_INCOME_CONDITIONS: { cond: salaryCondition; expr: incomeExpression }[] = [
  { cond: x =>                    x <    651_000, expr: _x => 0 },
  { cond: x =>   651_000  <= x && x <  1_619_000, expr: x  => x - 650_000 },
  { cond: x => 1_619_000  <= x && x <  1_620_000, expr: _x => 969_000 },
  { cond: x => 1_620_000  <= x && x <  1_622_000, expr: _x => 970_000 },
  { cond: x => 1_622_000  <= x && x <  1_624_000, expr: _x => 972_000 },
  { cond: x => 1_624_000  <= x && x <  1_628_000, expr: _x => 974_000 },
  { cond: x => 1_628_000  <= x && x <  1_800_000, expr: x  => floor1000(x / 4) * 4 * 0.6 },
  { cond: x => 1_800_000  <= x && x <  3_600_000, expr: x  => floor1000(x / 4) * 4 * 0.7 - 180_000 },
  { cond: x => 3_600_000  <= x && x <  6_600_000, expr: x  => floor1000(x / 4) * 4 * 0.8 - 540_000 },
  { cond: x => 6_600_000  <= x && x < 10_000_000, expr: x  => Math.floor(x * 0.9) - 1_200_000 },
  { cond: x => 10_000_000 <= x,                   expr: x  => x - 2_200_000 }
];

/** 扶養控除金額(所得税) */
export const DEPENDANT_DEDUCTION_AMOUNTS_INCOME = {
  lt15: 0,
  gt16lt18: 380_000,
  gt19lt22: 630_000,
  gt23lt69: 380_000,
  gt70Parents: 580_000,
  gt70: 480_000
};
/** 扶養控除金額(住民税) */
export const DEPENDANT_DEDUCTION_AMOUNTS_RESIDENT = {
  lt15: 0,
  gt16lt18: 330_000,
  gt19lt22: 450_000,
  gt23lt69: 330_000,
  gt70Parents: 450_000,
  gt70: 380_000
};

export const CHALLENGED_DEDUCTION_AMOUNTS_INCOME = {
  challenged: 270_000,
  severeChallengedSelfOrLiveSeparately: 400_000,
  severeChallengedLiveIn: 750_000
};
export const CHALLENGED_DEDUCTION_AMOUNTS_RESIDENT = {
  challenged: 260_000,
  severeChallengedSelfOrLiveSeparately: 300_000,
  severeChallengedLiveIn: 530_000
};

type incomeCondition = (income: number) => boolean;

// よく使う範囲条件式を定数化
const le900: incomeCondition = x => x <= 9_000_000;
const gt900le950: incomeCondition = x => 9_000_000 < x && x <= 9_500_000;
const gt950le1000: incomeCondition = x => 9_500_000 < x && x <= 10_000_000;
const gt1000: incomeCondition = x => 10_000_000 < x;

const gt38lt40: incomeCondition = x => 380_000 < x && x < 400_000;
const ge40lt45: incomeCondition = x => 400_000 <= x && x < 450_000;
const le38ge45: incomeCondition = x => x <= 380_000 || 450_000 <= x;

type SpouseSpecialDeductionConditions = {
  cond: incomeCondition;
  deductions: { cond: incomeCondition; deduction: number }[];
}[];

/** 配偶者特別控除 所得税 */
// prettier-ignore
const SPOUSE_SPECIAL_DEDUCTION_CONDITIONS_INCOME: SpouseSpecialDeductionConditions = [
  { cond: x =>                   x <   380_000, deductions: [{ cond: _x => true, deduction: 0 }] },
  { cond: x =>   380_000 <= x && x <   850_000, deductions: [{ cond: le900, deduction: 380_000 }, { cond: gt900le950, deduction: 260_000 }, { cond: gt950le1000, deduction: 130_000 }, { cond: gt1000, deduction: 0 }] },
  { cond: x =>   850_000 <= x && x <   900_000, deductions: [{ cond: le900, deduction: 360_000 }, { cond: gt900le950, deduction: 240_000 }, { cond: gt950le1000, deduction: 120_000 }, { cond: gt1000, deduction: 0 }] },
  { cond: x =>   900_000 <= x && x <   950_000, deductions: [{ cond: le900, deduction: 310_000 }, { cond: gt900le950, deduction: 210_000 }, { cond: gt950le1000, deduction: 110_000 }, { cond: gt1000, deduction: 0 }] },
  { cond: x =>   950_000 <= x && x < 1_000_000, deductions: [{ cond: le900, deduction: 260_000 }, { cond: gt900le950, deduction: 180_000 }, { cond: gt950le1000, deduction:  90_000 }, { cond: gt1000, deduction: 0 }] },
  { cond: x => 1_000_000 <= x && x < 1_050_000, deductions: [{ cond: le900, deduction: 210_000 }, { cond: gt900le950, deduction: 140_000 }, { cond: gt950le1000, deduction:  70_000 }, { cond: gt1000, deduction: 0 }] },
  { cond: x => 1_050_000 <= x && x < 1_100_000, deductions: [{ cond: le900, deduction: 160_000 }, { cond: gt900le950, deduction: 110_000 }, { cond: gt950le1000, deduction:  60_000 }, { cond: gt1000, deduction: 0 }] },
  { cond: x => 1_100_000 <= x && x < 1_150_000, deductions: [{ cond: le900, deduction: 110_000 }, { cond: gt900le950, deduction:  80_000 }, { cond: gt950le1000, deduction:  40_000 }, { cond: gt1000, deduction: 0 }] },
  { cond: x => 1_150_000 <= x && x < 1_200_000, deductions: [{ cond: le900, deduction:  60_000 }, { cond: gt900le950, deduction:  40_000 }, { cond: gt950le1000, deduction:  20_000 }, { cond: gt1000, deduction: 0 }] },
  { cond: x => 1_200_000 <= x && x < 1_230_000, deductions: [{ cond: le900, deduction:  30_000 }, { cond: gt900le950, deduction:  20_000 }, { cond: gt950le1000, deduction:  10_000 }, { cond: gt1000, deduction: 0 }] },
  { cond: x => 1_230_000 < x,                   deductions: [{ cond: _x => true, deduction: 0 }] },
];

/** 配偶者特別控除 住民税 */
// prettier-ignore
const SPOUSE_SPECIAL_DEDUCTION_CONDITIONS_RESIDENT: SpouseSpecialDeductionConditions = [
  { cond: x =>                   x <   380_000, deductions: [{ cond: _x => true, deduction: 0 }] },
  { cond: x =>   380_000 <= x && x <   850_000, deductions: [{ cond: le900, deduction: 330_000 }, { cond: gt900le950, deduction: 220_000 }, { cond: gt950le1000, deduction: 110_000 }, { cond: gt1000, deduction: 0 }] },
  { cond: x =>   850_000 <= x && x <   900_000, deductions: [{ cond: le900, deduction: 330_000 }, { cond: gt900le950, deduction: 220_000 }, { cond: gt950le1000, deduction: 110_000 }, { cond: gt1000, deduction: 0 }] },
  { cond: x =>   900_000 <= x && x <   950_000, deductions: [{ cond: le900, deduction: 310_000 }, { cond: gt900le950, deduction: 210_000 }, { cond: gt950le1000, deduction: 110_000 }, { cond: gt1000, deduction: 0 }] },
  { cond: x =>   950_000 <= x && x < 1_000_000, deductions: [{ cond: le900, deduction: 260_000 }, { cond: gt900le950, deduction: 180_000 }, { cond: gt950le1000, deduction:  90_000 }, { cond: gt1000, deduction: 0 }] },
  { cond: x => 1_000_000 <= x && x < 1_050_000, deductions: [{ cond: le900, deduction: 210_000 }, { cond: gt900le950, deduction: 140_000 }, { cond: gt950le1000, deduction:  70_000 }, { cond: gt1000, deduction: 0 }] },
  { cond: x => 1_050_000 <= x && x < 1_100_000, deductions: [{ cond: le900, deduction: 160_000 }, { cond: gt900le950, deduction: 110_000 }, { cond: gt950le1000, deduction:  60_000 }, { cond: gt1000, deduction: 0 }] },
  { cond: x => 1_100_000 <= x && x < 1_150_000, deductions: [{ cond: le900, deduction: 110_000 }, { cond: gt900le950, deduction:  80_000 }, { cond: gt950le1000, deduction:  40_000 }, { cond: gt1000, deduction: 0 }] },
  { cond: x => 1_150_000 <= x && x < 1_200_000, deductions: [{ cond: le900, deduction:  60_000 }, { cond: gt900le950, deduction:  40_000 }, { cond: gt950le1000, deduction:  20_000 }, { cond: gt1000, deduction: 0 }] },
  { cond: x => 1_200_000 <= x && x < 1_230_000, deductions: [{ cond: le900, deduction:  30_000 }, { cond: gt900le950, deduction:  20_000 }, { cond: gt950le1000, deduction:  10_000 }, { cond: gt1000, deduction: 0 }] },
  { cond: x => 1_230_000 < x,                   deductions: [{ cond: _x => true, deduction: 0 }] },
];
/** 配偶者特別控除のテーブル */
export const SPOUSE_SPECIAL_DEDUCTION_CONDITIONS: { [K in TaxType]: SpouseSpecialDeductionConditions } = {
  Income: SPOUSE_SPECIAL_DEDUCTION_CONDITIONS_INCOME,
  Resident: SPOUSE_SPECIAL_DEDUCTION_CONDITIONS_RESIDENT
};

/** 配偶者特別控除の差額 */
// prettier-ignore
export const SPOUSE_SPECIAL_DEDUCTION_DIFF_CONDITIONS: { cond: incomeCondition; deductions: { cond: incomeCondition, deduction: number }[] }[] = [
  { cond: le900,       deductions: [{ cond: gt38lt40, deduction: 50_000 }, { cond: ge40lt45, deduction: 30_000 }, { cond: le38ge45, deduction: 0 }] },
  { cond: gt900le950,  deductions: [{ cond: gt38lt40, deduction: 40_000 }, { cond: ge40lt45, deduction: 20_000 }, { cond: le38ge45, deduction: 0 }] },
  { cond: gt950le1000, deductions: [{ cond: gt38lt40, deduction: 20_000 }, { cond: ge40lt45, deduction: 10_000 }, { cond: le38ge45, deduction: 0 }] },
  { cond: gt1000,      deductions: [{ cond: _x => true, deduction: 0 }] },
];

/** 配偶者控除 */
// prettier-ignore
export const SPOUSE_DEDUCTIONS: { cond: incomeCondition, deductions: { [K in TaxType]: number } }[] = [
  { cond: le900,       deductions: { Income: 380_000, Resident: 330_000 } },
  { cond: gt900le950,  deductions: { Income: 260_000, Resident: 220_000 } },
  { cond: gt950le1000, deductions: { Income: 130_000, Resident: 110_000 } },
  { cond: gt1000,      deductions: { Income: 0, Resident: 0 } },
];

/** 老人控除対象配偶者の住民税の配偶者控除 */
// prettier-ignore
export const SENIOR_SPOUSE_DEDUCTIONS: { cond: incomeCondition, deductions: { [K in TaxType]: number } }[] = [
  { cond: le900,       deductions: { Income: 480_000, Resident: 380_000 } },
  { cond: gt900le950,  deductions: { Income: 320_000, Resident: 260_000 } },
  { cond: gt950le1000, deductions: { Income: 160_000, Resident: 130_000 } },
  { cond: gt1000,      deductions: { Income: 0, Resident: 0 } },
];

/** 所得税 寡婦控除および寡夫控除 */
export const LOST_SPOUSE_DEDUCTION_INCOME = 270_000;
/** 所得税 特別の寡婦控除 */
export const LOST_SPOUSE_DEDUCTION_RESIDENT = 260_000;
/** 住民税 寡婦控除および寡夫控除 */
export const LOST_SPECIFIC_DEDUCTION_INCOME = 350_000;
/** 住民税 特別の寡婦控除 */
export const LOST_SPECIFIC_DEDUCTION_RESIDENT = 300_000;

/** 生命保険料控除の上限額 */
export const LIFE_INSURANCE_DEDUCTION_LIMIT: { [K in TaxType]: number } = {
  Income: 120_000,
  Resident: 70_000
};

/** 地震保険控除の上限額 */
export const EARTHQUAKE_INSURANCE_DEDUCTION_LIMIT: { [K in TaxType]: number } = {
  Income: 50_000,
  Resident: 25_000
};

/** 医療費控除の上限額 */
export const MEDICAL_EXPENSES_DEDUCTION_LIMIT = 2_000_000;

/** 所得税率 */
// prettier-ignore
export const INCOME_TAX_RATES: { cond: incomeCondition; rate: number }[] = [
  { cond: x =>                   x <=  1_950_000, rate: 0.05 },
  { cond: x =>  1_950_000 < x && x <=  3_300_000, rate: 0.1 },
  { cond: x =>  3_300_000 < x && x <=  6_950_000, rate: 0.2 },
  { cond: x =>  6_950_000 < x && x <=  9_000_000, rate: 0.23 },
  { cond: x =>  9_000_000 < x && x <= 18_000_000, rate: 0.33 },
  { cond: x => 18_000_000 < x && x <= 40_000_000, rate: 0.4 },
  { cond: x => 40_000_000 < x,                    rate: 0.45 }
];

/**
 * 総務省サイト掲載の家族構成選択肢
 * http://www.soumu.go.jp/main_sosiki/jichi_zeisei/czaisei/czaisei_seido/furusato/mechanism/deduction.html#note2
*/
export enum FamilyType {
  /** 独身又は共働き※「共働き」は、ふるさと納税を行う方本人が配偶者（特別）控除の適用を受けていないケースを指します。（配偶者の給与収入が201万円超の場合） */
  Single = "Single",
  /** 夫婦(「夫婦」は、ふるさと納税を行う方の配偶者に収入がないケースを指します) */
  CoupleWithoutIncome = "CoupleWithoutIncome",
  /** 共働き＋子1人（高校生※「高校生」は「16歳から18歳の扶養親族」を指します） */
  CoupleAndChild = "CoupleAndChild",
  /** 共働き＋子1人（大学生※「大学生」は「19歳から22歳の特定扶養親族」を指します） */
  CoupleAndColleger = "CoupleAndColleger",
  /** 夫婦＋子1人（高校生） */
  CoupleWithoutIncomeAndChild = "CoupleWithoutIncomeAndChild",
  /** 共働き＋子2人（大学生と高校生） */
  CoupleAndChildAndColleger = "CoupleAndChildAndColleger",
  /** 夫婦＋子2人（大学生と高校生） */
  CoupleWithoutIncomeAndChildAndCollerger = "CoupleWithoutIncomeAndChildAndCollerger"
}
