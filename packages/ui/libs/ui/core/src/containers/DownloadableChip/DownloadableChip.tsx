import React, { FC } from 'react';
import { Chip } from '@mui/material';
import { GetApp } from '@mui/icons-material';
import {
  ApiDownloadFunction,
  useDownloadableChipEffects,
} from './DownloadableChip.effects';
import { useStyles } from './DownloadableChip.styles';

interface DownloadableChipProps {
  label: string;
  downloadFunc: ApiDownloadFunction;
  documentId: string;
  name: string;
  dataCy?: string;
}

export const DownloadableChip: FC<DownloadableChipProps> = ({
  downloadFunc,
  documentId,
  name,
  label,
  dataCy,
}) => {
  const { downloadFileHandler } = useDownloadableChipEffects();
  const classes = useStyles();
  return (
    <Chip
      label={label ?? 'Download file'}
      variant="outlined"
      color="primary"
      onClick={() => downloadFileHandler(downloadFunc, documentId, name)}
      icon={<GetApp color="primary" />}
      className={classes.chip}
      {...(dataCy && { ['data-cy']: dataCy })}
    />
  );
};
