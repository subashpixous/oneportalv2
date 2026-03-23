import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MenuItem, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { GeneralService } from 'src/app/services/general.service';

@UntilDestroy()
@Component({
  selector: 'app-scheme-config-details',
  templateUrl: './scheme-config-details.component.html',
  styleUrls: ['./scheme-config-details.component.scss'],
})
export class SchemeConfigDetailsComponent {
  items: MenuItem[] | undefined;
  activeIndex: number = 0;
  title: string = 'Scheme Detail Configuration';
  schemeid!: string;
  routeSub!: Subscription;

  constructor(
    public messageService: MessageService,
    public generalService: GeneralService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  onActiveIndexChange(event: number) {
    this.activeIndex = event;
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }
  ngOnInit() {
    this.routeSub = this.route.params
      .pipe(untilDestroyed(this))
      .subscribe((params) => {
        this.schemeid = params['id']; //log the value of id
        this.generalService
          .getConfigurationDetailsInSelectListbyId({ configId: this.schemeid })
          .subscribe((x) => {
            if (x && x.data && x.data.length > 0) {
              this.title = `${this.title} (${x.data[0].text})`;
            }
          });
      });
    this.items = [
      {
        label: 'General',
        routerLink: 'general',
      },
      {
        label: 'Cost Config',
        routerLink: 'scheme-scholarship',
      },
    ];
  }
}
