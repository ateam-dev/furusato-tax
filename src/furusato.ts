import { Deduction } from "./deduction";
import { ResidentTaxType, TaxType, SALARY_INCOME_CONDITIONS, Props, INCOME_TAX_RATES } from "./config";

export class FurusatoTax {
  /** 控除計算クラス */
  readonly deduction: Deduction;

  public constructor(readonly props: Readonly<Props>) {
    this.deduction = new Deduction(
      this.props,
      this.income(this.props.selfSalary),
      this.income(this.partnerSalary())
    );
  }

  /** 何円までの寄附なら自己負担2,000円で済むか計算する */
  minimumSelfPayThreshold(): number {
    return Math.floor(this.furusatoTaxSpecialDeduction() / (0.9 - this.limitTaxRate()) + 2_000);
  }

  /** 給与所得(課税対象金額) */
  income(salary: number): number {
    if (salary < 0) {
      return 0;
    }

    return this.findTaxableIncome(salary);
  }

  partnerSalary(): number {
    return this.props.partnerSalary ? this.props.partnerSalary : 0;
  }


  /** 住民税が非課税かどうか */
  isResidentTaxFree(): boolean {
    return (this.income(this.props.selfSalary) <= this.residentTaxFreeIncomeLimit());
  }

  /** 所得割非課税限度額 */
  residentTaxFreeIncomeLimit(): number {
    const familyCount = (1 + this.countPartner() + this.countDependentFamilyMember());
    // 同一生計配偶者および扶養親族がいない場合 35万円
    if (familyCount === 1) return 350_000;

    // 同一生計配偶者または扶養親族がいる場合 35万円 × （本人 + 同一生計配偶者＋扶養親族）の人数＋ 32万円
    return 350_000 * familyCount + 320_000;
  }

  /** 同一生計配偶者の人数 */
  countPartner(): (0 | 1) {
    if (this.props.partnerSalary === undefined) return 0;
    if (this.findTaxableIncome(this.props.partnerSalary) > 380_000) return 0;
    // 合計所得金額が38万円以下であるならば、同一生計配偶者である
    return 1;
  }

  /** 扶養家族人数の合計 */
  countDependentFamilyMember(): number {
    const family = this.props.dependentFamilyMemberCounts;
    if (family === undefined) return 0;

    return Object.values(family).reduce((acc: number, value) => {
      if (value === undefined) return acc;

      return acc += value;
    }, 0);
  }

  // eslint-disable-next-line
  findIncomeTaxRate(income: number): number {
    // eslint-disable-next-line prettier/prettier
    const rate = INCOME_TAX_RATES.find(e => e.cond(income))?.rate;
    if (rate === undefined) throw new Error(`Unexpected income ${income}`);
    return rate;
  }

  /** 給与収入から給与所得を計算する */
  findTaxableIncome(salary: number): number {
    // eslint-disable-next-line prettier/prettier
    const income = SALARY_INCOME_CONDITIONS.find(e => e.cond(salary))?.expr(salary);
    if (income === undefined) throw new Error(`no condition of salary ${salary}`);

    return income;
  }

  /**
   * 寄付者に適用される所得税の限界税率
   */
  limitTaxRate(): number {
    const residentTaxableIncome = this.residentTaxableIncome();
    const deductionDiff = this.deduction.totalPersonalDeductionDiff();

    if (residentTaxableIncome < deductionDiff) {
      return 0;
    }
    // 復興特別所得税 (平成25年から令和19年まで、原則としてその年分の基準所得税額の2.1％)
    const RECONSTRUCTION_SPECIAL_TAX_RATE = 1.021;

    return this.findIncomeTaxRate(residentTaxableIncome - deductionDiff) * RECONSTRUCTION_SPECIAL_TAX_RATE;
  }
  /** 調整後の控除額を計算する */
  fixedDeduction(type: ResidentTaxType): number {
    const residentTaxableIncome = this.residentTaxableIncome();
    const deductionDiff = this.deduction.totalPersonalDeductionDiff();
    const deductionRate = type === ResidentTaxType.prefecture ? 0.02 : 0.03;
    let retVal: number;

    // 合計課税所得金額（課税総所得金額、課税山林所得金額及び課税退職所得金額の合計額）が200万円以下の場合
    if (residentTaxableIncome <= 2_000_000) {
      // 「人的控除額の差の合計額」または「合計課税所得金額」のうちいずれか少ない金額
      retVal = Math.min(deductionDiff, residentTaxableIncome);
    } else {
      // 「人的控除額の差の合計額」から「合計課税所得金額から200万円を控除した金額」を控除した金額（5万円未満の場合は、5万円）
      retVal = Math.max(50_000, deductionDiff - residentTaxableIncome + 2_000_000);
    }

    return retVal * deductionRate;
  }

  /** 住民税の課税総所得金額 */
  residentTaxableIncome(): number {
    if (this.income(this.props.selfSalary) < this.deduction.totalDeductions(TaxType.Resident)) {
      return 0;
    }

    return Math.floor((this.income(this.props.selfSalary) - this.deduction.totalDeductions(TaxType.Resident)) / 1_000) * 1_000;
  }

  /** 寄付金適用前の都道府県の住民税所得割額を計算する */
  incomeBeforeDonationApply(type: ResidentTaxType): number {
    if (this.isResidentTaxFree()) {
      return 0;
    }

    // 道府県民税４％ 市町村民税６％
    const taxRate = type === ResidentTaxType.prefecture ? 0.04 : 0.06;
    return this.residentTaxableIncome() * taxRate - this.fixedDeduction(type);
  }

  /**
   * 特例控除額 (ふるさと納税にのみ適用され、個人住民税所得割額の2割を限度)
   * この計算は所得に依存し、通常の控除では適用されないため、控除という名前だが控除クラスではなくふるさと納税クラスに定義
   */
  furusatoTaxSpecialDeduction(): number {
    const incomeCity = this.incomeBeforeDonationApply(ResidentTaxType.city);
    const incomePrefecture = this.incomeBeforeDonationApply(ResidentTaxType.prefecture);

    return (incomePrefecture + incomeCity) * 0.2;
  }
}
