import { CncDailyReport } from '../types';

export interface DriveUploadResult {
  fileId: string;
  name: string;
  webViewLink?: string;
  webContentLink?: string;
}

/**
 * Creates or finds a folder in Google Drive named "Laporan CNC PT Labtech"
 */
export async function getOrCreateReportsFolder(accessToken: string): Promise<string> {
  const folderName = 'Laporan CNC PT Labtech';
  // Search for folder
  const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`;

  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!searchRes.ok) {
    const errText = await searchRes.text();
    console.error('Google Drive search failed:', errText);
    throw new Error('Gagal mengakses Google Drive.');
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    console.error('Failed to create folder in Google Drive:', errText);
    throw new Error('Gagal membuat folder di Google Drive.');
  }

  const folderData = await createRes.json();
  return folderData.id;
}

/**
 * Uploads a CNC Daily Report JSON backup directly to user's Google Drive
 */
export async function uploadReportToGoogleDrive(
  report: CncDailyReport,
  accessToken: string
): Promise<DriveUploadResult> {
  const folderId = await getOrCreateReportsFolder(accessToken);
  const fileName = `Laporan_CNC_${report.id}_${(report.sasaNo || 'SPK').replace(/\s+/g, '_')}_${report.dayAndDate.replace(/\s+/g, '_')}.json`;
  const fileContent = JSON.stringify(report, null, 2);

  const metadata = {
    name: fileName,
    parents: [folderId],
    mimeType: 'application/json',
    description: `Laporan Harian Mesin CNC: Operator ${report.operatorName}, Shift ${report.shift}, SPK ${report.sasaNo}`,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const uploadUrl =
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink';

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const errData = await res.text();
    console.error('Google Drive upload error:', errData);
    throw new Error('Gagal mengunggah laporan ke Google Drive.');
  }

  const data = await res.json();
  return {
    fileId: data.id,
    name: data.name,
    webViewLink: data.webViewLink,
    webContentLink: data.webContentLink,
  };
}

/**
 * List files in the CNC reports folder in Google Drive
 */
export async function listDriveReportBackups(accessToken: string) {
  try {
    const folderId = await getOrCreateReportsFolder(accessToken);
    const query = `'${folderId}' in parents and trashed=false`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      query
    )}&fields=files(id,name,webViewLink,createdTime,size)&orderBy=createdTime desc`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.error('Failed to list files from Google Drive:', err);
    return [];
  }
}
