import { Component } from '@angular/core';
import { FooterComponent } from "../../component/footer/footer.component";
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RequestService } from '../../services/request.service';
import { Warehouse } from '../../models/response.interface';
import { ProductAllData } from '../../models/response.interface';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/response.interface';
import { RouterLink } from '@angular/router';
import { NgStyle } from '@angular/common';
import introJs from 'intro.js';
import 'intro.js/introjs.css'; 


@Component({
  selector: 'app-warehouse',
  imports: [FooterComponent, ReactiveFormsModule, RouterLink, NgStyle],
  templateUrl: './warehouse.component.html',
  styleUrl: './warehouse.component.css'
})
export class WarehouseComponent {

  constructor(public service: RequestService, private http: HttpClient) { }
  
  public apiWarehouseUrl: string = "http://127.0.0.1:8000/api/warehouse";
  public apiProductsUrl: string = "http://localhost:8000/api/data";

  public warehouses: Warehouse[] = [];
  public products: ProductAllData[] = [];

  public netProfitPerWarehouse: number[] = []; 
  public totalInventoryValue: number[] = [];    
  public numOfArticles:string[] = [];
  public idUserWarehouses: number[] = [];

  public formWarehouse: boolean = false;
  public userLocation: string = '';

  public loading: boolean = false;
  public changueScreen: boolean = false;

  public controlForm(): void {
    if (this.formWarehouse === false) {
      this.formWarehouse = true;
    } else {
      this.formWarehouse = false;
    }
  }

  reactiveForm = new FormGroup({
    openForm: new FormControl(''),
    warehouseName: new FormControl(''),
    locationWarehouseCity: new FormControl(''),
    locationWarehouseStreet: new FormControl(''),
    locationWarehouseCommunity: new FormControl('')
  });

  ngOnInit(): void {
    let isIntroStart = localStorage.getItem('warehouse');
    this.checkWarehouses();

    if (isIntroStart === 'true') {
      this.startTour();
    }
  }

  public startTour(): void {
    localStorage.setItem('warehouse', 'false');
    introJs().setOptions({
      nextLabel: 'Siguiente',
      prevLabel: 'Anterior',
      doneLabel: 'Entendido',
      showProgress: true,
      showBullets: false,
      steps: [
        {
          element: '#welcome',
          intro: '🏬 Bienvenido a la sección de <strong>Almacenes</strong>. Desde aquí podrás ver todos tus almacenes, acceder a sus detalles y gestionar los productos que contienen de forma eficiente.',
          position: 'bottom', 
          tooltipClass: 'introjs-welcome-tooltip',
        },
        {
          element: '#Step6AddWarehouse', 
          intro: '➕ ¿Necesitas más espacio? Usa este botón para <strong>añadir nuevos almacenes</strong> y organizar mejor tu inventario.',
          position: 'bottom',
        },
      ],
    }).start();
  }

  public getStreetForm(): void {
    //this.newWarehouse();
    this.getLocationCoordinates(this.reactiveForm.value.locationWarehouseCity, this.reactiveForm.value.locationWarehouseStreet, this.reactiveForm.value.locationWarehouseCommunity);
    console.log(this.reactiveForm.value);
  }

  getLocationCoordinates(city: any, street: any, comunity: any ) {
    this.service.getLocationCoordinates(city, street, comunity).subscribe(
      (res) => {
        let coordinates = res.choices[0].message.content;
        //let notifications = notificationContent.split('!');
        console.log(coordinates);
        this.newWarehouse(coordinates);
        
      },
      (error) => {
        console.error('Error al generar notificación:', error);
      }
    );
  }

  public alertNoData(): void {
    alert("No tienes productos en este almacen");
  }

  public newWarehouse(coordinates: any): void {
    let userIdString = localStorage.getItem('userId'); // Obtiene el userId como string
    let coordinatesString = String(coordinates); 

    if (!userIdString) {
        console.error('Error: No se encontró userId en localStorage');
        return;
    }

    const userId = parseInt(userIdString, 10); // Convierte userId a número

    if (isNaN(userId)) {
        console.error('Error: userId en localStorage no es un número válido');
        return;
    }
    console.log('Id del usuario', userId);
    console.log('Nombre del almacen', this.reactiveForm.value.warehouseName);
    console.log('Coordenadas del almacen', coordinatesString);

    const warehouseData: Warehouse = {
      id: null,  
      user_id: userId,  
      name: this.reactiveForm.value.warehouseName ?? '',  
      location: coordinatesString ?? '',  
    };

    console.log('Datos enviados al servidor:', warehouseData);

    this.service.createWarehouse(this.apiWarehouseUrl, warehouseData).subscribe(
        (response) => console.log('Almacén creado con éxito:', response),
        (error) => console.error('Error al crear almacén:', error)
    );
  }

  public checkWarehouses(): void {
    let userIdString = localStorage.getItem('userId');
  
    if (!userIdString) {
      console.error('Error: No se encontró userId en localStorage');
      return;
    }
  
    let userId = parseInt(userIdString, 10);
  
    let apiUrl = `${this.apiWarehouseUrl}/user/${userId}`;
  
    this.service.takeWarehouse(apiUrl).subscribe({
      next: (response) => {
        this.warehouses = response;
        for (let i = 0; i < this.warehouses.length; i++) {
          this.idUserWarehouses.push(this.warehouses[i].id?? 0);
        }
            this.checkProducts();
      },
      error: (error) => {
        console.error('Error fetching warehouses:', error);
      }
    });
  }

  public checkProducts(): void {
    this.loading = true;
    this.changueScreen = true;
    let userIdString = localStorage.getItem('userId');
    
    if (!userIdString) {
      console.error('Error: No se encontró userId en localStorage');
      return;
    }
    
    let userId = parseInt(userIdString, 10);
    
    let apiUrl = `${this.apiProductsUrl}/user/${userId}`;
    
    this.service.takeProducts(apiUrl).subscribe({
      next: (response) => {
        this.loading = false;
        this.changueScreen = false;
        this.products = response;
  
        this.numOfArticles = [];
        this.netProfitPerWarehouse = [];
        this.totalInventoryValue = [];
  
        for (let i = 0; i < this.idUserWarehouses.length; i++) { 
          let warehouseId = this.idUserWarehouses[i];
          let count = 0;
          let totalProfit = 0;
          let totalValue = 0;
  
          for (let j = 0; j < this.products.length; j++) {
            let product = this.products[j];
            if (product.warehouse === warehouseId) {
              count++;
              totalProfit += (product.price - product.purchase_price);
              totalValue += product.price;
            }
          } 
          
          this.numOfArticles[i] = count.toString();
          this.netProfitPerWarehouse[i] = Math.round(totalProfit * 100) / 100;
          this.totalInventoryValue[i] = Math.round(totalValue); 
          }
      },
      error: (error) => {
        this.loading = false;
        this.changueScreen = false;
        console.error('Error al sacar los productos:', error);
      }
    });
  }
  
}
