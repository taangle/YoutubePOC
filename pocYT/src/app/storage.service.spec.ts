import { TestBed, inject } from '@angular/core/testing';

import { StorageService } from './storage.service';

fdescribe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorageService]
    });

  service = TestBed.get(StorageService);
  });

  describe('setAuthToken', () => {
    
  });

  describe('getAuthToken', () => {

  });

  describe('deleteAuthToken', () => {
    
  });

  describe('setChannelTitle', () => {

  });

  describe('getChannelTitle', () => {

  });

  describe('deleteChannelTitle', () => {

  });
});
