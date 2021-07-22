import { FileUpload } from '@energyweb/origin-ui-core';
import { DocsUploadFormValues } from '@energyweb/origin-ui-organization-logic';
import { Box, Button, Divider } from '@material-ui/core';
import React, { FC } from 'react';
import { useRegisterOrgDocsEffects } from './RegisterOrgDocs.effects';
import { useStyles } from './RegisterOrgDocs.styles';

interface RegisterOrgDocsProps {
  submitHandler: (values: DocsUploadFormValues) => void;
}

export const RegisterOrgDocs: FC<RegisterOrgDocsProps> = ({
  submitHandler,
}) => {
  const {
    values,
    uploadText,
    uploadFunction,
    onCompanyProofsChange,
    companyProofHeading,
    onSignatoryIdChange,
    signatoryIdTHeading,
    buttonDisabled,
    buttonText,
  } = useRegisterOrgDocsEffects();
  const classes = useStyles();

  return (
    <Box>
      <FileUpload
        dropzoneText={uploadText}
        heading={companyProofHeading}
        apiUploadFunction={uploadFunction}
        onChange={onCompanyProofsChange}
      />
      <Divider className={classes.divider} />
      <FileUpload
        heading={signatoryIdTHeading}
        dropzoneText={uploadText}
        apiUploadFunction={uploadFunction}
        onChange={onSignatoryIdChange}
      />
      <Box mt={1} display="flex" justifyContent="flex-end">
        <Button
          color="primary"
          name="submit"
          size="large"
          variant="contained"
          disabled={buttonDisabled}
          onClick={() => submitHandler(values)}
        >
          {buttonText}
        </Button>
      </Box>
    </Box>
  );
};
