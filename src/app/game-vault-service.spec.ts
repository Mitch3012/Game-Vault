import { TestBed } from '@angular/core/testing';
import { GameVaultService } from './game-vault-service';

describe('GameVaultService', () => {
  let service: GameVaultService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameVaultService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
