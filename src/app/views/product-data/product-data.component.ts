import { Component } from '@angular/core';
import { FooterComponent } from "../../component/footer/footer.component";
import { NgStyle } from '@angular/common';
import { FormControl, FormGroup, FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RequestService } from '../../services/request.service';
import { HttpClient } from '@angular/common/http';
import { ProductAllData } from '../../models/response.interface';

@Component({
  selector: 'app-product-data',
  imports: [FooterComponent, NgStyle, FormsModule, ReactiveFormsModule, NgStyle],
  templateUrl: './product-data.component.html',
  styleUrl: './product-data.component.css'
})
export class ProductDataComponent {

  //FALTA HACE LA PARTE DE LOS FILTROS, DE MOMENTO SOLO SE HAN DEFINIDO
  constructor(private route: ActivatedRoute, public service: RequestService, private http: HttpClient) {}

  public productId: number = 0;
  public warehouseId: number = 0;

  public apiProductsUrl: string = "http://localhost:8000/api/data";

  public products: any[] = [];
  public page: number = 0;
  public itemsPerPage: number = 5;

  public allProductType: string[] = [];

  public totalPages: number = 0;
  public actualPage: number = 1;

  public viewMenu: boolean = false;
  public widthMenu: string = "60px";

  public loading: boolean = false;
  public changueScreen: boolean = false;

  public filtratedProductsActivated = false;

  public viewFormModifyData: boolean = false;

  public selectedProduct: ProductAllData | null = null;

  public searchQuery: string = '';
  public minPrice: number | null = null;
  public maxPrice: number | null = null;
  public productType: string = '';
  public entryDate: string = '';

  public productsUser: any[] = [];
  public filtratedProductsforWarehouseId: any[] = [];
  
  public showProducts(): void {
    this.products = this.filtratedProductsforWarehouseId.slice(this.page, this.page + this.itemsPerPage);
  }
  
  ngOnInit(): void {
    let warehouse_id = this.route.snapshot.paramMap.get('id'); // Obtener el ID pasado a traves de la URL

    this.takeWarehouseProducts(warehouse_id); 
  }

