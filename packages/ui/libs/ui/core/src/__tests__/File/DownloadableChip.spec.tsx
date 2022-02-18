import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../containers/DownloadableChip/DownloadableChip.stories';
import { DownloadableChipProps } from '../../containers/DownloadableChip/DownloadableChip';

const { Default } = composeStories(stories);

const downloadFuncMock = jest.fn();

describe('DownloadableChip', () => {
  it('should render default DownloadableChip', () => {
    const { baseElement, getByTestId } = render(
      <Default {...(Default.args as DownloadableChipProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByTestId('GetAppIcon')).toBeInTheDocument();
    expect(baseElement.querySelector('.MuiChip-label')).toHaveTextContent(
      Default.args.label
    );
  });

  it('download handler should work', () => {
    const { getByRole } = render(
      <Default
        {...(Default.args as DownloadableChipProps)}
        downloadFunc={downloadFuncMock}
      />
    );
    fireEvent.click(getByRole('button'));
    expect(downloadFuncMock).toBeCalled();
  });
});
