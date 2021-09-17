import { CardTableItem, TVerticalHeader } from '../../components';

export const useCardsTableEffects = <VerticalHeaderId, HeaderId>(
  verticalHeaders: TVerticalHeader<VerticalHeaderId>[],
  rows: CardTableItem<HeaderId, VerticalHeaderId>[][]
) => {
  const orderedRows = verticalHeaders.map((header) =>
    rows.find((row) => row[0].verticalHeaderId === header.id)
  );

  return { orderedRows };
};
