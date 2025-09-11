/* eslint-disable */
import { NgHttpCachingEntry, NgHttpCachingStorageInterface } from 'ng-http-caching';

import { HttpHeaders, HttpParams, HttpRequest, HttpResponse } from '@angular/common/http';

const KEY_PREFIX = 'NgHttpCaching::';
const STORAGE_KEY = 'NgHttpCaching';

export const serializeRequest = (req: HttpRequest<any>): string => {
  const request = req.clone(); // Make a clone, useful for doing destructive things
  return JSON.stringify({
    headers: Object.fromEntries(
      // Just a helper to make this into an object, not really required but makes the output nicer
      request.headers.keys().map(
        // Get all of the headers
        (key: string) => [key, request.headers.getAll(key)], // Get all of the corresponding values for the headers
      ),
    ),
    method: request.method, // The Request Method, e.g. GET, POST, DELETE
    url: request.url, // The URL
    params: Object.fromEntries(
      // Just a helper to make this into an object, not really required but makes the output nicer
      request.headers.keys().map(
        // Get all of the headers
        (key: string) => [key, request.headers.getAll(key)], // Get all of the corresponding values for the headers
      ),
    ), // The request parameters
    withCredentials: request.withCredentials, // Whether credentials are being sent
    responseType: request.responseType, // The response type
    body: request.serializeBody(), // Serialize the body, all well and good since we are working on a clone
  });
};

export const serializeResponse = (res: HttpResponse<any>): string => {
  const response = res.clone();
  return JSON.stringify({
    headers: Object.fromEntries(
      // Just a helper to make this into an object, not really required but makes the output nicer
      response.headers.keys().map(
        // Get all of the headers
        (key: string) => [key, response.headers.getAll(key)], // Get all of the corresponding values for the headers
      ),
    ),
    status: response.status,
    statusText: response.statusText,
    url: response.url,
    body: response.body, // Serialize the body, all well and good since we are working on a clone
  });
};

export const deserializeRequest = <T = any>(req: string): HttpRequest<T> => {
  const request = JSON.parse(req);
  const headers = new HttpHeaders(request.headers);
  const params = new HttpParams(); // Probably some way to make this a one-liner, but alas, there are no good docs
  for (const parameter in request.params) {
    request.params[parameter].forEach((paramValue: string) => params.append(parameter, paramValue));
  }
  return new HttpRequest(request.method, request.url, request.body, {
    headers,
    params,
    responseType: request.responseType,
    withCredentials: request.withCredentials,
  });
};

export const deserializeResponse = <T = any>(res: string): HttpResponse<T> => {
  const response = JSON.parse(res);
  return new HttpResponse<T>({
    url: response.url,
    headers: new HttpHeaders(response.headers),
    body: response.body,
    status: response.status,
    statusText: response.statusText,
  });
};

interface StorageEntry {
  url: string;
  response: string;
  request: string;
  addedTime: number;
  version: string;
}

export class HttpCacheStorageService implements NgHttpCachingStorageInterface {
  private storage: Storage = localStorage;
  get size(): number {
    const cacheData = this.getCacheData();
    return Object.keys(cacheData).length;
  }

  clear(): void {
    this.storage.removeItem(STORAGE_KEY);
  }

  delete(key: string): boolean {
    if (!key) {
      return false;
    }
    const exists = this.has(key);
    if (exists) {
      const cacheData = this.getCacheData();
      delete cacheData[key];
      this.saveCacheData(cacheData);
    }
    return exists;
  }

  forEach(callbackfn: (value: NgHttpCachingEntry, key: string) => void): void {
    const cacheData = this.getCacheData();
    // iterate this.storage
    Object.entries(cacheData).forEach(([key, value]) => {
      if (value) {
        callbackfn(this.get(key), key);
      }
    });
  }

  get(key: string): Readonly<NgHttpCachingEntry> {
    // if (!key) {
    //   return undefined
    // }
    const cacheData = this.getCacheData();
    const parsedItem = cacheData[key];
    // if (parsedItem && Object.keys(parsedItem).length !== 0) {
    return {
      url: parsedItem.url,
      response: deserializeResponse(parsedItem.response),
      request: deserializeRequest(parsedItem.request),
      addedTime: parsedItem.addedTime,
      version: parsedItem.version,
    };
    // }
    // return undefined
  }

  has(key: string): boolean {
    if (!key) {
      return false;
    }
    const cacheData = this.getCacheData();
    return Object.prototype.hasOwnProperty.call(cacheData, key);
  }

  set(key: string, value: NgHttpCachingEntry): void {
    if (!key) {
      return;
    }
    if (!key.startsWith(KEY_PREFIX)) {
      key = KEY_PREFIX + key;
    }
    const unParsedItem: StorageEntry = {
      url: value.url,
      response: serializeResponse(value.response),
      request: serializeRequest(value.request),
      addedTime: value.addedTime,
      version: value.version,
    };
    const cacheData = this.getCacheData();
    cacheData[key] = unParsedItem;
    this.saveCacheData(cacheData);
  }

  private getCacheData(): Record<string, StorageEntry> {
    const cachedDataString = this.storage.getItem(STORAGE_KEY);
    return cachedDataString ? JSON.parse(cachedDataString) : {};
  }

  private saveCacheData(cacheData: Record<string, StorageEntry>): void {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
  }
}

/*

@Injectable({
  providedIn: 'root'
})
export class NgHttpCacheStorageService implements NgHttpCachingStorageInterface {
  private storageKey = 'ngHttpCacheStorage'
  constructor(private localStorageService : LocalStorageService) {

  }

  get size(): number {
    const cacheData = this.getCacheData()
    return Object.keys(cacheData).length
  }

  clear(): void {
    this.localStorageService.removeItem(this.storageKey)
  }

  delete(key: string): boolean {
    const cacheData = this.getCacheData()
    const exists = this.has(key)
    if (exists) {
      delete cacheData[key]
      this.saveCacheData(cacheData)
    }
    return exists
  }

  forEach<K, T>(callbackfn: (value: NgHttpCachingEntry<K, T>, key: string) => void): void {
    const cacheData = this.getCacheData()
    Object.entries(cacheData).forEach(([key, value]) => {
      callbackfn(value, key)
    })
  }

  get<K, T>(key: string): Readonly<NgHttpCachingEntry<K, T>> | undefined {
    const cacheData = this.getCacheData()
    return cacheData[key]
  }

  has(key: string): boolean {
    const cacheData = this.getCacheData()
    return cacheData.hasOwnProperty(key)
  }

  set<K, T>(key: string, value: NgHttpCachingEntry<K, T>): void {
    const cacheData = this.getCacheData()
    cacheData[key] = value
    this.saveCacheData(cacheData)
  }

  private getCacheData(): Record<string, NgHttpCachingEntry> {
    const cachedDataString = this.localStorageService.getItem(this.storageKey)
    return cachedDataString ? JSON.parse(cachedDataString) : {}
  }

  private saveCacheData(cacheData: Record<string, NgHttpCachingEntry>): void {
    this.localStorageService.setItem(this.storageKey, JSON.stringify(cacheData))
  }

}
*/
