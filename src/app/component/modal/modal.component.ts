import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RequestService } from '../../services/request.service';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/response.interface';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


@Component({
  selector: 'app-modal',
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], 
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
    
  constructor(public service: RequestService, private http: HttpClient) { }

  public userUrl: string = "http://localhost:8000/api/user";

  public allDataUser: User[] = [];
  public loginDataUser: User[] = [];

  public companyName: string = "";
  public username: string = "";
  public email: string = "";
  
  @Input() isOpen: boolean = true;
  @Input() modalAction: string = "";
  @Output() closeModal = new EventEmitter<void>();
  @Output() confirmAction = new EventEmitter<void>();

  close() {
    this.closeModal.emit();
  }

  confirm() {
    this.confirmAction.emit();
  }

  ngOnInit() {
    this.getUsers();
    console.log('Accion del modal: ', this.modalAction);
  }

  public getUsers(): void {
    let userIdString = localStorage.getItem('userId');

    if (!userIdString) {
      console.error('Error: No se encontró userId en localStorage');
      return;
    }

    let userId = parseInt(userIdString, 10);

    this.service.getUsers(this.userUrl).subscribe({
      next: (response) => {
        this.allDataUser = response;
        this.allDataUser.forEach((element, index)=> {
          if (this.allDataUser[index].id === userId) {
            this.loginDataUser.push(this.allDataUser[index]);
          }
        });
        console.log('Usuario Registrado', this.loginDataUser);
        this.insertDataUser();
      },
      error: (error) => {
        console.error('Error al sacar los datos del usuario:', error);
      }
    });
  }

  public insertDataUser(): void {
    this.loginDataUser.forEach((element, index)=> {
      this.companyName =  this.loginDataUser[index].company ?? '';
      this.username = this.loginDataUser[index].username  ?? '';
      this.email =  this.loginDataUser[index].email  ?? '';
    })
  }
}
