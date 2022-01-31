import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../containers/FileUpload/FileUpload.stories';
import { FileUploadProps } from '../../containers/FileUpload/FileUpload';

const { Default } = composeStories(stories);

describe('FileUpload', () => {
  it('should render default FileUpload', () => {
    const { baseElement } = render(
      <Default {...(Default.args as FileUploadProps)} />
    );
    expect(baseElement).toBeInTheDocument();
  });
});
