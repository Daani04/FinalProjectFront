import { Component, OnInit } from '@angular/core';
import { FooterComponent } from "../../component/footer/footer.component";
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { RequestService } from '../../services/request.service';
import { data } from 'jquery';
import { ProductAllData, ProductSold } from '../../models/response.interface';
import { ViewChild } from '@angular/core';
import { ChartComponent } from '../../component/chart/chart.component';
import { NgClass, NgStyle } from '@angular/common';
import { RouterLink } from '@angular/router';
import introJs from 'intro.js';
import 'intro.js/introjs.css'; 

@Component({
  selector: 'app-graphics',
  imports: [ChartComponent, FooterComponent, ReactiveFormsModule, NgStyle, RouterLink],
  templateUrl: './graphics.component.html',
  styleUrl: './graphics.component.css'
})
export class GraphicsComponent implements OnInit {

@ViewChild('chartComponentBarSale') chartComponentBarSale!: ChartComponent;
@ViewChild('chartComponentLineSale') chartComponentLineSale!: ChartComponent;

@ViewChild('chartComponentCircularMostSale') chartComponentCircularMostSale!: ChartComponent;

@ViewChild('chartComponentLineEntrateProducts') chartComponentLineEntrateProducts!: ChartComponent;
@ViewChild('chartComponentLineExitProducts') chartComponentLineExitProducts!: ChartComponent;

@ViewChild('chartComponentLineGrossProfits') chartComponentLineGrossProfits!: ChartComponent;
@ViewChild('chartComponentLineNetProfits') chartComponentLineNetProfits!: ChartComponent;

//Extra
@ViewChild('chartComponentMostExpensiveProducts') chartComponentMostExpensiveProducts!: ChartComponent;
@ViewChild('chartComponentMostCheapProducts') chartComponentMostCheapProducts!: ChartComponent;

@ViewChild('chartComponentMoreStockProducts') chartComponentMoreStockProducts!: ChartComponent;
@ViewChild('chartComponentLittleStockProducts') chartComponentLittleStockProducts!: ChartComponent;

  constructor(public service: RequestService) { }

  public apiProductsUrl: string = "http://localhost:8000/api/data";
  public apiSalesUrl: string = "http://localhost:8000/api/sales";

  public products: ProductAllData [] = [];
  public productsSold: ProductSold [] = [];

  public productsSoldQuantity: number[] = [];
  public saleProductsForMonth: number[] = [];

  public saleProductsForWeek: number[] = []
  public entrateProductsForMonth: number[] = [];

  public moreSoldProductsName: string[] = [];
  public moreSoldProductsQuantity: number[] = [];

  public grossIncome: number[] = [];
  public netIncome: number[] = [];

  public mostExpensiveProductsPrice: number[] = [];
  public mostExpensiveProductsName: string[] = [];

  public mostCheapProductName: string[] = [];
  public mostCheapProductPrice: number[] = [];

  public mostStockProductsName: string[] = [];
  public mostStockProductsValue: number[] = [];

  public lessStockProductsName: string[] = [];
  public lessStockProductsValue: number[] = [];

  public cont1: number = 0;
  public cont2: number = 0;
  public cont3: number = 0;

  public contButton: number = 0;

  public response: string = '';

  public loading: boolean = false;

  public loadingAllPage: boolean = false;
  public changueScreen: boolean = false;

  public loadingData: boolean = false;
  public changueScreenData: boolean = false;


  public showFormIa: boolean = false;
  public GraphicIA: any;
  public dataNewGraphics: string[] = [];

  public modifyContButton(): void {
    if (this.contButton === 0) {
      this.contButton = 1;
    } else {
      this.contButton = 0;
    }
    this.showFormIa = false;
  }

  reactiveForm = new FormGroup({
    check1: new FormControl(false),
    check2: new FormControl(false),
    check3: new FormControl(false)
  });

  reactiveFormGraphics = new FormGroup({
    graphicInstructions: new FormControl(''),
  });

