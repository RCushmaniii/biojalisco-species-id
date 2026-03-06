import { put, del } from '@vercel/blob';

export async function uploadImage(
  base64Data: string,
  filename: string
): Promise<{ url: string; pathname: string }> {
  // Convert base64 to Buffer
  const buffer = Buffer.from(base64Data, 'base64');

  // Compress with sharp
  const sharp = (await import('sharp')).default;
  const compressed = await sharp(buffer)
    .jpeg({ quality: 80 })
    .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
    .toBuffer();

  const blob = await put(`observations/${filename}.jpg`, compressed, {
    access: 'public',
    contentType: 'image/jpeg',
  });

  return { url: blob.url, pathname: blob.pathname };
}

export async function deleteImage(url: string): Promise<void> {
  await del(url);
}
