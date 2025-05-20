import { Component, ViewChild, ElementRef, Input, AfterViewInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { ChartType, ChartConfiguration } from 'chart.js';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-chart',
  standalone: true,
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {

  @ViewChild('chartCanvas', { static: false }) chartRef!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;

  @Input() type: ChartType = 'bar';
  @Input() data: ChartConfiguration['data'] | null = null;

  // Para mantener las opciones del gráfico
  private chartOptions: any;

  ngAfterViewInit(): void {
    if (this.chartRef && this.data) {
      this.createChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      if (this.chart) {
        this.updateChart();  // Si ya existe el gráfico, lo actualizamos
      } else if (this.chartRef && this.data) {
        this.createChart();  // Si no existe, creamos uno nuevo
      }
    }
  }

  private createChart(): void {
    const ctx = this.chartRef.nativeElement.getContext('2d');
    if (!ctx || !this.data) return;

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: this.type === 'doughnut' || this.type === 'pie' ? {} : {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(149, 146, 146, 0.5)',  
          },
        },
        x: {
          grid: {
            color: 'rgba(149, 146, 146, 0.5)',  
          },
        },
        r: {
          grid: {
            color: 'rgb(181, 177, 177)',  
            lineWidth: 1,  
          },
          angleLines: {
            color: 'rgb(181, 177, 177)',  
            lineWidth: 1,  
          },
          ticks: {
            display: false,  
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: 'white'  // Color del texto
          }
        }
      }
    };

    // Crea el gráfico
    this.chart = new Chart(ctx, {
      type: this.type,
      data: this.data,
      options: this.chartOptions
    });
  }

  public updateChart(): void {
    if (this.chart && this.data) {
      this.chart.data = this.data;  
      this.chart.update(); 
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy(); 
      this.chart = null;
    }
  }
}
