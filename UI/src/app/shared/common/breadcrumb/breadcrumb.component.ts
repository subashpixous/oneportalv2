import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { BreadcrumbModel } from 'src/app/_models/CommonModel';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
})
export class BreadcrumbComponent {
  @Input() breadcrumbs!: BreadcrumbModel[];
  constructor(private router: Router) {}
  ngOnInit() {}
  onBreadcrumClick(path: string) {
    this.router.navigate([path]);
  }
}
