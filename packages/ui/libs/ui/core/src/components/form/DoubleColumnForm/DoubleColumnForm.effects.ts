import { GenericFormField } from '../../../containers';

export const useDoubleColumnFormEffects = (fields: GenericFormField[]) => {
  const firstSliceRange = Math.ceil(fields.length / 2);

  const firstColumn = fields.slice(0, firstSliceRange);
  const secondColumn = fields.slice(firstSliceRange, fields.length);

  return { firstColumn, secondColumn };
};
