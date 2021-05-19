import { Box, Typography } from '@material-ui/core';
import { TypographyProps } from '@material-ui/system';
import React, { FC } from 'react';
import { UploadChip } from '../../components/file';
import {
  useFileUploadEffects,
  TUseFileUploadEffectsArgs,
} from './FileUpload.effects';
import { useStyles } from './FileUpload.styles';

export interface FileUploadProps extends TUseFileUploadEffectsArgs {
  dropzoneText: string;
  heading?: string;
  headingProps?: TypographyProps;
  wrapperProps?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  >;
}

export const FileUpload: FC<FileUploadProps> = ({
  dropzoneText,
  apiUploadFunction,
  onChange,
  heading,
  headingProps,
  wrapperProps,
}) => {
  const {
    getRootProps,
    getInputProps,
    files,
    state,
    dispatch,
  } = useFileUploadEffects({ apiUploadFunction, onChange });
  const classes = useStyles();

  return (
    <Box>
      {heading && <Typography {...headingProps}>{heading}</Typography>}
      <section className={classes.wrapper} {...wrapperProps}>
        <div
          {...getRootProps({ className: classes.dropzone })}
          style={{
            ...(getRootProps().style as React.CSSProperties),
          }}
        >
          <input
            {...getInputProps()}
            style={{
              ...(getInputProps().style as React.CSSProperties),
            }}
          />
          <p className={classes.dropzoneText}>{dropzoneText}</p>
        </div>
        <aside className={classes.chipsContainer}>
          {files.map((file, index) => {
            const uploadedFile = state[index];

            if (!uploadedFile || uploadedFile.removed) {
              return null;
            }
            return (
              <UploadChip
                key={file.name + index}
                file={file}
                index={index}
                uploadedFile={uploadedFile}
                dispatch={dispatch}
              />
            );
          })}
        </aside>
      </section>
    </Box>
  );
};
