import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../containers/CardsTable/CardsTable.stories';
import { CardsTableProps } from '../../containers/CardsTable/CardsTable.types';

const { Default } = composeStories(stories);

describe('CardsTable', () => {
  it('should render default CardsTable', () => {
    const { baseElement } = render(
      <Default {...(Default.args as CardsTableProps<any, any>)} />
    );
    expect(baseElement).toBeInTheDocument();
  });
});
