import {
  CertificateDTO,
  useIrecCertificateControllerGetAll,
} from '@energyweb/issuer-irec-api-react-query-client';

export const useIrecCertificates = () => {
  const { data, isLoading } = useIrecCertificateControllerGetAll();

  const certificates = data ?? ([] as CertificateDTO[]);

  return { certificates, isLoading };
};
