import { StorageService } from './storage.service';
import { Injectable } from '@angular/core';

@Injectable()
export class BrowserStorageService extends StorageService {
  getItem(key: any): string | null {
    return localStorage.getItem(key);
  }

  removeItem(key: any): void {
    localStorage.removeItem(key);
  }

  setItem(key: any, value: string): void {
    localStorage.setItem(key, value);
  }

  clear(): void {
    localStorage.clear();
  }
}
