import { TestBed } from '@angular/core/testing';

import { SongsRepositoryService } from './songs-repository.service';

describe('SongsRepositoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SongsRepositoryService = TestBed.get(SongsRepositoryService);
    expect(service).toBeTruthy();
  });
});
