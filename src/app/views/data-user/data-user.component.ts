  import { Component } from '@angular/core';
  import { FooterComponent } from "../../component/footer/footer.component";
  import { ModalComponent } from "../../component/modal/modal.component";
  import { RequestService } from '../../services/request.service';
  import { HttpClient } from '@angular/common/http';
  import { Router } from '@angular/router';  

  @Component({
    selector: 'app-data-user',
    imports: [FooterComponent, ModalComponent],
    templateUrl: './data-user.component.html',
    styleUrl: './data-user.component.css'
  })
  export class DataUserComponent {

    constructor(private router: Router, public service: RequestService, private http: HttpClient) { }
    
    public userUrl: string = "http://localhost:8000/api/user";
    
    isModalOpen = false;
    accountDeleted: boolean = false;
    modalAction: string = "";

    public selectAction(action: string): void {
      this.modalAction = action;
      this.isModalOpen = true;
    }

    public openModal(): void {
      this.isModalOpen = true;
    }

    public closeModal(): void {
      this.isModalOpen = false;
    }

    public closeSesion(): void{
      localStorage.clear();
      window.location.reload();
    }

    //HACER FUNCIONAL, DE MOMENTO SOLO VERIFICA SI SE HA CLICKADO EL BOTON
    confirmDelete() {
      this.accountDeleted = true;
      console.log('¿Se eliminó la cuenta?:', this.accountDeleted); // Aquí tienes el TRUE
      this.closeModal();
      this.deleteUser();
    }

    public deleteUser(): void {
      let userIdString = localStorage.getItem('userId');

      if (!userIdString) {
        console.error('Error: No se encontró userId en localStorage');
        return;
      }

      let userId = parseInt(userIdString, 10);

      let userUrlWithId = `${this.userUrl}/${userId}`;

      this.service.deleteUser(userUrlWithId).subscribe({
        next: (response) => {
          console.log('Usuario eliminado correctamente', response);
           this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Error al sacar los datos del usuario:', error);
        }
      });
    }

  }