  ngOnInit(): void {
    this.cont1 = Number(localStorage.getItem('cont1')) || 0;
    this.cont2 = Number(localStorage.getItem('cont2')) || 0;
    this.cont3 = Number(localStorage.getItem('cont3')) || 0;

    // Si contX esta marcado es true y el ckeckbox saldra marcado
    this.reactiveForm.setValue({
      check1: this.cont1 === 1,
      check2: this.cont2 === 1,
      check3: this.cont3 === 1
    });
    this.checkAndLoadGraphics();
    this.checkProducts();
    this.getProductsSold();

    let isIntroStart = localStorage.getItem('graphics');

    if (isIntroStart === 'true') {
      this.startTour();
    }
  }

    public startTour(): void {

    localStorage.setItem('graphics', 'false');

    introJs().setOptions({
      nextLabel: 'Siguiente',
      prevLabel: 'Anterior',
      doneLabel: 'Entendido',
      showProgress: true,
      showBullets: false,
      tooltipClass: 'custom-tooltip',
      steps: [
        {
          element: '#welcome',
          intro: `
            <div style="text-align: center;">
            <p>📊 <strong>Bienvenido a la sección de gráficos.</strong> Aquí podrás visualizar <strong>estadísticas clave</strong> sobre tus <strong>productos</strong> y <strong>ventas</strong>. Para ver resultados, comienza <strong>añadiendo productos</strong> y <strong>registrando tus primeras ventas</strong>.</p>
              <img src="/img/graficosIntro.png" alt="Imagen de un grafico" style="max-width: 100%; height: auto; margin-top: 10px; border-radius: 15px;" />
            </div>
          `,
          position: 'bottom', 
        },
      ],
    }).start();
  }

  public onSubmitGraphics(): void {
    console.log( this.reactiveFormGraphics.value.graphicInstructions);
    this.createGraphics(this.reactiveFormGraphics.value.graphicInstructions);
  }

  public onSubmit(): void {
    if (this.reactiveForm.value.check1 !== undefined) {
      let cont1Local = this.reactiveForm.value.check1 ? 1 : 0;
      localStorage.setItem('cont1', cont1Local.toString());
      this.cont1 = cont1Local;
    }

    if (this.reactiveForm.value.check2 !== undefined) {
      let cont2Local = this.reactiveForm.value.check2 ? 1 : 0;
      localStorage.setItem('cont2', cont2Local.toString());
      this.cont2 = cont2Local;
    }

    if (this.reactiveForm.value.check3 !== undefined) {
      let cont3Local = this.reactiveForm.value.check3 ? 1 : 0;
      localStorage.setItem('cont3', cont3Local.toString());
      this.cont3 = cont3Local;
    }

    console.log(this.reactiveForm.value);
    console.log(this.cont1);
    console.log(this.cont2);
    console.log(this.cont3);
  }

  public showNewGraphicsIAForm(): void {
    this.showFormIa = true
  }

  public createGraphics(prompt: any) {
    let promptbbdd = this.createPromptFromProducts();
    this.loading = true; 
    this.dataNewGraphics = []; 
    this.service.createGraphics(prompt, promptbbdd).subscribe(
      (res) => {
        this.response = res.choices[0].message.content;
        let separateData = this.response.split('!'); // Separar la respuesta por "!".
        separateData.forEach((item: string) => {
          if (item.trim()) {  
            this.dataNewGraphics.push(item.trim()); 
          }
        });

      localStorage.setItem(`Customgraphic`, JSON.stringify(this.dataNewGraphics));
      
      console.log('Respuesta:', this.response);
      this.generateGraphics();
      this.loading = false;  
      },
      (error) => {
        console.error('Error:', error);
        this.loading = false;  
      }
    );
  }

  public checkAndLoadGraphics(): void {
    const localStorageData = localStorage.getItem('Customgraphic');
    this.dataNewGraphics = localStorageData ? JSON.parse(localStorageData) : [];
  
    if (this.dataNewGraphics.length >= 3) {
      this.generateGraphics();
    }
  }
  
