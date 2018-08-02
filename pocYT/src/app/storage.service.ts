import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private static readonly AUTH_TOKEN_KEY: string = 'authToken';
  private static readonly CHANNEL_TITLE_KEY: string = 'channelTitle';

  constructor() { }

  setAuthToken(token: string): void {
    console.log('storage: SETTING auth token');
    sessionStorage.setItem(StorageService.AUTH_TOKEN_KEY, token);
  }

  getAuthToken(): string {
    console.log('storage: GETTING auth token');
    let token: string = sessionStorage.getItem(StorageService.AUTH_TOKEN_KEY);
    if (!token) {
      throw new Error("No token set; authentication required."); //throws error for signed-out user
    }
    return token;
  }

  deleteAuthToken(): void {
    sessionStorage.removeItem(StorageService.AUTH_TOKEN_KEY);
  }

  setChannelTitle(title: string) {
    sessionStorage.setItem(StorageService.CHANNEL_TITLE_KEY, title);
  }

  getChannelTitle() {
    return sessionStorage.getItem(StorageService.CHANNEL_TITLE_KEY);
  }

  deleteChannelTitle() {
    sessionStorage.removeItem(StorageService.CHANNEL_TITLE_KEY);
  }
}
