/* deepscan-disable */
import React, { useState } from 'react';
import { Meta, Story } from '@storybook/react';
import {
  Title,
  Description,
  Primary,
  ArgsTable,
  PRIMARY_STORY,
  Stories,
} from '@storybook/addon-docs';
import { FileUpload, FileUploadProps } from './FileUpload';

const description = `
  Component used for displaying downloadable files and handling download on click.
  Built with Chip component from MUI.`;

export default {
  title: 'File / FileUpload',
  component: FileUpload,
  parameters: {
    docs: {
      page: () => (
        <>
          <Title />
          <Description>{description}</Description>
          <Primary />
          <ArgsTable story={PRIMARY_STORY} />
          <Stories />
        </>
      ),
    },
  },
  argTypes: {
    dropzoneText: {
      description: 'Text to be displayed in the center of dropzone',
    },
    apiUploadFunction: {
      description: 'Function handling an API call uploading the file',
      table: {
        type: {
          detail: '(file: Blob[], options?: any) => Promise<string[]>',
        },
      },
      control: false,
    },
    onChange: {
      description:
        'Function handling change in files after upload is successful',
      control: false,
    },
    heading: {
      description: 'Text displayed as component heading',
    },
    headingProps: {
      description: 'Props supplied to `Typography` component of heading',
      table: {
        type: {
          summary: 'TypographyProps',
        },
      },
      control: false,
    },
    wrapperProps: {
      description:
        'Props supplied to the `section` element which wrapps the dropzone',
      control: false,
    },
    dropzoneClassName: {
      description:
        'className supplied to `getRootProps()` spread over a dropzone `div`',
      control: false,
    },
  },
} as Meta;

const Template: Story<FileUploadProps> = (args) => {
  const [addedFiles, setAddedFiles] = useState<File[]>([]);
  return <FileUpload onChange={setAddedFiles} {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  dropzoneText: 'Drag files here or click to upload',
  apiUploadFunction: async (file: Blob[]) => {
    alert(`uploading file`);
    return ['uploading file'];
  },
};
