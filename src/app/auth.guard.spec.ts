import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthGuard, Router]  // Asegúrate de inyectar las dependencias necesarias
    });
    guard = TestBed.inject(AuthGuard);  // Crea una instancia de AuthGuard
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
