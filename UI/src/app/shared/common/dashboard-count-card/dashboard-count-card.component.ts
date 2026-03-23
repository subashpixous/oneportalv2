import { Component, Input } from '@angular/core';
import { memberDetailCount } from 'src/app/_features/dashboard/dashboard.component';

@Component({
  selector: 'app-dashboard-count-card',
  templateUrl: './dashboard-count-card.component.html',
  styleUrls: ['./dashboard-count-card.component.scss'],
})
export class DashboardCountCardComponent {
  @Input() items: memberDetailCount[] | undefined = [];
  activeIndex: number | null = null;
  expandedIndex: number | null = null;
  expandedItem: memberDetailCount | null = null;
  ngOnInit() {
    this.expandFirstTwo();
  }
  expandFirstTwo(): void {
    if (!this.items || this.items.length === 0) return;

    // Expand first item
    if (this.items[0]) {
      this.items[0].expanded = true;
      this.expandedIndex = 0;
      this.expandedItem = this.items[0];
    }

    // Expand second item too, if needed
    if (this.items[1]) {
      this.items[1].expanded = true;
      // Optionally set the second as expandedItem too
      // But only if you allow multiple open
    }
  }
  ngOnChanges() {
    this.expandFirstTwo();
  }
  toggleExpand(index: number, item: memberDetailCount): void {
    this.collapseAll(this.items);
    if (this.expandedIndex === index) {
      this.expandedIndex = null;
      this.expandedItem = null;
    } else {
      this.expandedIndex = index;
      this.expandedItem = item;
      item.expanded = true;
    }
  }
  getColClass(length: number): string {
    // Bootstrap grid: 12 columns
    switch (length) {
      case 1:
        return 'col-12';
      case 2:
        return 'col-6';
      case 3:
        return 'col-4';
      case 4:
        return 'col-3';
      default:
        return 'col-3'; // Fallback for 6+
    }
  }
  collapseAll(items: memberDetailCount[] | undefined): void {
    if (!items) return;

    for (const item of items) {
      item.expanded = false;
      if (item.items && item.items.length > 0) {
        this.collapseAll(item.items); // recursively collapse
      }
    }
  }
}
