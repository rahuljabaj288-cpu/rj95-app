/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Tender } from '../types';

/**
 * Creates or retrieves a designated folder on Google Drive for BMSICL Ledger backups & attachments.
 */
export async function getOrCreateBmsiclFolder(accessToken: string): Promise<string> {
  const folderName = "BMSICL Tenders Ledger Vault";
  const q = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  
  try {
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id)`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        return searchData.files[0].id;
      }
    }
    
    // Create new folder
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
      const errorText = await createRes.text();
      console.warn('Could not create dedicated folder, defaulting to root Drive folder', errorText);
      return '';
    }
    
    const createdFolder = await createRes.json();
    return createdFolder.id || '';
  } catch (err) {
    console.error('getOrCreateBmsiclFolder error:', err);
    return '';
  }
}

/**
 * Lists files in the Google Drive associated with the app or general files.
 */
export async function listGoogleDriveFiles(accessToken: string, folderId?: string): Promise<any[]> {
  try {
    let q = "trashed = false";
    if (folderId) {
      q += ` and '${folderId}' in parents`;
    } else {
      q += ` and (name contains 'BMSICL' or name contains 'Tender')`;
    }
    
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&orderBy=createdTime desc&pageSize=30&fields=files(id,name,mimeType,webViewLink,iconLink,size,createdTime)`;
    
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Google Drive Listing Failed: ${errorText}`);
    }

    const data = await res.json();
    return data.files || [];
  } catch (error) {
    console.error("Error listing Drive files:", error);
    throw error;
  }
}

/**
 * Uploads an arbitrary file (blob) to Google Drive in the specified folder.
 */
export async function uploadFileToGoogleDrive(
  accessToken: string,
  fileName: string,
  mimeType: string,
  contentBlob: Blob,
  folderId?: string
): Promise<{ id: string; name: string; webViewLink: string; size: string; createdTime: string }> {
  try {
    const metadata: any = {
      name: fileName,
      mimeType: mimeType,
    };
    if (folderId) {
      metadata.parents = [folderId];
    }

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', contentBlob);

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,mimeType,createdTime,size', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Google Drive Upload API Failed: ${errorText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error uploading to Google Drive:", error);
    throw error;
  }
}

/**
 * Deletes a file from Google Drive (with permission confirmation)
 */
export async function deleteDriveFile(fileId: string, accessToken: string): Promise<void> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to delete Google Drive file: ${errorText}`);
  }
}
