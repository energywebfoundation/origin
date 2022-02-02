import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { verticalHeaders } from '../../containers/CardsTable/mocks';
import { provideTheme } from '../utils';

import { CardTableVerticalHeaders } from '../../components/cardTable/CardTableVerticalHeaders/CardTableVerticalHeaders';

describe('CardTableVerticalHeaders', () => {
  it('should render default CardTableVerticalHeaders', () => {
    const { baseElement } = render(
      provideTheme(
        <CardTableVerticalHeaders verticalHeaders={verticalHeaders} />
      )
    );
    expect(baseElement).toBeInTheDocument();
  });
});
