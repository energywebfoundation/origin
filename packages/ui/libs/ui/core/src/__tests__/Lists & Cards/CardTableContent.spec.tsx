import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { headers, rows } from '../../containers/CardsTable/mocks';
import { provideTheme } from '../utils';

import { CardTableContent } from '../../components/cardTable/CardTableContent/CardTableContent';

describe('CardTableContent', () => {
  it('should render default CardTableContent', () => {
    const { baseElement } = render(
      provideTheme(<CardTableContent rows={rows} headers={headers} />)
    );
    expect(baseElement).toBeInTheDocument();
  });
});
