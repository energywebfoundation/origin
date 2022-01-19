import { LightenColor } from '@energyweb/origin-ui-theme';
import { Cancel, Delete, Replay } from '@mui/icons-material';
import { useTheme } from '@mui/material';
import React from 'react';
import { UploadChipProps } from './UploadChip';

export const useUploadChipEffects = ({
  file,
  uploadedFile,
  index,
  dispatch,
}: UploadChipProps) => {
  const theme = useTheme();
  const originBgColor = theme.palette.background.paper;
  const originTextColor = theme.palette.primary.contrastText;

  const lightenBgColor = LightenColor(originBgColor, 3, theme.palette.mode);
  const bgColorLight = LightenColor(originTextColor, -10, theme.palette.mode);

  const chipLabel = `${
    file.name.length > 20 ? file.name.slice(0, 20) + '...' : file.name
  }${uploadedFile.cancelled ? ' (Cancelled, click to retry)' : ''}`;

  const chipIcon = uploadedFile.cancelled ? <Replay /> : null;

  const chipDeleteIcon =
    uploadedFile.uploadedName || uploadedFile.cancelled ? (
      <Delete color="error" />
    ) : (
      <Cancel color="error" />
    );

  const deleteHandler = () => {
    if (uploadedFile.uploadedName || uploadedFile.cancelled) {
      dispatch({
        type: 'deleteFile',
        payload: {
          id: index,
        },
      });
    } else {
      uploadedFile.cancelToken.cancel();

      dispatch({
        type: 'cancelFileUpload',
        payload: {
          id: index,
        },
      });
    }
  };

  return {
    lightenBgColor,
    bgColorLight,
    chipLabel,
    chipIcon,
    chipDeleteIcon,
    deleteHandler,
  };
};
