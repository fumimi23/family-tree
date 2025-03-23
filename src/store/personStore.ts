import { type Person } from '@/schemas/personSchema';
import { create } from 'zustand';

interface PeopleStore {
  people: Person[];
  addPerson: (person: Person) => void;
  updatePerson: (person: Person) => void;
  deletePerson: (personId: string) => void;
}

export const usePeopleStore = create<PeopleStore>((set) => ({
  people: [],
  addPerson: (person: Person): void => { set((state: PeopleStore) => ({ people: [...state.people, person] })); },
  updatePerson: (person: Person): void => {
    set((state: PeopleStore) => ({
      people: state.people.map((p) => { return p.id === person.id ? person : p; }),
    }));
  },
  deletePerson: (personId: string): void => {
    set((state: PeopleStore) => ({
      people: state.people.filter((p) => p.id !== personId),
    }));
  },
}));
