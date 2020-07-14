import { TaxType, SpouseLossType, DependentFamilyMemberCounts, ChallengedFamilyMemberCounts } from "./config";
import basicDeduction from "./deductions/basicDeduction";
import medicalExpensesDeduction from "./deductions/medicalExpensesDeduction";
import smallBusinessMutualAidDeduction from "./deductions/smallBusinessMutualAidDeduction";
import earthquakeInsuranceDeduction from "./deductions/earthquakeInsuranceDeduction";
import lifeInsuranceDeduction from "./deductions/lifeInsuranceDeduction";
import socialInsuranceDeduction from "./deductions/socialInsuranceDeduction";
import challengedDeduction from "./deductions/challengedDeduction";
import lostSpouseDeduction from "./deductions/lostSpouseDeduction";
import dependentDeduction from "./deductions/dependentDeduction";
import spouseDeduction from "./deductions/spouseDeduction";
import { spouseSpecialDeduction, spouseSpecialDeductionDiff } from "./deductions/spouseSpecialDeduction";

type FurusatoProps = {
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

export class Deduction {
  public constructor(
    private readonly furusatoTax: Readonly<FurusatoProps>,
    private readonly selfIncome: number,
    private readonly spouseIncome?: number
  ) {}

  /** 人的控除の差額の合計値 */
  totalPersonalDeductionDiff(): number {
    const totalDiff = [
      spouseDeduction(
        this.selfIncome,
        this.furusatoTax.isExistPartner,
        this.spouseIncome,
        this.furusatoTax.isSeniorSpouse
      ),
      lostSpouseDeduction(this.furusatoTax.isExistPartner, this.furusatoTax.spouseLossType),
      challengedDeduction(this.furusatoTax.challengedFamilyMemberCounts),
      dependentDeduction(this.furusatoTax.dependentFamilyMemberCounts),
      basicDeduction
    ].reduce((acc, fn) => {
      return acc + (fn(TaxType.Income) - fn(TaxType.Resident));
    }, 0);

    /** 配偶者特別控除差額は計算では求められないため直接加算する */
    return totalDiff + spouseSpecialDeductionDiff(this.selfIncome, this.spouseIncome, this.furusatoTax.isExistPartner);
  }

  /** 所得控除 合計金額 */
  totalDeductions(taxType: TaxType): number {
    return [
      // 人的控除
      spouseDeduction(
        this.selfIncome,
        this.furusatoTax.isExistPartner,
        this.spouseIncome,
        this.furusatoTax.isSeniorSpouse
      ),
      spouseSpecialDeduction(this.selfIncome, this.spouseIncome, this.furusatoTax.isExistPartner),
      dependentDeduction(this.furusatoTax.dependentFamilyMemberCounts),
      lostSpouseDeduction(this.furusatoTax.isExistPartner, this.furusatoTax.spouseLossType),
      challengedDeduction(this.furusatoTax.challengedFamilyMemberCounts),
      // 保険料控除
      socialInsuranceDeduction(this.furusatoTax.socialInsuranceAmount),
      lifeInsuranceDeduction(this.furusatoTax.lifeInsuranceDeductionAmount),
      earthquakeInsuranceDeduction(this.furusatoTax.earthquakeInsuranceAmount),
      // その他の控除
      smallBusinessMutualAidDeduction(this.furusatoTax.smallBusinessMutualAidAmount),
      medicalExpensesDeduction(this.furusatoTax.medicalExpensesDeductionAmount),
      basicDeduction
    ].reduce((acc, fn) => {
      return acc + fn(taxType);
    }, 0);
  }
}
