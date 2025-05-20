import { Component } from '@angular/core';
import { LeafletMapComponent } from "../../component/leaflet-map/leaflet-map.component";

@Component({
  selector: 'app-data-map',
  imports: [LeafletMapComponent],
  templateUrl: './data-map.component.html',
  styleUrl: './data-map.component.css'
})
export class DataMapComponent {

}
