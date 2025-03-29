import { type Relation } from '@/schemas/relationSchema';
import { create } from 'zustand';

interface RelatonStore {
  relations: Relation[];
  addRelation: (relation: Relation) => void;
  updateRelation: (relation: Relation) => void;
  deleteRelation: (relationId: string) => void;
}

export const useRelationStore = create<RelatonStore>((set) => ({
  relations: [],
  addRelation: (relation: Relation): void => { set((state: RelatonStore) => ({ relations: [...state.relations, relation] })); },
  updateRelation: (relation: Relation): void => {
    set((state: RelatonStore) => ({
      relations: state.relations.map((r) => { return r.id === relation.id ? relation : r; }),
    }));
  },
  deleteRelation: (relationId: string): void => {
    set((state: RelatonStore) => ({
      relations: state.relations.filter((r) => r.id !== relationId),
    }));
  },
}));
