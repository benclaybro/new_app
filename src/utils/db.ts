// IndexedDB wrapper for offline storage
const DB_NAME = 'SolarDirect';
const DB_VERSION = 4;

interface DBSchema {
  leads: {
    key: string;
    value: any;
  };
  users: {
    key: string;
    value: any;
  };
  calendarAuth: {
    key: string;
    value: {
      token: string;
      expiry: number;
    };
  };
  addressCache: {
    key: string;
    value: any;
  };
  pendingChanges: {
    key: string;
    value: {
      type: 'create' | 'update' | 'delete';
      data: any;
      timestamp: number;
    };
  };
}

export async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create new stores
      try {
        if (!db.objectStoreNames.contains('leads')) {
          db.createObjectStore('leads', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('addressCache')) {
          db.createObjectStore('addressCache', { keyPath: 'address' });
        }
        if (!db.objectStoreNames.contains('pendingChanges')) {
          db.createObjectStore('pendingChanges', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('calendarAuth')) {
          db.createObjectStore('calendarAuth');
        }
        if (!db.objectStoreNames.contains('calendarCache')) {
          db.createObjectStore('calendarCache', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('slotsCache')) {
          db.createObjectStore('slotsCache', { keyPath: 'date' });
        }
      } catch (error) {
        console.error('Error creating object stores:', error);
      }
    };
  });
}

export async function getFromStore<T>(storeName: keyof DBSchema, key: string): Promise<T | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function putInStore(storeName: keyof DBSchema, value: any): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(value);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function deleteFromStore(storeName: keyof DBSchema, key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    } catch (error) {
      console.error(`Error deleting from store ${storeName}:`, error);
      reject(error);
    }
  });
}

export async function getAllFromStore<T>(storeName: keyof DBSchema): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}