# 家系図スキーマ

## 人物データ

- ID
  - uuidv4
- 苗字
- 旧姓 (maidenName)
  - オプション。出生時の姓 (真の旧姓)。中間の改姓履歴は扱わない
- 名前
- 苗字カナ
- 名前カナ
- 性別
  - オプション
- 生年月日
  - オプション
- 没年月日
  - オプション
- 戒名
  - オプション

## 関係データ

- ID
  - uuidv4
- 関係タイプ
  - parent‐child: 親子(実子)
  - parent-adopted‐child: 親子(養子)
  - married-couple: 夫婦
  - couple: 事実婚
- 人ID1
- 人ID2
- 離婚済み (divorced)
  - オプション、boolean。married-couple / couple のみ指定可