export type MarriageLineType = 'couple' | 'married';

export interface PersonNodeLayout {
  personId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  showFamilyName: boolean;
}

export interface MarriageEdgeLayout {
  id: string;
  type: MarriageLineType;
  x1: number;
  x2: number;
  y: number;
  divorced: boolean;
}

export interface ChildLinkLayout {
  childPersonId: string;
  childX: number;
  childTopY: number;
  adopted: boolean;
}

export interface ParentChildrenGroupLayout {
  id: string;
  parentAnchorX: number;
  parentAnchorY: number;
  busY: number;
  children: ChildLinkLayout[];
}

export interface SecondaryParentEdgeLayout {
  id: string;
  parentAnchorX: number;
  parentAnchorY: number;
  busY: number;
  childX: number;
  childTopY: number;
  adopted: boolean;
}

/*
 * 同一人物の 2 回目以降の婚姻を表現するための線。
 * primary 婚姻 (MarriageEdgeLayout) と区別するため、両ノードの下方に
 * オフセットを付けて段差状に引く (= ジェノグラム慣例の段差表現)。
 * primaryAnchor / spouseAnchor は相手方向のノード側面 (左/右) の中央高さで、
 * busY は両ノードの下端より下に置く。
 */
export interface SecondaryMarriageEdgeLayout {
  id: string;
  type: MarriageLineType;
  // primary 人物ノードの相手方向側面、中央高さ
  primaryAnchorX: number;
  primaryAnchorY: number;
  // 配偶者ノードの相手方向側面、中央高さ
  spouseAnchorX: number;
  spouseAnchorY: number;
  // 段差用にベンドする y 座標 (両ノードの下端より下)
  busY: number;
  divorced: boolean;
}

export interface GenerationRowLayout {
  generation: number;
  y: number;
  height: number;
}

export interface FamilyTreeLayout {
  nodes: PersonNodeLayout[];
  marriageEdges: MarriageEdgeLayout[];
  secondaryMarriageEdges: SecondaryMarriageEdgeLayout[];
  parentGroups: ParentChildrenGroupLayout[];
  secondaryParentEdges: SecondaryParentEdgeLayout[];
  generationRows: GenerationRowLayout[];
  width: number;
  height: number;
}
