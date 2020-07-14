# ふるさと納税限度額計算ライブラリ
寄付者の収入や家族構成等をもとに、ふるさと納税が全額控除される寄付金額を計算するnpmライブラリです。

ふるさと納税制度については、[総務省のふるさと納税ポータルサイト](https://www.soumu.go.jp/main_sosiki/jichi_zeisei/czaisei/czaisei_seido/080430_2_kojin.html)等を参照して下さい。

## インストール方法
`npm`または`yarn`を用いてインストールできます。
```bash
// with npm
$ npm install ateam-dev/furusato-tax.git

// with yarn
$ yarn add ateam-dev/furusato-tax.git
```

## 利用方法
詳細版のシミュレーション
```typescript
import { FurusatoTax } from "furusato-tax";

const house = new FurusatoTax({ selfSalary: 10_000_000 });
console.log(house.minimumSelfPayThreshold()); //=> 225852
```

収入と家族構成のみで計算する簡易版シミュレーション (参考: [総務省｜ふるさと納税ポータルサイト｜ふるさと納税のしくみ｜税金の控除について](http://www.soumu.go.jp/main_sosiki/jichi_zeisei/czaisei/czaisei_seido/furusato/mechanism/deduction.html))
```typescript
import { minimumSelfPayThresholdEasySimulation, FamilyType } from "furusato-tax";
console.log(minimumSelfPayThresholdEasySimulation(10_000_000, FamilyType.Single)); //=> 176000
```

## 貢献の仕方
本リポジトリに提案や修正がある場合は、IssueやPull Requestを作成して下さい。

### 開発環境の構築方法
```
$ yarn install
$ yarn run prepare
```

### テスト実行方法
```
$ yarn run test
```

## License
本ソフトウェアは、[Apache-2.0ライセンス](LICENSE)のもとで提供されています。
