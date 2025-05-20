import { Component} from '@angular/core';
import Map from 'ol/Map.js'; 
import View from 'ol/View.js'; 
import TileLayer from 'ol/layer/Tile.js'; 
import { fromLonLat } from 'ol/proj.js'; 
import StadiaMaps from 'ol/source/StadiaMaps.js'; 
import { Vector as VectorLayer } from 'ol/layer.js'; 
import { Point } from 'ol/geom.js'; 
import { Feature } from 'ol';
import { Vector as VectorSource } from 'ol/source.js'; 
import { Style, Fill, Stroke, Circle } from 'ol/style.js'; 
import { HttpClient } from '@angular/common/http';
import { RequestService } from '../../services/request.service';
import { Warehouse } from '../../models/response.interface';
import { NgStyle } from '@angular/common';
import introJs from 'intro.js';
import 'intro.js/introjs.css'; 


@Component({
  selector: 'app-leaflet-map',
  templateUrl: './leaflet-map.component.html',
  imports: [NgStyle],
  styleUrls: ['./leaflet-map.component.css']
})
export class LeafletMapComponent {

  constructor(public service: RequestService, private http: HttpClient) { }

  public apiWarehouseUrl: string = "http://127.0.0.1:8000/api/warehouse";

  public warehouses: Warehouse[] = [];
  public coordinates: number[][] = [];
  public loginUserCoordinates: number[][] = [];

  public loading: boolean = false;
  public changueScreen: boolean = false;

  ngOnInit(): void {
    this.checkWarehouses();

    let isIntroStart = localStorage.getItem('map');

    if (isIntroStart === 'true') {
      this.startTour();
    }
  }



  public startTour(): void {
    localStorage.setItem('map', 'false');

    introJs().setOptions({
      nextLabel: 'Siguiente',
      prevLabel: 'Anterior',
      doneLabel: 'Entendido',
      showProgress: true,
      showBullets: false,
      steps: [
        {
          element: '#welcome',
          intro: '🗺️ <strong>Visualización geográfica:</strong> En este mapa puedes ver <strong>todos los almacenes registrados</strong> en StockMaster. Los de color <strong>naranja</strong> son <strong>tuyos</strong> y los <strong>morados</strong> pertenecen a otros usuarios.',
          position: 'bottom', 
          tooltipClass: 'introjs-welcome-tooltip',
        },
      ],
    }).start();
  }

  public startMap(): void {
    const vectorSource = new VectorSource();
  
    this.coordinates.forEach(coord => {
      let isLoginUser = false; 
    
      for (let i = 0; i < this.loginUserCoordinates.length; i++) {
        if (this.loginUserCoordinates[i][0] === coord[0] && this.loginUserCoordinates[i][1] === coord[1]) {
          isLoginUser = true;
          break; 
        }
      }
  
      const feature = new Feature({
        geometry: new Point(fromLonLat(coord)),
      });
  
      const style = new Style({
        image: new Circle({
          radius: 25, 
          fill: new Fill({
            color: isLoginUser ? 'rgba(255, 0, 0, 0.8)' : 'rgba(78, 35, 148, 0.8)', // Rojo para el usuario logeado, morado para los demás
          }),
          stroke: new Stroke({
            color: '#DBC9F5',
            width: 3
          })
        })
      });
  
      feature.setStyle(style);
      vectorSource.addFeature(feature);
    });
  
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });
  
    const map = new Map({
      target: 'mapa',
      layers: [
        new TileLayer({
          source: new StadiaMaps({
            layer: 'alidade_smooth_dark', 
            retina: true,  
          }),
        }),
        vectorLayer
      ],
      view: new View({
        center: fromLonLat([-0.3763, 39.4699]),
        zoom: 11,
      }),
      controls: [] 
    });
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

    this.service.takeWarehouse(this.apiWarehouseUrl).subscribe({
      next: (response) => {
        this.loading = false;
        this.changueScreen = false;
        this.warehouses = response;
        for (let i = 0; i < this.warehouses.length; i++) {
          let [lat, lng] = this.warehouses[i].location.split(',').map(Number);
            if (this.warehouses[i].user_id == userId) {
              this.loginUserCoordinates.push([lng, lat]);
            } 
          this.coordinates.push([lng, lat]);
        }
        console.log('Warehouses:', this.coordinates);
        console.log('User login Warehouses:', this.loginUserCoordinates);
        this.startMap();
      },
      error: (error) => {
        this.loading = false;
        this.changueScreen = false;
        console.error('Error fetching warehouses:', error);
      }
    });
  }
  
}
