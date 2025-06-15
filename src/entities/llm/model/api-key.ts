import { atom } from '@reatom/core';

export const apiKey = atom<string | null>(null, `apiKey`);
