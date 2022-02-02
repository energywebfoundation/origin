import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../containers/FileUpload/FileUpload.stories';
import { FileUploadProps } from '../../containers/FileUpload/FileUpload';

const { Default } = composeStories(stories);

const file = new File(['testimage'], 'testimage.png', { type: 'image/png' });
const uploadFunctionMock = async () => {
  return ['uploading file'];
};

describe('FileUpload', () => {
  it('should render default FileUpload', () => {
    const { baseElement } = render(
      <Default
        {...(Default.args as FileUploadProps)}
        apiUploadFunction={uploadFunctionMock}
      />
    );
    expect(baseElement).toBeInTheDocument();
  });

  it('should upload file', async () => {
    const { baseElement } = render(
      <Default
        {...(Default.args as FileUploadProps)}
        apiUploadFunction={uploadFunctionMock}
      />
    );
    await waitFor(() =>
      fireEvent.change(baseElement.querySelector('input'), {
        target: { files: [file] },
      })
    );
    expect(baseElement.querySelector('.MuiChip-label')).toHaveTextContent(
      'testimage.png'
    );
  });
});
