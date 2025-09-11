export abstract class StorageService {
  abstract clear(): void;

  abstract getItem(key: string): string | null;

  abstract setItem(key: string, value: string): void;

  abstract removeItem(key: string): void;
}
