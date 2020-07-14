import { FurusatoTax } from "./furusato";
import { FamilyType, Props, TaxType } from "./config";

/** 収入と家族構成だけで、他の釈迦保険料などを推定してシミュレーションする */
export const minimumSelfPayThresholdEasySimulation = (salary: number, familyType: FamilyType): number => {
  const house = new FurusatoTax(propsFromFamilyType(salary, familyType));
  return Math.floor(house.minimumSelfPayThreshold() / 1000) * 1000;
}

/** 家族構成から、シミュレーションに用いる引数を構成する */
const propsFromFamilyType = (salary: number, familyType: FamilyType): Props => {
  const props = {
    selfSalary: salary,
    isExistPartner: false,
    socialInsuranceAmount: estimatedSocialInsuranceAmount(salary)
  };

  switch (familyType) {
    case FamilyType.CoupleWithoutIncome:
      Object.assign(props, {
        isExistPartner: true,
        partnerSalary: 0
      });
      break;
    case FamilyType.CoupleWithoutIncomeAndChild:
      Object.assign(props, {
        isExistPartner: true,
        partnerSalary: 0,
        dependentFamilyMemberCounts: { gt16lt18: 1, gt19lt22: 0 }
      });
      break;
    case FamilyType.CoupleWithoutIncomeAndChildAndCollerger:
      Object.assign(props, {
        isExistPartner: true,
        partnerSalary: 0,
        dependentFamilyMemberCounts: { gt16lt18: 1, gt19lt22: 1 }
      });
      break;
    case FamilyType.CoupleAndChild:
      Object.assign(props, {
        isExistPartner: true,
        partnerSalary: 2_010_001,
        dependentFamilyMemberCounts: { gt16lt18: 1, gt19lt22: 0 }
      });
      break;
    case FamilyType.CoupleAndColleger:
      Object.assign(props, {
        isExistPartner: true,
        partnerSalary: 2_010_001,
        dependentFamilyMemberCounts: { gt16lt18: 0, gt19lt22: 1 }
      });
      break;
    case FamilyType.CoupleAndChildAndColleger:
      Object.assign(props, {
        isExistPartner: true,
        partnerSalary: 2_010_001,
        dependentFamilyMemberCounts: { gt16lt18: 1, gt19lt22: 1 }
      });
      break;
    default:
      break;
  }

  return props;
}

/** 
 * 総務省ホームページ掲載のシミュレータに基づき、社会保険料控除額を推定する
 * http://www.soumu.go.jp/main_sosiki/jichi_zeisei/czaisei/czaisei_seido/furusato/mechanism/deduction.html
 */
const estimatedSocialInsuranceAmount = (salary: number): number => {
  if (salary < 9000000) {
    // 所得900万円未満ならば、社会保険料控除額15%と仮定
    return salary * 0.15;
  } else if (salary < 18_000_000) {
    // 所得1800万円未満ならば、定率3%+定額108万円と仮定
    return salary * 0.03 + 1_080_000;
  } else {
    // 定額162万円と仮定
    return 1_620_000;
  }
};