  public generateGraphics(): void {
    if (this.dataNewGraphics.length > 0) {
      let allColors: string[] = ['#5B3F7C', '#6F4D94', '#7A6DA7', '#8A7DBD', '#9A8BCA', '#8A7DBD', '#9A8BCA',
        '#5B3F7C', '#6F4D94', '#7A6DA7', '#8A7DBD', '#9A8BCA', '#8A7DBD', '#9A8BCA',
        '#5B3F7C', '#6F4D94', '#7A6DA7', '#8A7DBD', '#9A8BCA', '#8A7DBD', '#9A8BCA'
      ];
      let necessaryColors: string[] = [];
      let parsedLabels: string[] = [];
      let parsedData: string[] = [];

      let labelsSplit = this.dataNewGraphics[0].split(' ');
      let dataSplit = this.dataNewGraphics[2].split(' ');

      console.log('LabelSplit: ', labelsSplit);
      console.log('DataSplit: ', dataSplit);

      for (let i = 0; i < dataSplit.length; i++) {
        necessaryColors.push(allColors[i]);  
      }
      
      for (let i = 0; i < labelsSplit.length; i++) {
        let label = labelsSplit[i].trim();
          parsedLabels.push(label);
        
      }

      for (let i = 0; i < dataSplit.length; i++) {
        let label = dataSplit[i].trim();
          parsedData.push(label);
      }
  
      this.GraphicIA = {
        labels: parsedLabels,
        datasets: [{
          label: this.dataNewGraphics[1],
          data: parsedData, 
          backgroundColor: necessaryColors,
          borderColor: '#5B3F7C',
          borderWidth: 1
        }]
      };
    }
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
        Expiración: ${product.expiration_date}
        IdAlmacen: ${product.warehouse}
        -----------------------------------
      `;
    });
    return promptbbdd;
  }

  public deleteCustomGraphic(): void {
    localStorage.removeItem('Customgraphic');
    location.reload();//Recarga la pagina para aplicar los cambios
  }

  public checkProducts(): void {
    let userIdString = localStorage.getItem('userId');
  
    if (!userIdString) {
      console.error('Error: No se encontró userId en localStorage');
      return;
    }
  
    let userId = parseInt(userIdString, 10);
  
    let apiUrl = `${this.apiProductsUrl}/user/${userId}`;
  
    this.service.takeProducts(apiUrl).subscribe({
      next: (response) => {
        this.products = response;
        this.calculateStockExtremes();
        this.calculateProductPrices();
        this.calculateMonthlySalesAndStock();
        this.calculateIncomeAndBenefit();

        /*
        this.getMoreSoldProducts();
        this.getProductsForWeek();
        this.calculateIncomeAndBenefit();
        this.calculateStockExtremes();
        this.calculateProductPrices();
        this.calculateMonthlySalesAndStock();
        */
      },
      error: (error) => {
        console.error('Error al sacar los productos:', error);
      }
    });
  }

  public getProductsSold(): void {
    this.loadingData = true;
    this.changueScreenData = true; 
    let userIdString = localStorage.getItem('userId');
  
    if (!userIdString) {
      console.error('Error: No se encontró userId en localStorage');
      return;
    }
  
    let userId = parseInt(userIdString, 10);
  
    let apiUrl = `${this.apiSalesUrl}/user/${userId}`;
  
    this.service.takeProducts(apiUrl).subscribe({
      next: (response) => {
        this.loadingData = false;
        this.changueScreenData = false; 

        this.productsSold = response;
        this.productsSoldQuantity = this.productsSold.map((product: any) => product.quantity);
        this.getMoreSoldProducts();
        this.getProductsForWeek();
        this.calculateIncomeAndBenefit();
        this.calculateStockExtremes();
        this.calculateProductPrices();
        this.calculateMonthlySalesAndStock();
      },
      error: (error) => {
        this.loadingData = false;
        this.changueScreenData = false; 
        console.error('Error al sacar los productos:', error);
        this.checkProductsData();
      }
    });
  }
  
  public reloadGraphics(): void {
    if (this.saleProductsForMonth.length > 0) {
        this.barSale.datasets[0].data = this.saleProductsForMonth;
    }

    if (this.moreSoldProductsName.length > 0 && this.moreSoldProductsQuantity.length > 0) {
        this.circularMostSale.labels = this.moreSoldProductsName;
        this.circularMostSale.datasets[0].data = this.moreSoldProductsQuantity;
    }
 
    if (this.saleProductsForWeek.length > 0) {
        this.lineSale.datasets[0].data = this.saleProductsForWeek;
    }
 
    if (this.saleProductsForMonth.length > 0) {
        this.lineExitProducts.datasets[0].data = this.saleProductsForMonth;
    }
 
    if (this.entrateProductsForMonth.length > 0) {
        this.lineEntrateProducts.datasets[0].data = this.entrateProductsForMonth;
    }

    if (this.grossIncome.length > 0 && this.netIncome.length > 0) {
      this.lineGrossProfits.datasets[0].data = this.grossIncome;
      this.lineNetProfits.datasets[0].data = this.netIncome;
    }

    if (this.mostExpensiveProductsName.length > 0 && this.mostExpensiveProductsPrice.length > 0) {
      this.mostExpensiveProducts.labels = this.mostExpensiveProductsName;
      this.mostExpensiveProducts.datasets[0].data = this.mostExpensiveProductsPrice;
    } 

    if (this.mostCheapProductName.length > 0 && this.mostCheapProductPrice.length > 0) {
      this.mostCheapProducts.labels = this.mostCheapProductName;
      this.mostCheapProducts.datasets[0].data = this.mostCheapProductPrice;
    } 

    if (this.mostStockProductsName.length > 0 && this.mostStockProductsValue.length > 0) {
      this.moreStockProducts.labels = this.mostStockProductsName;
      this.moreStockProducts.datasets[0].data = this.mostStockProductsValue;
    }

    if (this.lessStockProductsName.length > 0 && this.lessStockProductsValue.length > 0) {
      this.littleStockProducts.labels = this.lessStockProductsName;
      this.littleStockProducts.datasets[0].data = this.lessStockProductsValue;
    }

    

    if (this.barSale.datasets[0].data.length > 0 && this.chartComponentBarSale) {
      this.chartComponentBarSale.updateChart();
    }
    if (this.lineSale.datasets[0].data.length > 0 && this.chartComponentLineSale) {
      this.chartComponentLineSale.updateChart();
    }

    if (this.circularMostSale.datasets[0].data.length > 0 && this.chartComponentCircularMostSale) {
      this.chartComponentCircularMostSale.updateChart();
    }

    if (this.lineEntrateProducts.datasets[0].data.length > 0 && this.chartComponentLineEntrateProducts) {
      this.chartComponentLineEntrateProducts.updateChart();
    }
    if (this.lineExitProducts.datasets[0].data.length > 0 && this.chartComponentLineExitProducts) {
      this.chartComponentLineExitProducts.updateChart();
    }

    if (this.lineGrossProfits.datasets[0].data.length > 0 && this.chartComponentLineGrossProfits) {
      this.chartComponentLineGrossProfits.updateChart();
    }
    if (this.lineNetProfits.datasets[0].data.length > 0 && this.chartComponentLineNetProfits) {
      this.chartComponentLineNetProfits.updateChart();
    }

    if (this.mostExpensiveProducts.datasets[0].data.length > 0 && this.chartComponentMostExpensiveProducts) {
      this.chartComponentMostExpensiveProducts.updateChart();
    }
    if (this.mostCheapProducts.datasets[0].data.length > 0 && this.chartComponentMostCheapProducts) {
      this.chartComponentMostCheapProducts.updateChart();
    }

    if (this.moreStockProducts.datasets[0].data.length > 0 && this.chartComponentMoreStockProducts) {
      this.chartComponentMoreStockProducts.updateChart();
    }
    if (this.littleStockProducts.datasets[0].data.length > 0 && this.chartComponentLittleStockProducts) {
      this.chartComponentLittleStockProducts.updateChart();
    }
 }

 //-------------------------------CALCULOS DE DATOS PARA LOS GRAFICOS-------------------------------------------//
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
      for (let i = 0; i < this.products.length; i++) {
          let product = this.products[i];
          let month = new Date(product.entry_date).getMonth();
          entrateProductsForMonth[month] += product.stock; 
      }

      this.saleProductsForMonth = salesForMonth;
      this.entrateProductsForMonth = entrateProductsForMonth;
      this.reloadGraphics();

      console.log('Salida de productos OK', this.saleProductsForMonth);
      console.log('Entrada de productos OK', this.entrateProductsForMonth);
  }

  public calculateProductPrices(): void {
    const sortedByPriceDesc = [...this.products]
      .filter(p => p.price !== undefined && p.name !== undefined)
      .sort((a, b) => b.price - a.price)
      .slice(0, 5);

    this.mostExpensiveProductsName = sortedByPriceDesc.map(p => p.name!);
    this.mostExpensiveProductsPrice = sortedByPriceDesc.map(p => p.price!);

    const sortedByPriceAsc = [...this.products]
      .filter(p => p.price !== undefined && p.name !== undefined)
      .sort((a, b) => a.price - b.price)
      .slice(0, 5);

    this.mostCheapProductName = sortedByPriceAsc.map(p => p.name!);
    this.mostCheapProductPrice = sortedByPriceAsc.map(p => p.price!);
    this.reloadGraphics();
  }

  public calculateStockExtremes(): void {
    const sortedByStockDesc = [...this.products]
      .filter(p => p.stock !== undefined && p.name !== undefined)
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 5);

    this.mostStockProductsName = sortedByStockDesc.map(p => p.name!);
    this.mostStockProductsValue = sortedByStockDesc.map(p => p.stock!);

    const sortedByStockAsc = [...this.products]
      .filter(p => p.stock !== undefined && p.name !== undefined)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5);

    this.lessStockProductsName = sortedByStockAsc.map(p => p.name!);
    this.lessStockProductsValue = sortedByStockAsc.map(p => p.stock!);
    this.reloadGraphics();
  }

  public calculateIncomeAndBenefit(): void {
    let grossIncome: number[] = new Array(12).fill(0);
    let netIncome: number[] = new Array(12).fill(0);

    for (let product of this.products) {
      let month = new Date(product.entry_date).getMonth();
      grossIncome[month] += product.purchase_price;
      netIncome[month] += product.price;
    }

    this.grossIncome = grossIncome;
    this.netIncome = netIncome.map((net, i) => net - grossIncome[i]);
    this.reloadGraphics();
  }

  public getProductsForWeek(): void {
    let actualYear = new Date().getFullYear();
    let currentWeekNumber = this.getWeekNumber(new Date());
    let salesForWeek = new Array(7).fill(0); // Inicializar array de 7 días
  
    for (let i = 0; i < this.productsSold.length; i++) {
      let fecha = new Date(this.productsSold[i].sale_date.replace(" ", "T"));
      if (fecha.getFullYear() === actualYear && this.getWeekNumber(fecha) === currentWeekNumber) {
        let dayOfWeek = fecha.getDay(); 
        let correctedDayOfWeek = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;  //Ajuste para que las posiciones de los dias sean correctas
        salesForWeek[correctedDayOfWeek] += this.productsSoldQuantity[i] || 0;      
      }
    }
  
    this.saleProductsForWeek = salesForWeek; 
    //console.log('Ventas semanales', this.saleProductsForWeek);
    this.reloadGraphics();
  }
  
  //Saca la fecha semana actual para solo mostrar los datos sobre esta 
  private getWeekNumber(date: Date): number {
      let tempDate = new Date(date);

      // Ajustar la fecha al primer día de la semana 
      tempDate.setDate(tempDate.getDate() - tempDate.getDay() + 1);

      // Calcular la diferencia en milisegundos entre la fecha ajustada y el 1 de enero
      let startOfYear = new Date(tempDate.getFullYear(), 0, 1);
      let daysDifference = Math.floor((tempDate.getTime() - startOfYear.getTime()) / (1000 * 3600 * 24));

      // Calcular el número de la semana
      let weekNumber = Math.ceil((daysDifference + 1) / 7);

      return weekNumber;
  }

  public getMoreSoldProducts(): void {
  const productMap: Map<string, { name: string, quantity: number }> = new Map();

  for (let i = 0; i < this.productsSold.length; i++) {
    let product = this.productsSold[i];
    let barcode = product.barcode ?? 'Sin codigo de barras';
    let quantity = product.quantity;
    let name = product.name ?? 'No se ha encontrado el nombre del producto';

    //Comprueba si ya existe el codigo de barras que se intenta registrar, si es asi simplemente suma la cantidad, si no lo crea 
    if (productMap.has(barcode)) {
      productMap.get(barcode)!.quantity += quantity;
    } else {
      productMap.set(barcode, { name, quantity });
    }
  }

  // Ordenar por cantidad descendente y tomar los 4 primeros
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 4);

  this.moreSoldProductsName = [];
  this.moreSoldProductsQuantity = [];

  for (const product of topProducts) {
    this.moreSoldProductsName.push(product.name);
    this.moreSoldProductsQuantity.push(product.quantity);
  }

  this.reloadGraphics();
}
//--------------------------------------------------------------------------------------------------//
  
  public checkProductsData():void {
    if (this.products.length > 0 && this.productsSold.length > 0) {
      this.loadingAllPage = false; 
      this.changueScreen = false; 
    } else {
      this.loadingAllPage = true; 
      this.changueScreen = true; 
      console.log('No hay datos disponibles para mostrar');
    }
  }
  
  //GRAFICOS PREDEFINIDOS
  public barSale: any = {  
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    datasets: [{
      label: 'Ventas Mensuales',
      data: [],  
      backgroundColor: ['#5B3F7C', '#6F4D94', '#7A6DA7', '#8A7DBD', '#9A8BCA'],
      borderColor: '#5B3F7C', 
      borderWidth: 1
    }]
  };
  
  public lineSale: any = {
    labels: ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'],
    datasets: [
      {
        label: 'Ventas semanales',
        data: [],
        borderColor: '#8F5B8C',
        fill: false,
        stepped: true,
      }
    ]
  };
  
  public circularMostSale: any = {
    labels: [],
    datasets: [{
      label: 'Cantidad vendida',
      data: [],
      backgroundColor: ['#6F4D94', '#7A6DA7', '#9A8BCA', '#6F4D94'] 
    }]
  };
  
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
  
  public lineGrossProfits: any  = {  
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    datasets: [{
      label: 'Precio de compra',
      data: [],  
      borderColor: '#6F4D94', 
      backgroundColor: 'rgba(145, 112, 188, 0.3)', 
      borderWidth: 2,
      fill: true
    }]
  };
  
  public lineNetProfits: any  = {  
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    datasets: [{
      label: 'Beneficio estimado',
      data: [],  
      borderColor: '#8F5B8C', 
      backgroundColor: 'rgba(159, 94, 148, 0.3)', 
      borderWidth: 2,
      fill: true
    }]
  };
  
  //GRAFICOS EXTRA
  public mostExpensiveProducts: any = {  
    labels: [],
    datasets: [{
      label: 'Productos mas caros',
      data: [],  
      backgroundColor: ['#6F4D94', '#7A6DA7', '#9A8BCA', '#6F4D94', '#7A6DA7'], 
      borderColor: 'rgb(159, 94, 148)',
      borderWidth: 2
    }]
  };

  public mostCheapProducts: any = {  
    labels: [],
    datasets: [{
      label: 'Productos mas baratos',
      data: [],  
      backgroundColor: ['#6F4D94', '#7A6DA7', '#9A8BCA', '#6F4D94', '#7A6DA7'], 
      borderColor: 'rgb(159, 94, 148)',
      borderWidth: 2
    }]
  };

  public littleStockProducts: any = {  
    labels: [],
    datasets: [{
      label: 'Stock del producto',
      data: [],
      backgroundColor: ['#6F4D94', '#7A6DA7', '#9A8BCA', '#7A6DA7', '#9A8BCA'], 
      borderColor: 'rgb(159, 94, 148)',
      borderWidth: 2
    }]
  };

  public moreStockProducts: any = {  
    labels: [],
    datasets: [{
      label: 'Stock del producto',
      data: [],  
      backgroundColor: ['#9A8BCA', '#6F4D94', '#7A6DA7', '#9A8BCA', '#6F4D94'], 
      borderColor: 'rgb(159, 94, 148)', 
      borderWidth: 2
    }]
  };
  
}  