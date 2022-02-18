import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  TotalHeader,
  totalColumnItems,
} from '../../containers/CardsTable/mocks';
import { provideTheme } from '../utils';

import { CardTableTotalColumn } from '../../components/cardTable/CardTableTotalColumn/CardTableTotalColumn';

describe('CardTableTotalColumn', () => {
  it('should render default CardTableTotalColumn', () => {
    const { baseElement } = render(
      provideTheme(
        <CardTableTotalColumn
          totalItems={totalColumnItems}
          header={TotalHeader}
        />
      )
    );
    expect(baseElement).toBeInTheDocument();
  });
});
