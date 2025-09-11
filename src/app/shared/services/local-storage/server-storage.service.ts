import { StorageService } from './storage.service';
import { Injectable } from '@angular/core';

@Injectable()
export class ServerStorageService extends StorageService {
  clear(): void {
    // No-op
  }

  getItem(key: string): string | null {
    return null;
  }

  removeItem(key: string): void {
    // No-op
  }

  setItem(key: string, value: string): void {
    // No-op
  }
}
