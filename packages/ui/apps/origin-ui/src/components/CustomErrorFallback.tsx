import { ErrorFallback } from '@energyweb/origin-ui-core';
import { Box, Button } from '@material-ui/core';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface CustomErrorFallbackProps {
  error: Error;
}

export const CustomErrorFallback: FC<CustomErrorFallbackProps> = ({
  error,
}) => {
  const { t } = useTranslation();
  const title = t('error.somethingWentWrong');
  const reloadButton = t('error.reloadPage');
  const returnHomeButton = t('error.returnToHome');

  return (
    <ErrorFallback title={title} error={error}>
      <Box mt={2} display="flex" justifyContent="center">
        <Button variant="contained">{reloadButton}</Button>
        <Box ml={2}>
          <Button variant="contained">{returnHomeButton}</Button>
        </Box>
      </Box>
    </ErrorFallback>
  );
};
