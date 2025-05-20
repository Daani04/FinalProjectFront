import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { RequestService } from '../../services/request.service';  
import { Router } from '@angular/router';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, NgStyle],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  constructor(public service: RequestService, private router: Router) { }

  public apiUrlUser: string = 'http://127.0.0.1:8000/api/user/login'; 

  public errorMessaje: string = "Usuario o contraseña incorrectos";
  public cont: number = 0;

  public loading: boolean = false;
  public changueScreen: boolean = false;

  reactiveForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
  });

  public onSubmit(): void {
    this.loginUser();
  }

  public loginUser(): void {
    this.loading = true;
    this.changueScreen = true;

    let email = this.reactiveForm.value.email ?? '';
    let password = this.reactiveForm.value.password ?? '';

    this.service.loginUser(this.apiUrlUser, email, password).subscribe(
      (response) => {
        if (response && response.user) {
          this.loading = false;
          this.changueScreen = false;

          let user = response.user;
          this.cont = 0;
          console.log('Login exitoso:', user);

          localStorage.setItem('userId', user.id?.toString() ?? '');
          localStorage.setItem('username', user.username ?? '');
          localStorage.setItem('company', user.company ?? '');
          localStorage.setItem('email', user.email ?? '');
          localStorage.setItem('role', user.role ?? '');
          localStorage.setItem('userVisit', user.isFirstVisit ?? '');

          localStorage.setItem('user', user.email);

          this.router.navigate(['/home']).then(() => {
            console.log('Redirección exitosa a /home');
          }).catch(err => {
            console.error('Error en la redirección:', err);
            this.loading = false;
            this.changueScreen = false;
          });
        } else {
          console.error('Error: La respuesta del servidor no contiene los datos esperados');
          this.loading = false;
          this.changueScreen = false;
        }
      },
      (error) => {
        this.cont = 1;
        this.loading = false;
        this.changueScreen = false;
        console.error('Error al hacer login:', error);
      }
    );
}

}
