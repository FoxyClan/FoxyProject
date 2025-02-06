import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  private cacheVersionSubject = new BehaviorSubject<string>(Date.now().toString());
  cacheVersion$ = this.cacheVersionSubject.asObservable();

  constructor() {}

  getCacheVersion(): string {
    return this.cacheVersionSubject.value;
  }

  updateCacheVersion() {
    const newVersion = Date.now().toString();
    this.cacheVersionSubject.next(newVersion);
  }
}
