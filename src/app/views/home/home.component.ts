import { Component, Host } from '@angular/core';
import { ChartComponent } from '../../component/chart/chart.component';
import { FooterComponent } from "../../component/footer/footer.component";
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { RequestService } from '../../services/request.service';
import { ProductAllData, ProductSold, Warehouse, User } from '../../models/response.interface';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ModalScannerComponent } from "../../component/modal-scanner/modal-scanner.component";
import { NgStyle } from '@angular/common';
import { ViewChild } from '@angular/core';
import { ModalComponent } from "../../component/modal/modal.component";
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import introJs from 'intro.js';
import 'intro.js/introjs.css'; 


@Component({
  selector: 'app-home',
  imports: [ChartComponent, FooterComponent, ReactiveFormsModule, RouterModule, ModalScannerComponent, NgStyle, ModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  constructor(public service: RequestService, private http: HttpClient) { }

  @ViewChild('chartComponentLineEntrateProducts') chartComponentLineEntrateProducts!: ChartComponent;
  @ViewChild('chartComponentLineExitProducts') chartComponentLineExitProducts!: ChartComponent;

  public apiWarehouseUrl: string = "http://127.0.0.1:8000/api/warehouse";
  public apiProductsUrl: string = "http://localhost:8000/api/data";
  private apiLocationUrl = 'https://nominatim.openstreetmap.org/reverse?format=json';
  public apiSalesUrl: string = "http://localhost:8000/api/sales";
  public apiUser: string = 'http://127.0.0.1:8000/api/user';

  public userName = localStorage.getItem('username');

  public warehouses: Warehouse[] = [];
  public products: ProductAllData[] = [];
  public selectedWarehouseId: number = 0;

  public productsSold: ProductSold[] = [];
  public productsSoldQuantity: number[] = [];

  public cont: number = 0;
  public cont2: number = 0;

  public loading: boolean = false;
  public changueScreen: boolean = false;

  public selectedWarehouse: boolean = false;

  public showForm: boolean = false;

  public showWithdrawForm: boolean = false;
  public selectWarehouse: boolean = false;
  public userWarehousesNames: string[] = [];
  public selectUserWarehouse: number = 0;
  public productUserNames: any[] = [];

  public productSoldId: number = 0;
  public productSoldQuantity: number = 0;

  public contInsertionData: number = 0;

  public userLocation: string = '';

  public openModalScanner: boolean = false;

  public filtratedProductsforWarehouseId: any[] = [];
  public productsUser: any[] = [];

  public page: number = 0;
  public itemsPerPage: number = 4;
  public totalPages: number = 0;
  public actualPage: number = 1;

  public randomWarehouseName: string = '';

  public saleProductsForMonth: number[] = [];
  public entrateProductsForMonth: number[] = [];

  public isModalOpen: boolean = false;
  public modalAction: string = "insertData";

  public scannerAction: string = "addProductToStock";

  public deleteImg: string[] = [];

  public isFirstVisit: boolean = false;
  public showWelcomeScreen: boolean = false;
    
  public insertionMethod(): void {
    this.contInsertionData = 1;
  }

  public closeModalVerifyDataInsertion(): void {
    this.isModalOpen = false;
    window.location.reload();
  }

    ngOnInit(): void {
    this.checkWarehouses();
    this.verifyUserVisits();
  }
  
  productForm = new FormGroup({
    name: new FormControl(''),
    brand: new FormControl(''),
    price: new FormControl(''),
    stock: new FormControl(''),
    barcode: new FormControl(''),
    productType: new FormControl(''),
    expirationDate: new FormControl(''),
    entryDate: new FormControl(''),
    purchasePrice: new FormControl('')
  });

  onSubmit(): void {
    console.log('Formulario enviado', this.productForm.value);
  }


  getStreet(lat: number, lon: number): Observable<string> {
    const url = `${this.apiLocationUrl}&lat=${lat}&lon=${lon}`;
    return this.http.get<any>(url).pipe(
      map(response =>
        response.address?.village ||
        response.address?.town ||
        response.address?.city ||
        'Localidad no encontrada'
      )
    );
  }

  reactiveForm = new FormGroup({
    openForm: new FormControl(''),
    warehouseName: new FormControl(''),
    locationWarehouseCity: new FormControl(''),
    locationWarehouseStreet: new FormControl(''),
    locationWarehouseCommunity: new FormControl('')
  });

  selectWarehouseForInsertProducts = new FormGroup({
    selectWarehouse: new FormControl('')
  });

  withdrawFormSelectWarehouse = new FormGroup({
    warehouseName: new FormControl(''),
  });

  withdrawFormSelectProduct = new FormGroup({
    productName: new FormControl(''),
    productQuantity: new FormControl('')
  });
  
  public loadWarehouseSelection(): void {
    this.userWarehousesNames = this.warehouses.map(warehouse => warehouse.name);
    this.showWithdrawForm = true;
  }

  public handleWarehouseSelection(): void {
    this.selectWarehouse = true;
    this.showWithdrawForm = false;

    const selectedWarehouse = this.warehouses.find(
      warehouse => warehouse.name === this.withdrawFormSelectWarehouse.value.warehouseName
    );
    
    this.selectUserWarehouse = selectedWarehouse?.id ?? 0;
    this.loadWarehouseProducts();

    //console.log('Almacén seleccionado:', this.selectUserWarehouse);
  }

  public loadWarehouseProducts(): void {
    this.productUserNames = this.productsUser
      .filter(product => product.warehouse == this.selectUserWarehouse)
      .map(product => ({
        id: product.id,
        name: product.name
      }));

    //console.log('Productos disponibles:', this.productUserNames);
  }

  public initializeDeleteImages(): void {
    this.deleteImg = this.warehouses.map(() => "/img/pape1.png");
  }

  public changeDeleteImg(index: number): void {
    this.deleteImg[index] = "/img/pape2.png";
  }

  public returnInitialImg(index: number): void {
    this.deleteImg[index] = "/img/pape1.png";
  }

  public deleteWarehouse(name: string): void {
    this.loading = true;
    this.changueScreen = true;

    let idWarehouseForDelete = 0;

    this.warehouses.forEach((data, index) => {
      if (data.name === name) {
        idWarehouseForDelete = data.id ?? 0;
      }
    });

    let deleteWarehouse = `${this.apiWarehouseUrl}/${idWarehouseForDelete}`;

    this.service.deleteWarehouse(deleteWarehouse).subscribe(
      (response) => {
        this.loading = false;
        this.changueScreen = false;

        this.isModalOpen = true;
        this.modalAction = "deleteWarehouse";

        console.log('Almacen eliminado correctamente', response)
      },
      (error) => {
        this.loading = false;
        this.changueScreen = false;
        console.log('Error al eliminar el almacen', error)
      }
    );
  }

  public startTour(): void {
    localStorage.setItem('warehouse', 'true');
    localStorage.setItem('graphics', 'true');
    localStorage.setItem('map', 'true');
    localStorage.setItem('chatIA', 'true');

    introJs().setOptions({
      nextLabel: 'Siguiente',
      prevLabel: 'Anterior',
      doneLabel: 'Entendido',
      showProgress: true,
      showBullets: false,
      steps: [
        {
          element: '#welcome',
          intro: '👋 <strong>¡Bienvenido a StockMaster!</strong> Esta aplicación te ayudará a <strong>gestionar tus productos y almacenes</strong> de manera eficiente. Haz clic en <strong>"Siguiente"</strong> para comenzar el recorrido y descubrir cómo aprovecharla al máximo.',
          position: 'bottom', 
          tooltipClass: 'introjs-welcome-tooltip',
        },
        {
          element: '#Step2Warehouses', 
          intro: '🏢 <strong>Gestión de almacenes:</strong> Aquí puedes <strong>ver y gestionar</strong> todos tus almacenes. ¡Organiza y visualiza fácilmente dónde se encuentra cada producto!',
          position: 'bottom',
        },
        {
          element: '#Step3Products', 
          intro: '📦 <strong>Listado de productos:</strong> En esta sección puedes <strong>ver, añadir y gestionar</strong> todos tus productos de manera ordenada.',
          position: 'bottom',
        },
        {
          element: '#Step4AddProductScanner', 
          intro: '📲 <strong>Añadir con QR:</strong> Utiliza el lector de <strong>código QR</strong> para escanear productos y <strong>añadirlos rápidamente</strong> a tu inventario.',
          position: 'bottom',
        },
        {
          element: '#Step5RemoveProductScanner', 
          intro: '❌ <strong>Retirar productos:</strong> Escanea el código QR de un producto para <strong>eliminarlo fácilmente</strong> del inventario.',
          position: 'bottom',
        },
      ],
    }).start();
  }


  public moveToSold(): void {
    let productId = Number(this.withdrawFormSelectProduct.value.productName);
    let quantity = Number(this.withdrawFormSelectProduct.value.productQuantity);

    if (!productId || !quantity) {
      console.error('Datos incompletos');
      return;
    }

    let selectedProduct = this.productUserNames.find(p => p.id == productId);

    if (selectedProduct) {
      this.productSoldId = selectedProduct.id
      this.productSoldQuantity = quantity;
      this.moveProductsToSold();
    } else {
      console.error('Producto no encontrado');
    }
  }

  public moveProductsToSold(): void {
    this.loading = true;
    this.changueScreen = true;

    const soldProducts: ProductSold = {
      id: null,
      product: this.productSoldId,
      warehouse: this.selectUserWarehouse,
      quantity: this.productSoldQuantity,
      sale_date: new Date().toISOString()
    };

    this.service.moveProductsToSold(this.apiSalesUrl, soldProducts).subscribe(
      (response) => {
        console.log('Producto añadido con exito:', response)
        this.loading = false;
        this.changueScreen = false;
        this.isModalOpen = true;
      },
      (error) => {
        this.loading = false;
        this.changueScreen = false;
        console.error('Error al añadir producto:', error)
      }
    );

  }
  public showOptionForInsertData(): void {
    this.selectedWarehouse = true;
    console.log(this.selectWarehouseForInsertProducts.value.selectWarehouse);

    for (let i = 0; i < this.warehouses.length; i++) {
      if (this.warehouses[i].name === this.selectWarehouseForInsertProducts.value.selectWarehouse) {
        this.selectedWarehouseId = this.warehouses[i].id ?? 0;
        break;
      }
    }
  }

  public uploadProducts(): void {
    this.insertProductsWarehouse();
  }

  public toggleForm(): void {
    this.cont = 1;
  }

  public getStreetForm(): void {
    //this.newWarehouse();
    this.loading = true;
    this.changueScreen = true;
    this.getLocationCoordinates(this.reactiveForm.value.locationWarehouseCity, this.reactiveForm.value.locationWarehouseStreet, this.reactiveForm.value.locationWarehouseCommunity);
    console.log(this.reactiveForm.value);
  }

  public showProducts(): void {
    this.products = this.filtratedProductsforWarehouseId.slice(this.page, this.page + this.itemsPerPage);
  }

  public takePage(): void {
    const takeActualPage = Math.floor(this.page / this.itemsPerPage) + 1;
    const totalPages = Math.ceil(this.filtratedProductsforWarehouseId.length / this.itemsPerPage);

    this.actualPage = takeActualPage;
    this.totalPages = totalPages;
  }

  public nextPage(): void {
    if (this.page + this.itemsPerPage < this.filtratedProductsforWarehouseId.length) {
      this.page += this.itemsPerPage;
      this.showProducts();
    }
    this.takePage();
  }

  public beforePage(): void {
    if (this.page > 0) {
      this.page -= this.itemsPerPage;
      this.showProducts();
      this.takePage();
    }
  }

  getLocationCoordinates(city: any, street: any, comunity: any) {
    this.service.getLocationCoordinates(city, street, comunity).subscribe(
      (res) => {
        let coordinates = res.choices[0].message.content;
        console.log(coordinates);
        this.newWarehouse(coordinates);
      },
      (error) => {
        console.error('Error al generar notificación:', error);
      }
    );
  }

  public newWarehouse(coordinates: any): void {
    let userIdString = localStorage.getItem('userId'); // Obtiene el userId como string
    let coordinatesString = String(coordinates);

    if (!userIdString) {
      console.error('Error: No se encontró userId en localStorage');
      return;
    }

    let userId = parseInt(userIdString, 10); // Convierte userId a número

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
      (response) => {
        this.loading = false;
        this.changueScreen = false;
        this.isModalOpen = true;
        console.log('Almacén creado con éxito:', response);
      },
      (error) => console.error('Error al crear almacén:', error)
    );
  }

  public checkWarehouses(): void {
    this.loading = true;
    this.changueScreen = true;
    let userIdString = localStorage.getItem('userId');

    if (!userIdString) {
      console.error('Error: No se encontró userId en localStorage');
      return;
    }

    let userId = parseInt(userIdString, 10);

    let apiUrl = `${this.apiWarehouseUrl}/user/${userId}`;

    this.service.takeWarehouse(apiUrl).subscribe({
      next: (response) => {
          this.loading = false;
          this.changueScreen = false;
        this.warehouses = response;

        let randomIndex = Math.floor(Math.random() * this.warehouses.length);
        let randomWarehouse = this.warehouses[randomIndex];
        this.takeWarehouseProducts(randomWarehouse.id);
        this.randomWarehouseName = randomWarehouse.name ?? '';

        this.initializeDeleteImages();
      },
      error: (error) => {
          this.loading = false;
          this.changueScreen = false;
        console.error('Error fetching warehouses:', error);
      }
    });
  }

  public insertProductsWarehouse(): void {
    this.loading = true;
    this.changueScreen = true;

    let priceToNumber = parseFloat(this.productForm.value.price ?? '0');
    let stockToNumber = parseInt(this.productForm.value.stock ?? '0');
    let barcodeToNumber = parseInt(this.productForm.value.barcode ?? '0');
    let purchasePriceToNumber = parseFloat(this.productForm.value.purchasePrice ?? '0');


    const products: ProductAllData = {
      id: null,
      warehouse: this.selectedWarehouseId,
      name: this.productForm.value.name ?? '',
      brand: this.productForm.value.brand ?? '',
      price: priceToNumber,
      stock: stockToNumber,
      barcode: barcodeToNumber,
      product_type: this.productForm.value.productType ?? '',
      entry_date: this.productForm.value.entryDate ?? '',
      expiration_date: this.productForm.value.expirationDate || null,
      purchase_price: purchasePriceToNumber
    };

    this.service.insertProductsInWarehouse(this.apiProductsUrl, products).subscribe(
      (response) => {
        this.loading = false;
        this.changueScreen = false;
        this.isModalOpen = true;

        console.log('Producto añadido con exito:', response);
      },
      (error) => {
        this.loading = false;
        this.changueScreen = false;
        console.error('Error al añadir producto:', error)
      }
    );
  }

  public takeWarehouseProducts(warehouse_id: any): void {
    this.loading = false;
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

        this.productsUser = response;
        this.filtratedProductsforWarehouseId = [];
        this.productUserNames = [];

        for (let i = 0; i < this.productsUser.length; i++) {
          if (this.productsUser[i].warehouse == warehouse_id) {
            this.filtratedProductsforWarehouseId.push(this.productsUser[i]);
          }
        }

        this.page = 0;
        this.showProducts();
        this.takePage();
        this.getProductsSold();
      },
      error: (error) => {
        this.loading = false;
        this.changueScreen = false;
        console.error('Error al sacar los productos:', error);
      }
    });
  }

  public verifyUserVisits(): void {
    let isUserVisit = localStorage.getItem('userVisit');
    console.log('El usuario ha visitado la paigna??', isUserVisit);

    if (isUserVisit === 'true') {
      this.loadWelcomePage();
    }
  }

  public loadWelcomePage(): void {
    this.isFirstVisit = true;
    this.showWelcomeScreen = true;
    setTimeout(() => {
      this.showWelcomeScreen = false;
    }, 4000);
    
    setTimeout(() => {
      this.startTour();
    }, 4500);

    this.modifyVisitStatus();
  }

  public modifyVisitStatus(): void {
    localStorage.setItem('userVisit', 'false');
    let userIdString = localStorage.getItem('userId');

    if (!userIdString) {
      console.error('Error: No se encontró userId en localStorage');
      return;
    }

    let userId = parseInt(userIdString, 10);

    let url = `http://127.0.0.1:8000/api/user/${userId}/update-visit`;

    const visitPage: User = {
      isFirstVisit : false, 
    };

    this.service.editUserVisitStatus(url, visitPage).subscribe({
      next: (response) => {
        console.log('Usuario registrado como visitante de la página', response);
      },
      error: (error) => {
        console.log('No se puede verificar que el usuario ha visitado la página', error);
      }
    });
  }

