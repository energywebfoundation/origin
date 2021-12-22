/* deepscan-disable */
import React from 'react';
import { Meta, Story } from '@storybook/react';
import {
  Title,
  Description,
  Primary,
  ArgsTable,
  PRIMARY_STORY,
  Stories,
} from '@storybook/addon-docs';
import { DownloadableChip, DownloadableChipProps } from './DownloadableChip';

const description = `
  Component used for displaying downloadable files and handling download on click.
  Built with Chip component from MUI.`;

export default {
  title: 'File / DownloadableChip',
  component: DownloadableChip,
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
    label: {
      description: 'Label to be displayed on Chip',
    },
    fileName: {
      description: 'Name assigned to file when downloading it',
    },
    documentId: {
      description: 'ID of the document used for receiving it from the backend',
    },
    downloadFunc: {
      description: 'Function for retrieving file from the backend/storage',
      table: {
        type: {
          detail: '(documentId: string) => Promise<any>',
        },
      },
    },
  },
} as Meta;

const Template: Story<DownloadableChipProps> = (args) => {
  const downloadFile = async (fileId: string) => {
    alert(`Downloading ${args.fileName} with id ${fileId}`);
  };
  return <DownloadableChip downloadFunc={downloadFile} {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  label: 'Test file',
  fileName: 'Filename.pdf',
  documentId: '123-456-789',
};
