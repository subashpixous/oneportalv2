import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  ApplicationCountCard,
  ApplicationCountMap,
  ApplicationCountModel,
  DashboardApplicationCountModel,
} from 'src/app/_models/DashboardModel';
import { ActionModel, Actions, Column } from 'src/app/_models/datatableModel';
import { NavigationModel } from 'src/app/_models/filterRequest';
import { ApplicationMainGridModel } from 'src/app/_models/schemeModel';
import { TCModel } from 'src/app/_models/user/usermodel';
import { MapMarkerModel } from 'src/app/_models/utils';
import { GeneralService } from 'src/app/services/general.service';
import { SchemeService } from 'src/app/services/scheme.Service';
import { UserService } from 'src/app/services/user.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { content } from 'html2canvas/dist/types/css/property-descriptors/content';
import { CommonViewModule } from "src/app/shared/common/common.module";
@Component({
  selector: 'app-id-card-status',
  templateUrl: './id-card-status.component.html',
  styleUrls: ['./id-card-status.component.scss'],

})

export class IdCardStatusComponent {
 
  markerPositions!: MapMarkerModel[];
  counts: DashboardApplicationCountModel[] = [];
  title: string = 'Card Dashboard';
 

selectedDistrictId: string = ''; // Bound to dropdown
cardReports: CardReportModel[] = [];
districts: { label: string, value: string }[] = [];
statusBars: any[] = [];
  isMimimized: boolean = true;

defaultMapCenter = { lat: 13.0827, lng: 80.2707, label: 'Tamil Nadu' ,content: ' ' }; // Default center (Tamil Nadu coordinates)    

  constructor(
    private router: Router,
    private userService: UserService,
    private generalService: GeneralService
  ) {}
  ngOnInit() {
  
     this.generalService.getDistrictWiseCards().subscribe((res:any) => {
    this.cardReports = res.data;

    // Prepare district dropdown options
    this.districts = this.cardReports.map((x:any) => ({ label: x.district, value: x.district_Id }));

    // Initial total counts and markers
    this.updateStatusBars();
    this.updateMarkerPositions();
});
    
    // Initial total counts for all districts


  }
updateStatusBars() {
    let filteredData = this.selectedDistrictId
        ? this.cardReports.filter(x => x.district_Id === this.selectedDistrictId)
        : this.cardReports;

    const totalIssued = filteredData.reduce((sum, x) => sum + x.cardIssued, 0);
    const totalToBeIssued = filteredData.reduce((sum, x) => sum + x.cardtobeIssued, 0);
    const totalRejected = filteredData.reduce((sum, x) => sum + x.cardRejected, 0);
    const totalAll = filteredData.reduce((sum, x) => sum + x.total, 0);

    this.statusBars = [
        { status: 'Card Issued', count: totalIssued, percentage: this.calculatePercentage(totalIssued, totalAll) },
        { status: 'Card to be Issued', count: totalToBeIssued, percentage: this.calculatePercentage(totalToBeIssued, totalAll) },
        { status: 'Card Rejected', count: totalRejected, percentage: this.calculatePercentage(totalRejected, totalAll) },
        { status: 'Total', count: totalAll, percentage: 100 }
    ];
}
  getStyleClass() {
    if (this.isMimimized) {
      return 'lg:col-5 md:col-5';
    } else {
      return 'lg:col-5 md:col-5 d-none';
    }
  }
// Update map markers
updateMarkerPositions() {
    if (this.selectedDistrictId) {
        const filteredData = this.cardReports.filter(x => x.district_Id === this.selectedDistrictId);
        this.markerPositions = filteredData.map(x => ({
            lat: x.latitude,
            lng: x.longitude,
            label: x.total.toString(),
            content: '' // or provide any other relevant string content
        }));
    } else {
        // No district selected → show all markers + default center marker
        this.markerPositions = [
            ...this.cardReports.map(x => ({
                lat: x.latitude,
                lng: x.longitude,
                label: x.total.toString(),
                content: ''// or provide any other relevant string content
            })),
           
        ];
    }
}

// Calculate percentages
calculatePercentage(count: number, total: number): number {
    return total > 0 ? (count / total) * 100 : 0;
}






}

export interface CardReportModel {
    district: string;            // District name
    district_Id: string;         // District unique ID
    latitude: number;            // Latitude for map marker
    longitude: number;           // Longitude for map marker
    cardIssued: number;          // Count of issued cards
    cardtobeIssued: number;      // Count of cards to be issued
    cardRejected: number;        // Count of rejected cards
    total: number;               // Total count (issued + to be issued + rejected)
}