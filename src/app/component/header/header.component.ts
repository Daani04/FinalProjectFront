import { Component} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgStyle } from '@angular/common';
import { RequestService } from '../../services/request.service';
import { ProductAllData } from '../../models/response.interface';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, NgStyle],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  constructor(public service: RequestService) { }

  public apiProductsUrl: string = "http://localhost:8000/api/data";

  public notificationsList: { message: string, photo: string }[] = [];
  public ignoreNotifications: string[] = JSON.parse(localStorage.getItem('ignoreNotifications') || '[]');
  
  public hiddenNotification: boolean = false;

    public products: ProductAllData[] = [];

  /*Comentado para no gastar saldo de la API*/
  ngOnInit() {
    //this.getProducts();
  }

  public changeVisivility(): void {
    if (this.hiddenNotification === false) {
      this.hiddenNotification = true;
    } else {
      this.hiddenNotification = false;
    }
  }

  public changePhoto(index: number):void {
    this.notificationsList[index].photo = "pape2";
  }

  public resetPhoto(index: number): void {
    this.notificationsList[index].photo = "pape1";
  }
  public deleteNotification(index: number): void {
    if (index >= 0 && index < this.notificationsList.length) {
      console.log(this.notificationsList[index].message);
      this.ignoreNotifications.push(this.notificationsList[index].message);
      localStorage.setItem('ignoreNotifications', JSON.stringify(this.ignoreNotifications));
      this.notificationsList.splice(index, 1);
    }
  }

    //Llamada API deepseek
    generateNotification() {
      let prompt = this.createPromptFromProducts();
      let ignoreNotificationsString = this.ignoreNotifications.join(', ');
      console.log(this.ignoreNotifications);
      this.service.generateNotification(prompt, ignoreNotificationsString).subscribe(
        (res) => {
          let notificationContent = res.choices[0].message.content;
          let notifications = notificationContent.split('!');
          notifications.forEach((message: string) => {
            if (message.trim()) {  
              this.notificationsList.push({
                message: message.trim(),
                photo: "pape1" 
              });
            }
          });
        },
        (error) => {
          console.error('Error al generar notificación:', error);
        }
      );
    }

    
    public createPromptFromProducts(): string {
      let promptbbdd = '';
      this.products.forEach(product => {
        promptbbdd += `
          Producto: ${product.name} (${product.brand})
          Precio Venta: ${product.price}
          Precio Compra: ${product.purchase_price}
          Stock: ${product.stock}
          Tipo: ${product.product_type}
          Fecha de Entrada: ${product.entry_date}
          Fecha de caducidad: ${product.expiration_date} 
          Codigo de barras: ${product.barcode}          
          -----------------------------------
        `;
      });
      return promptbbdd;
    }

    public getProducts(): void {
      this.service.takeProducts(this.apiProductsUrl).subscribe({
        next: (response) => {
          this.products = response as ProductAllData[];
          this.generateNotification();  // <-- Aquí garantizas que ya tienes datos
          setInterval(() => {
            this.notificationsList = [];
            this.generateNotification();
          }, 300000);
        },
        error: (error) => {
          console.error('Error al seleccionar el producto:', error);
        }
      });
    }
}
