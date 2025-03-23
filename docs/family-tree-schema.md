# 家系図スキーマ

## 人データ

- ID
  - uuidv4
- 苗字
- 名前
- 苗字カナ
- 名前カナ
- 生年月日
  - オプション
- 没年月日
  - オプション
- 戒名
  - オプション

## 関係性データ

- ID
  - uuidv4
- 関係性タイプ
  - parent‐child: 親子
  - married-couple: 夫婦
  - couple: 事実婚
- 人ID1
- 人ID2