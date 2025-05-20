import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { RequestService } from '../../services/request.service';
import { User } from '../../models/response.interface';
import { Router } from '@angular/router';
@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  constructor(public service: RequestService, private router: Router) { }

  public apiUrlUser: string = 'http://127.0.0.1:8000/api/user';

  reactiveForm = new FormGroup({
    userName: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
    company: new FormControl(''),

  });

  public onSubmit(): void {
    this.createUser();
  }
  
  public createUser(): void {
    const newUser: User = {
      username: this.reactiveForm.value.userName ?? '',
      email: this.reactiveForm.value.email ?? '',
      password: this.reactiveForm.value.password ?? '',
      company: this.reactiveForm.value.company ?? '',
      role: "ROL_CLIENTE",
      isFirstVisit : true
    };
    
    this.service.createUser(this.apiUrlUser, newUser).subscribe(
      (response) => console.log('Cita creada con éxito:', response),
      (error) => console.error('Error al crear cita:', error)
    );
  
    this.router.navigate(["/login"]);
  }
    
}
