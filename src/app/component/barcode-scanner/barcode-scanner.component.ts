import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library'; 
import { CommonModule } from '@angular/common';
import { RequestService } from '../../services/request.service';
import { HttpClient } from '@angular/common/http';
import { ProductAllData, User } from '../../models/response.interface';
import { ModalComponent } from "../modal/modal.component";

@Component({
  selector: 'app-barcode-scanner',
  imports: [CommonModule, ZXingScannerModule],
  templateUrl: './barcode-scanner.component.html',
  styleUrl: './barcode-scanner.component.css'
})
export class BarcodeScannerComponent implements OnInit {

  constructor(public service: RequestService, private http: HttpClient) { }

  @Output() scanResult = new EventEmitter<string>();
  @Output() scanCompleted = new EventEmitter<void>();
  @Output() productNotFound = new EventEmitter<void>();

  @Input() scannerAction: string = '';

  public apiProductsUrl: string = "http://localhost:8000/api/data";
  public productsUser: any[] = [];
  public barcodeUserProducts: { [barcode: string]: any } = {};

  public isModalOpen: boolean = false;

  public modalAction: string = '';

  public openCehckModal: boolean = false;

  private isProcessing: boolean = false;
  private lastScannedCode: string = '';
  private scanTimeout: any = null;

  scannedCode: string = '';
  productDetails: any = null;
  isValid: boolean | null = null;
  
  formats = [BarcodeFormat.EAN_13, BarcodeFormat.CODE_128];

  ngOnInit() {
    this.getUserProducts();
  }

  public closeModal(): void {
    this.isModalOpen = false;
  }

  onScanSuccess(event: any) {
    const result = event as string;

    // Si estamos procesando un código, ignorar nuevos escaneos
    if (this.isProcessing) {
      return;
    }

    // Si es el mismo código que el último escaneado, ignorar
    if (result === this.lastScannedCode) {
      return;
    }

    this.isProcessing = true;
    this.lastScannedCode = result;
    this.scannedCode = result;

    // Limpiar cualquier timeout pendiente
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
    }

    console.log('Escaneando código:', result);
    console.log('Productos disponibles:', Object.keys(this.barcodeUserProducts));

    // Verificar si el producto existe
    const productFound = this.barcodeUserProducts[result];
    
    if (productFound) {
      console.log('Producto encontrado:', productFound);
      this.productDetails = productFound;
      this.isValid = true;
      this.addScannProduct();
    } else {
      console.log('Producto no encontrado para el código:', result);
      this.productNotFound.emit();
    }

    // Establecer un timeout para resetear el estado
    this.scanTimeout = setTimeout(() => {
      this.isProcessing = false;
      this.lastScannedCode = '';
    }, 3000);
  }

  public addScannProduct(): void {
    if (!this.productDetails || !this.productDetails.id) {
      console.error('No hay detalles válidos del producto para actualizar');
      return;
    }

    let selectOneProductUrl = `${this.apiProductsUrl}/${this.productDetails.id}`;
    let updateStock = this.productDetails.stock;

    if (this.scannerAction === "moveProductToSold" && updateStock > 0) {
      updateStock -= 1;
    } else if(this.scannerAction === "addProductToStock") {
      updateStock += 1;
    } else {
      console.log('No se puede actualizar el stock:', this.scannerAction, updateStock);
      return;
    }

    const products: ProductAllData = {
      id: null,
      warehouse: this.productDetails.warehouse,
      name: this.productDetails.name,
      brand: this.productDetails.brand,
      price: this.productDetails.price,
      product_type: this.productDetails.product_type,
      entry_date: this.productDetails.entry_date, 
      expiration_date: this.productDetails.expiration_date,
      purchase_price: this.productDetails.purchase_price,
      barcode: this.productDetails.barcode,
      stock: updateStock
    };

    this.service.editProduct(selectOneProductUrl, products).subscribe({
      next: (response) => {
        console.log('Producto modificado exitosamente:', response);
        // Actualizar el producto en el cache local
        if (this.barcodeUserProducts[this.productDetails.barcode]) {
          this.barcodeUserProducts[this.productDetails.barcode].stock = updateStock;
        }
        this.scanCompleted.emit();
        this.openCehckModal = true;
      },
      error: (error) => {
        console.error('Error al modificar el producto:', error);
        this.isProcessing = false;
      }
    });
  }

  public getUserProducts(): void {
    let userIdString = localStorage.getItem('userId');

    if (!userIdString) {
      console.error('Error: No se encontró userId en localStorage');
      return;
    }

    let userId = parseInt(userIdString, 10);
    let apiUrl = `${this.apiProductsUrl}/user/${userId}`;

    this.service.takeProducts(apiUrl).subscribe({
      next: (response) => {
        this.productsUser = response;
        // Limpiar y reconstruir el mapa de productos
        this.barcodeUserProducts = {};
        this.productsUser.forEach((product) => {
          if (product.barcode) {
            const barcodeStr = product.barcode.toString().trim();
            if (barcodeStr !== '') {
              this.barcodeUserProducts[barcodeStr] = product;
            }
          }
        });
        console.log('Productos cargados. Códigos disponibles:', Object.keys(this.barcodeUserProducts));
      },
      error: (error) => {
        console.error('Error al cargar los productos:', error);
      }
    });
  }

  ngOnDestroy() {
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
    }
  }
}
