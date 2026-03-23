import { Component, Input } from '@angular/core';
import moment from 'moment';
import { interval } from 'rxjs';

@Component({
  selector: 'app-current-user-time',
  templateUrl: './current-user-time.component.html',
  styleUrls: ['./current-user-time.component.scss'],
})
export class CurrentUserTimeComponent {
  @Input() memberID: string = '';
  currentTime: string = moment(new Date()).format('DD-MM-yyyy, h:mm:ss A');

  ngOnInit() {
    interval(1000).subscribe(() => {
      this.currentTime = moment(new Date()).format('DD-MM-yyyy, h:mm:ss A');
    });
  }
}
