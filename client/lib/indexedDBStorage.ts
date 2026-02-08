// IndexedDB storage for persistent media with better storage capacity than localStorage
// Supports up to 50MB+ per domain, much better than localStorage's 5-10MB limit

const DB_NAME = "uok_media_db";
const DB_VERSION = 1;
const MEDIA_STORE = "media";

let db: IDBDatabase | null = null;

// Initialize IndexedDB
export async function initializeIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("IndexedDB initialization failed");
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log("✅ IndexedDB initialized successfully");
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create object store if it doesn't exist
      if (!database.objectStoreNames.contains(MEDIA_STORE)) {
        const objectStore = database.createObjectStore(MEDIA_STORE, {
          keyPath: "id",
        });
        objectStore.createIndex("timestamp", "timestamp", { unique: false });
        objectStore.createIndex("type", "type", { unique: false });
        console.log("✅ IndexedDB object store created");
      }
    };
  });
}

// Get database instance (initialize if needed)
async function getDB(): Promise<IDBDatabase> {
  if (db) return db;
  return initializeIndexedDB();
}

// Store media file with metadata
export async function storeMedia(
  file: File,
  metadata: {
    id: string;
    type: "photo" | "video";
    timestamp: string;
    date: string;
    mood?: string;
    visibility?: string;
  },
): Promise<{
  id: string;
  url: string;
  cachedAt: string;
}> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;

      const transaction = database.transaction([MEDIA_STORE], "readwrite");
      const objectStore = transaction.objectStore(MEDIA_STORE);

      const mediaRecord = {
        ...metadata,
        data: arrayBuffer, // Store actual file data
        fileSize: file.size,
        fileName: file.name,
        cachedAt: new Date().toISOString(),
      };

      const request = objectStore.put(mediaRecord);

      request.onsuccess = () => {
        console.log(`✅ Media stored in IndexedDB: ${metadata.id}`);
        // Return object URL that can be used immediately
        const blob = new Blob([arrayBuffer], { type: file.type });
        const url = URL.createObjectURL(blob);

        resolve({
          id: metadata.id,
          url: url,
          cachedAt: mediaRecord.cachedAt,
        });
      };

      request.onerror = () => {
        console.error("Error storing media:", request.error);
        reject(request.error);
      };
    };

    reader.onerror = () => {
      console.error("Error reading file:", reader.error);
      reject(reader.error);
    };

    reader.readAsArrayBuffer(file);
  });
}

// Retrieve media URL from IndexedDB
export async function getMediaUrl(mediaId: string): Promise<string | null> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([MEDIA_STORE], "readonly");
    const objectStore = transaction.objectStore(MEDIA_STORE);
    const request = objectStore.get(mediaId);

    request.onsuccess = () => {
      if (request.result && request.result.data) {
        try {
          // Determine media type based on stored metadata
          let mimeType = "image/jpeg";
          if (request.result.type === "video") {
            mimeType = "video/mp4";
          }

          const blob = new Blob([request.result.data], {
            type: mimeType,
          });
          const url = URL.createObjectURL(blob);
          resolve(url);
        } catch (error) {
          console.error("Error creating blob URL:", error);
          resolve(null);
        }
      } else {
        resolve(null);
      }
    };

    request.onerror = () => {
      console.error("Error retrieving media:", request.error);
      reject(request.error);
    };
  });
}

// Get all media metadata (without actual file data for performance)
export async function getAllMediaMetadata(): Promise<any[]> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([MEDIA_STORE], "readonly");
    const objectStore = transaction.objectStore(MEDIA_STORE);
    const request = objectStore.getAll();

    request.onsuccess = () => {
      const results = request.result.map((record) => ({
        id: record.id,
        type: record.type,
        timestamp: record.timestamp,
        date: record.date,
        mood: record.mood,
        visibility: record.visibility,
        fileSize: record.fileSize,
        fileName: record.fileName,
        cachedAt: record.cachedAt,
        // Don't include 'data' field to keep it lightweight
      }));
      resolve(results);
    };

    request.onerror = () => {
      console.error("Error retrieving media metadata:", request.error);
      reject(request.error);
    };
  });
}

// Delete media from IndexedDB
export async function deleteMedia(mediaId: string): Promise<boolean> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([MEDIA_STORE], "readwrite");
    const objectStore = transaction.objectStore(MEDIA_STORE);
    const request = objectStore.delete(mediaId);

    request.onsuccess = () => {
      console.log(`✅ Media deleted from IndexedDB: ${mediaId}`);
      resolve(true);
    };

    request.onerror = () => {
      console.error("Error deleting media:", request.error);
      reject(request.error);
    };
  });
}

// Get storage quota and usage
export async function getStorageInfo(): Promise<{
  usage: number;
  quota: number;
  percentUsed: number;
}> {
  try {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
      percentUsed:
        estimate.usage && estimate.quota
          ? Math.round((estimate.usage / estimate.quota) * 100)
          : 0,
    };
  } catch (error) {
    console.warn("Could not get storage estimate:", error);
    return { usage: 0, quota: 0, percentUsed: 0 };
  }
}

// Clear all media from IndexedDB
export async function clearAllMedia(): Promise<boolean> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([MEDIA_STORE], "readwrite");
    const objectStore = transaction.objectStore(MEDIA_STORE);
    const request = objectStore.clear();

    request.onsuccess = () => {
      console.log("✅ All media cleared from IndexedDB");
      resolve(true);
    };

    request.onerror = () => {
      console.error("Error clearing media:", request.error);
      reject(request.error);
    };
  });
}
