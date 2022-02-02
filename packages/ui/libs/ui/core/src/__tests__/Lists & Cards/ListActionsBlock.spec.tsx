import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/list/ListActionsBlock/ListActionsBlock.stories';
import { ListActionsBlockProps } from '../../components/list/ListActionsBlock/ListActionsBlock';

const { Default } = composeStories(stories);

describe('ListActionsBlock', () => {
  it('should render default ListActionsBlock', () => {
    const { baseElement, getByText, getAllByRole } = render(
      <Default {...(Default.args as ListActionsBlockProps<any>)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getAllByRole('tab')).toHaveLength(Default.args.actions.length);
    expect(baseElement.querySelector('.MuiTabs-root')).toBeInTheDocument();
    expect(getByText(Default.args.actions[0].name)).toBeInTheDocument();
    expect(
      getByText(`${Default.args.actions[0].name} action text`)
    ).toBeInTheDocument();
    expect(baseElement.querySelector('.Mui-selected')).toHaveTextContent(
      Default.args.actions[0].name
    );
  });

  it('should switch tabs', () => {
    const { baseElement, getByText, getAllByRole } = render(
      <Default {...(Default.args as ListActionsBlockProps<any>)} />
    );

    fireEvent.click(getAllByRole('tab')[1]);
    expect(getByText(Default.args.actions[1].name)).toBeInTheDocument();
    expect(baseElement.querySelector('.Mui-selected')).toHaveTextContent(
      Default.args.actions[1].name
    );
    expect(
      getByText(`${Default.args.actions[1].name} action text`)
    ).toBeInTheDocument();
  });
});
