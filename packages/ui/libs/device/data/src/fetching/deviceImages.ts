import { useEffect, useState } from 'react';
import { ComposedPublicDevice } from '../types';
import { publicFileDownloadHandler } from './file';

export const useDeviceImageUrls = (
  imageIds: ComposedPublicDevice['imageIds']
) => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const getImageUrl = async (id: string) => {
    const response = await publicFileDownloadHandler(id);
    const imageType = (response as any).headers['content-type'];
    const blob = new Blob(
      [Buffer.from(((response.data as any).data as unknown) as string)],
      {
        type: imageType,
      }
    );
    const urlCreator = window.URL || window.webkitURL;
    const imageUrl = urlCreator.createObjectURL(blob);
    return imageUrl;
  };

  const getAndSetAllImages = async (imageIds: string[]) => {
    const receivedUrls = await Promise.all(
      imageIds.map(async (id) => await getImageUrl(id))
    );
    setImageUrls(receivedUrls);
  };

  useEffect(() => {
    if (imageIds?.length > 0) {
      getAndSetAllImages(imageIds);
    }
  }, [imageIds]);

  return imageUrls;
};
