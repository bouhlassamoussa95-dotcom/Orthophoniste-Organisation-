import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';

export type PhotoSecurityLocale = 'en' | 'fr' | 'ar';

const securityText = {
  en: { reason: 'Authorize access to the clinic toy photo gallery and files.', cancel: 'Cancel', fallback: 'Use device passcode', title: 'Verify it is you', subtitle: 'Authenticate before opening the clinic photo picker', native: 'Photo security is available in the installed SpeechCare app, not browser preview.', locked: 'Set up fingerprint, face unlock or a secure screen lock before adding clinic photos.', unsupported: 'Choose a JPEG, PNG, WebP or GIF image.', unreadable: 'The selected photo could not be read. Please choose another image.', filePath: 'This file path is unavailable on the device. Choose an image from the gallery instead.', imageOnly: 'Please choose an image file.', tooLarge: 'Please choose an image smaller than 12 MB.' },
  fr: { reason: 'Autorisez l’accès aux photos du matériel du cabinet.', cancel: 'Annuler', fallback: 'Utiliser le code de l’appareil', title: 'Vérifiez votre identité', subtitle: 'Authentifiez-vous avant d’ouvrir les photos du cabinet', native: 'La protection des photos est disponible dans l’application SpeechCare installée, pas dans l’aperçu web.', locked: 'Activez l’empreinte, la reconnaissance faciale ou un verrouillage sécurisé avant d’ajouter des photos.', unsupported: 'Choisissez une image JPEG, PNG, WebP ou GIF.', unreadable: 'La photo sélectionnée est illisible. Choisissez une autre image.', filePath: 'Le chemin du fichier est indisponible. Choisissez plutôt une photo depuis la galerie.', imageOnly: 'Veuillez choisir un fichier image.', tooLarge: 'Choisissez une image de moins de 12 Mo.' },
  ar: { reason: 'أكد هويتك قبل فتح صور ألعاب ووسائل العيادة.', cancel: 'إلغاء', fallback: 'استعمل رمز الهاتف', title: 'أكد بلي راك نتا', subtitle: 'أكد هويتك قبل فتح معرض الصور', native: 'حماية الصور تخدم غير في تطبيق SpeechCare المثبّت، ماشي في معاينة المتصفح.', locked: 'فعّل البصمة ولا قفل الهاتف برمز قبل ما تزيد صور العيادة.', unsupported: 'اختار صورة بصيغة JPEG ولا PNG ولا WebP ولا GIF.', unreadable: 'ما قدرناش نقراو الصورة. اختار صورة أخرى.', filePath: 'مسار الملف ما هوش متاح. جرّب اختار الصورة من المعرض.', imageOnly: 'اختار ملف صورة من فضلك.', tooLarge: 'اختار صورة أقل من 12 ميغابايت.' }
} as const;

export interface StoredToyPhoto {
  relativePath: string;
  displayUrl: string;
}

/**
 * Fail-closed native authorization. The OS biometric prompt may fall back to
 * the device PIN/pattern/password. Browser preview cannot bypass this gate.
 */
export async function authorizeToyPhotoAccess(locale: PhotoSecurityLocale = 'en'): Promise<void> {
  const text = securityText[locale];
  if (!Capacitor.isNativePlatform()) {
    throw new Error(text.native);
  }

  const info = await BiometricAuth.checkBiometry();
  if (!info.isAvailable && !info.deviceIsSecure) {
    throw new Error(text.locked);
  }

  await BiometricAuth.authenticate({
    reason: text.reason,
    cancelTitle: text.cancel,
    allowDeviceCredential: true,
    iosFallbackTitle: text.fallback,
    androidTitle: text.title,
    androidSubtitle: text.subtitle,
    androidConfirmationRequired: false,
  });
}

async function storeBase64Photo(toyId: string, data: string, mimeType = 'image/jpeg', locale: PhotoSecurityLocale = 'en'): Promise<StoredToyPhoto> {
  const text = securityText[locale];
  const normalizedMime = mimeType.toLowerCase().split(';')[0].trim();
  const extensionByMime: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
  const extension = extensionByMime[normalizedMime];
  if (!extension) throw new Error(text.unsupported);
  const cleanBase64 = data.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '').trim();
  if (!cleanBase64) throw new Error(text.unreadable);

  const relativePath = `speechcare/toy-inventory/${toyId}.${extension}`;
  await Filesystem.writeFile({
    path: relativePath,
    data: cleanBase64,
    directory: Directory.Data,
    recursive: true,
  });

  const uri = await Filesystem.getUri({ path: relativePath, directory: Directory.Data });
  return { relativePath, displayUrl: Capacitor.convertFileSrc(uri.uri) };
}

/** Authenticate, then open Android/iOS photo gallery using Capacitor Camera. */
export async function pickAndStoreToyPhoto(toyId: string, locale: PhotoSecurityLocale = 'en'): Promise<StoredToyPhoto | null> {
  await authorizeToyPhotoAccess(locale);
  const photo = await Camera.getPhoto({
    source: CameraSource.Photos,
    resultType: CameraResultType.DataUrl,
    quality: 82,
    width: 1200,
    height: 1200,
    correctOrientation: true,
    allowEditing: true,
  });
  return photo.dataUrl ? storeBase64Photo(toyId, photo.dataUrl, photo.format === 'png' ? 'image/png' : photo.format === 'webp' ? 'image/webp' : 'image/jpeg', locale) : null;
}

/** Authenticate, then open the native document/file picker for an image file. */
export async function pickAndStoreToyFile(toyId: string, locale: PhotoSecurityLocale = 'en'): Promise<StoredToyPhoto | null> {
  await authorizeToyPhotoAccess(locale);
  const text = securityText[locale];
  const result = await FilePicker.pickFiles({ types: ['image/*'], limit: 1, readData: false });
  const selected = result.files[0];
  if (!selected) return null;
  if (selected.size > 12 * 1024 * 1024) throw new Error(text.tooLarge);
  if (!selected.path) throw new Error(text.filePath);
  let mimeType = (selected.mimeType || '').toLowerCase();
  if (!mimeType.startsWith('image/')) throw new Error(text.imageOnly);
  if (mimeType === 'image/jpg') mimeType = 'image/jpeg';
  if (mimeType === 'image/x-png') mimeType = 'image/png';
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mimeType)) {
    throw new Error(text.unsupported);
  }

  const file = await Filesystem.readFile({ path: selected.path });
  if (typeof file.data !== 'string') throw new Error(text.unreadable);
  return storeBase64Photo(toyId, file.data, mimeType, locale);
}

export async function resolveToyPhoto(relativePath?: string): Promise<string | null> {
  if (!relativePath || !Capacitor.isNativePlatform()) return null;
  try {
    const uri = await Filesystem.getUri({ path: relativePath, directory: Directory.Data });
    return Capacitor.convertFileSrc(uri.uri);
  } catch {
    return null;
  }
}

export async function deleteToyPhoto(relativePath?: string): Promise<void> {
  if (!relativePath || !Capacitor.isNativePlatform()) return;
  try {
    await Filesystem.deleteFile({ path: relativePath, directory: Directory.Data });
  } catch {
    // Missing photo files are harmless; toy state can still be deleted.
  }
}
