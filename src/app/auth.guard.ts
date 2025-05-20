import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  //CanActive es un metodo que se usa para definir a que rutas podemos acceder 
  //route y state proporcionan informacion de las rutas 
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    
    const user = localStorage.getItem('user');  

    if (user) {
      return true;
    } else {
      this.router.navigate(['/login']);  // Redirige al login
      return false;
    }
  }
}
