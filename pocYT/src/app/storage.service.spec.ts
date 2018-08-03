import { TestBed, inject } from '@angular/core/testing';

import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorageService]
    });

    service = TestBed.get(StorageService);
  });

  describe('setAuthToken:', () => {
    it('asks sessionStorage to store given string', () => {
      spyOn(sessionStorage, 'setItem');
      service.setAuthToken('stub');
      expect(sessionStorage.setItem).toHaveBeenCalledWith(jasmine.any(String), 'stub');
    });
  });

  describe('getAuthToken:', () => {
    it('returns stored token if it exists', () => {
      spyOn(sessionStorage, 'getItem').and.returnValue('stub');
      let token = service.getAuthToken();
      expect(token).toEqual('stub');
      expect(sessionStorage.getItem).toHaveBeenCalled();
    });

    it('throws error if token does not exist', () => {
      expect(service.getAuthToken).toThrowError();
    });
  });

  describe('deleteAuthToken:', () => {
    it('asks sessionStorage to remove token', () => {
      spyOn(sessionStorage, 'removeItem');
      service.deleteAuthToken();
      expect(sessionStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe('setChannelTitle:', () => {
    it('asks sessionStorage to store given string', () => {
      spyOn(sessionStorage, 'setItem');
      service.setChannelTitle('stub');
      expect(sessionStorage.setItem).toHaveBeenCalledWith(jasmine.any(String), 'stub');
    });
  });

  describe('getChannelTitle:', () => {
    it('returns stored title', () => {
      let spy = spyOn(sessionStorage, 'getItem').and.returnValue('stub');
      expect(service.getChannelTitle()).toEqual('stub');
      expect(spy).toHaveBeenCalled();
      spy.and.returnValue(null);
      expect(service.getChannelTitle()).toEqual(null);
    });
  });

  describe('deleteChannelTitle:', () => {
    it('asks sessionStorage to remove title', () => {
      spyOn(sessionStorage, 'removeItem');
      service.deleteChannelTitle();
      expect(sessionStorage.removeItem).toHaveBeenCalled();
    });
  });
});
