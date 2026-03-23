import { Component, Input, ViewChild } from '@angular/core';
import { MapInfoWindow } from '@angular/google-maps';
import { MapMarkerModel } from 'src/app/_models/utils';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss'],
})
export class MapViewComponent {
  @Input() markerPositions: MapMarkerModel[] = [];

  display: any;
  center: google.maps.LatLngLiteral = { lat: 11.0168, lng: 76.9558 };
  zoom = 9;

  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow | undefined;
  markerOptions: google.maps.MarkerOptions = {
    draggable: false,
    animation: google.maps.Animation.DROP,
  };
  openInfoWindow(infoWindow: any | undefined) {
    if (infoWindow) {
      infoWindow.open();
    } else {
      // Fallback: Create a programmatic instance of InfoWindow
      const customInfoWindow = new google.maps.InfoWindow({
        content: `
          <div class="custom-marker-info">
            <h3> qq </h3>
            <p>wqww</p>
          </div>
        `,
        position: { lat: 37.7749, lng: -122.4194 },
      });
      customInfoWindow.open();
    }
  }
  ngOnChanges() {
    if (this.markerPositions && this.markerPositions.length > 0) {
      this.center = this.markerPositions[0];
      this.zoom = 7;
    }
  }
  moveMap(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.center = event.latLng.toJSON();
  }
  move(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.display = event.latLng.toJSON();
  }
}

// just an interface for type safety.
interface marker {
  lat: number;
  lng: number;
  label?: string;
  draggable: boolean;
}
