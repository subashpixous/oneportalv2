import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-icon-button',
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.scss'],
})
export class IconButtonComponent {
  @Input() model!: IconButtonModel;
  @Output() iconbtnClicked = new EventEmitter<IconButtonModel>();

  clicked() {
    this.iconbtnClicked.emit(this.model);
  }
}

export interface IconButtonModel {
  buttonName: string;
  iconImageName: string;
  canClick?: boolean;
  id: string;
  tooltip?: string;
  buttonTextName?: string;
}