  public getProductTypes(): void {  
    this.filtratedProductsforWarehouseId.forEach(product => {
      if (!this.allProductType.includes(product.product_type)) { //includes => comprueba si el valro de encuentra en el array, devolviendo true o false
        this.allProductType.push(product.product_type);
      }
    });
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

  public deployMenu(): void {
    if (this.viewMenu === false) {
      this.widthMenu = "870px";
      this.viewMenu = true;
    } else {
      this.widthMenu = "60px";
      this.viewMenu = false;
    }
  }
  
  public onSearch(): void {
      this.filtratedProducts();
  }

  reactiveForm = new FormGroup({
    searchQuery: new FormControl(''),  
    minPrice: new FormControl(0),  
    maxPrice: new FormControl(1000),  
    productType: new FormControl(''),
    entryDate: new FormControl('')  
  });     

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

  public takeWarehouseProducts(warehouse_id: any): void {
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
        this.productsUser = response;
        
        for (let i = 0; i < this.productsUser.length; i++) {
          if (this.productsUser[i].warehouse == warehouse_id) {
            this.filtratedProductsforWarehouseId.push(this.productsUser[i]);
          }
        }
        console.log(this.filtratedProductsforWarehouseId);

        this.showProducts();
        this.takePage();
        this.getProductTypes();
      },
      error: (error) => {
        console.error('Error al sacar los productos:', error);
      }
    });
  }

  public filtratedProducts():void {
    let productName = this.reactiveForm.value.searchQuery ?? '';
    let maxPrice = this.reactiveForm.value.maxPrice ?? 1000;
    let minPrice = this.reactiveForm.value.minPrice ?? 0;
    let productType = this.reactiveForm.value.productType ?? '';
    let entryDate = this.reactiveForm.value.entryDate ?? '';

    let productNameFilterWords = productName.trim().split(' ');

  // Comprobar si al menos un campo es válido para ejecutar el filtrado
  if (productName || minPrice !== 0 || maxPrice !== 1000 || productType || entryDate) {
    this.filtratedProductsActivated = true;
    // Filtrar productos por nombre
    if (productName !== '') {
      this.productsUser = this.productsUser.filter(product =>
        productNameFilterWords.some(word =>
          product.name.toLowerCase().includes(word.toLowerCase())
        )
      );
    }

    // Filtrar productos por precio
    this.productsUser = this.productsUser.filter(product =>
      product.price >= minPrice && product.price <= maxPrice
    );

    // Filtrar productos por tipo
    if (productType !== '') {
      this.productsUser = this.productsUser.filter(product =>
        product.product_type && product.product_type.toLowerCase() === productType.toLowerCase()
      );
    }
    
    //PROBLEMA!!! SOLO PUEDE FILTRAR LAS FECHAS DE LO PRODUCTOS INSERTADOS DESDE POSTMAN, SI ES DESDE LA APLICACOIN NO LOS SACA
    // Filtrar productos por fecha de entrada
    if (entryDate !== '') {
      this.productsUser = this.productsUser.filter(product => {
        const productDate = new Date(product.entry_date).toISOString().split('T')[0];
        return productDate === entryDate;
      });
    }

  } else {
    window.location.reload();
  }
    console.log(productName, maxPrice, minPrice, productType, entryDate)
  }
  
  public deleteProduct(id: number): void {
    console.log('deleteID', id);

    let deleteProductUrl = `${this.apiProductsUrl}/${id}`;

    this.service.deleteProduct(deleteProductUrl).subscribe({
      next: (response) => {
        console.log('Producto eliminado:', this.selectedProduct);
        window.location.reload();

      },
      error: (error) => {
        console.error('Error al eliminar el producto:', error);
      }
    });
  }

  public dataSelectedProduct(productId: number, warehouseId: number): void {
  this.productId = productId;
  this.warehouseId = warehouseId;
  this.viewFormModifyData = !this.viewFormModifyData;

  const selectOneProductUrl = `${this.apiProductsUrl}/${this.productId}`;

  this.service.takeProducts(selectOneProductUrl).subscribe({
    next: (response) => {
      this.selectedProduct = response as ProductAllData; //Se tiene que iniciar como objeto ya que si no despues no se puede acceder a sus datos en el productForm 
      console.log('Producto encontrado:', this.selectedProduct);
      
      //Permite editar el formulario de forma que podemos meter valores predeterminados
      this.productForm.patchValue({
        name: this.selectedProduct.name,
        brand: this.selectedProduct.brand,
        price: this.selectedProduct.price.toString(), 
        stock: this.selectedProduct.stock.toString(),
        barcode: this.selectedProduct.barcode?.toString() || '',
        productType: this.selectedProduct.product_type,
        expirationDate: this.selectedProduct.expiration_date?.split(' ')[0] || '', 
        entryDate: this.selectedProduct.entry_date.split(' ')[0], 
        purchasePrice: this.selectedProduct.purchase_price.toString()
      });
    },
    error: (error) => {
      console.error('Error al seleccionar el producto:', error);
    }
  });
}

  public closeModal(): void {
    this.viewFormModifyData = false;
  }

  public editProduct(): void {
    window.location.reload();

    let selectOneProductUrl = `${this.apiProductsUrl}/${this.productId}`;

    let priceToNumber = parseFloat(this.productForm.value.price ?? '0');
    let stockToNumber = parseInt(this.productForm.value.stock ?? '0');
    let barcodeToNumber = parseInt(this.productForm.value.barcode ?? '0');
    let purchasePriceToNumber = parseFloat(this.productForm.value.purchasePrice ?? '0');

    const products: ProductAllData = {
      id: null,
      warehouse: this.warehouseId,
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

    this.service.editProduct(selectOneProductUrl, products).subscribe({
      next: (response) => {
        console.log('Producto modificado:', response);
      },
      error: (error) => {
        console.error('Error al modificar el producto:', error);
      }
    });
  }
    
}
