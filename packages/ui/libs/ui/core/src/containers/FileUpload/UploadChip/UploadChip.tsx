import { Chip } from '@mui/material';
import React, { Dispatch, FC } from 'react';
import type { FileUploadAction, UploadedFile } from '../FileUpload.types';
import { useUploadChipEffects } from './UploadChip.effects';

export interface UploadChipProps {
  file: File;
  index: number;
  uploadedFile: UploadedFile;
  dispatch: Dispatch<FileUploadAction>;
}

export const UploadChip: FC<UploadChipProps> = ({
  file,
  index,
  uploadedFile,
  dispatch,
}) => {
  const {
    lightenBgColor,
    bgColorLight,
    chipLabel,
    chipIcon,
    chipDeleteIcon,
    deleteHandler,
  } = useUploadChipEffects({ file, index, uploadedFile, dispatch });

  return (
    <Chip
      variant="outlined"
      color="primary"
      label={chipLabel}
      icon={chipIcon}
      deleteIcon={chipDeleteIcon}
      clickable={uploadedFile.cancelled}
      onDelete={deleteHandler}
      style={{
        margin: 5,
        background: `-webkit-linear-gradient(left, ${
          uploadedFile.cancelled ? lightenBgColor : bgColorLight
        } ${
          uploadedFile.cancelled ? '100' : uploadedFile.uploadProgress
        }%, rgba(255, 255, 255, 0) 0%)`,
        cursor: uploadedFile.cancelled ? 'pointer' : 'default',
      }}
      key={index}
    />
  );
};
