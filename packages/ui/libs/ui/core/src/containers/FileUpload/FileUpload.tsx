import { Box, Typography, TypographyProps } from '@mui/material';
import React, { FC } from 'react';
import { UploadChip } from './UploadChip';
import { useFileUploadEffects } from './FileUpload.effects';
import { useStyles } from './FileUpload.styles';
import {
  ApiUploadFunction,
  FileUploadOnChangeFunction,
} from './FileUpload.types';

export interface FileUploadProps {
  dropzoneText: string;
  apiUploadFunction: ApiUploadFunction;
  onChange: FileUploadOnChangeFunction;
  heading?: string;
  headingProps?: TypographyProps;
  wrapperProps?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > & { ['data-cy']?: string };
  dropzoneClassName?: string;
}

export const FileUpload: FC<FileUploadProps> = ({
  dropzoneText,
  apiUploadFunction,
  onChange,
  heading,
  headingProps,
  wrapperProps,
  dropzoneClassName,
}) => {
  const { getRootProps, getInputProps, files, state, dispatch } =
    useFileUploadEffects({ apiUploadFunction, onChange });
  const classes = useStyles();
  const dropzoneClasses = `${classes.dropzone} ${dropzoneClassName}`;

  return (
    <Box>
      {heading && <Typography {...headingProps}>{heading}</Typography>}
      <section className={classes.wrapper} {...wrapperProps}>
        <div
          {...getRootProps({ className: dropzoneClasses })}
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