//-----------------------------------------------GENERAR GRAFICOS(Saca los productos vendidos, pero solo se usan en los graficos)------//
  public getProductsSold(): void {
    let userIdString = localStorage.getItem('userId');
  
    if (!userIdString) {
      console.error('Error: No se encontró userId en localStorage');
      return;
    }
  
    let userId = parseInt(userIdString, 10);
  
    let apiUrl = `${this.apiSalesUrl}/user/${userId}`;
  
    this.service.takeProducts(apiUrl).subscribe({
      next: (response) => {
        this.productsSold = response;
        this.productsSoldQuantity = this.productsSold.map((product: any) => product.quantity);
        this.calculateMonthlySalesAndStock();
      },
      error: (error) => {
        console.error('Error al sacar los productos:', error);
      }
    });
  }
//--------------------------------------------------------------------------------------------------------//
  public changeShowForm(): void {
    if (this.showForm === false) {
      this.showForm = true;
    } else {
      this.showForm = false;
    }
  }

  public closeWarehouse(): void {
    this.cont = 0;
  }

  public closeProducts(): void {
    this.showForm = false;

    this.showWithdrawForm = false;
    this.selectWarehouse = false;
  }

  public openModalAddProduct(): void {
    this.scannerAction = 'addProductToStock'
    this.openModalScanner = true;
    console.log('Action: ', this.scannerAction);
  }

  public openModalSoldProduct(): void {
    this.scannerAction = 'moveProductToSold'
    this.openModalScanner = true;
    console.log('Action: ', this.scannerAction);
  }

  public closeModal(): void {
    this.openModalScanner = false;
  }
  //------------------------------------------------GENERAR GRAFICOS CON DATOS BBDD-------------------------------//
  public calculateMonthlySalesAndStock(): void {
        let actualYear = new Date().getFullYear();
        let salesForMonth = new Array(12).fill(0);
        let stockForMonth = new Array(12).fill(0);

        // Calcular ventas por mes
        for (let i = 0; i < this.productsSold.length; i++) {
            let fecha = new Date(this.productsSold[i].sale_date.replace(" ", "T"));
            if (fecha.getFullYear() === actualYear) {
                let month = fecha.getMonth();
                salesForMonth[month] += this.productsSoldQuantity[i] || 0;
            }
        }

        let entrateProductsForMonth = new Array(12).fill(0);
        for (let i = 0; i < this.productsUser.length; i++) {
            let product = this.productsUser[i];
            let month = new Date(product.entry_date).getMonth();
            entrateProductsForMonth[month] += product.stock; 
        }

        this.saleProductsForMonth = salesForMonth;
        this.entrateProductsForMonth = entrateProductsForMonth;
        this.reloadGraphics();

        console.log('Salida de productos OK', this.saleProductsForMonth);
        console.log('Entrada de productos OK', this.entrateProductsForMonth);
    }

  public reloadGraphics(): void {
  if (this.saleProductsForMonth.length > 0) {
      this.lineExitProducts.datasets[0].data = this.saleProductsForMonth;
  }
  if (this.entrateProductsForMonth.length > 0) {
      this.lineEntrateProducts.datasets[0].data = this.entrateProductsForMonth;
  }

  if (this.lineEntrateProducts.datasets[0].data.length > 0 && this.chartComponentLineEntrateProducts) {
    this.chartComponentLineEntrateProducts.updateChart();
  }
  if (this.lineExitProducts.datasets[0].data.length > 0 && this.chartComponentLineExitProducts) {
    this.chartComponentLineExitProducts.updateChart();
  }
 }
 //------------------------------------------------------------------------------------------------------//

 public lineExitProducts: any = {  
  labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  datasets: [{
    label: 'Salida de productos',
    data: [],  
    borderColor: '#6F4D94', 
    borderWidth: 2,
    fill: false
  }]
};

public lineEntrateProducts: any = {  
  labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  datasets: [{
    label: 'Entrada de productos',
    data: [],  
    borderColor: '#9A8BCA', 
    borderWidth: 2,
    fill: false
  }]
};

}
