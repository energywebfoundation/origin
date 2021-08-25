import { useEffect, useState } from 'react';
import { ComposedPublicDevice } from '../types';
import { fileDownloadHandler } from './file';

export const useDeviceImageUrl = (
  imageIds: ComposedPublicDevice['imageIds']
) => {
  const [imageUrl, setImageUrl] = useState<string>(null);

  const getAndSetImage = async (id: string) => {
    const response = await fileDownloadHandler(id);
    const imageType = (response as any).headers['content-type'];
    const blob = new Blob(
      [Buffer.from((response.data as any).data as unknown as string)],
      {
        type: imageType,
      }
    );
    const urlCreator = window.URL || window.webkitURL;
    const imageUrl = urlCreator.createObjectURL(blob);
    setImageUrl(imageUrl);
  };

  useEffect(() => {
    if (imageIds?.length > 0) {
      getAndSetImage(imageIds[0]);
    }
  }, [imageIds]);

  return imageUrl;
};
