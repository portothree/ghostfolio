import {
  ChangeDetectorRef,
  Component,
  HostBinding,
  OnDestroy,
  OnInit
} from '@angular/core';
import { DataService } from '@ghostfolio/client/services/data.service';
import { UserService } from '@ghostfolio/client/services/user/user.service';
import { TabConfiguration, User } from '@ghostfolio/common/interfaces';
import { hasPermission, permissions } from '@ghostfolio/common/permissions';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'gf-about-page',
  styleUrls: ['./about-page.scss'],
  templateUrl: './about-page.html'
})
export class AboutPageComponent implements OnDestroy, OnInit {
  @HostBinding('class.with-info-message') get getHasMessage() {
    return this.hasMessage;
  }

  public hasMessage: boolean;
  public hasPermissionForSubscription: boolean;
  public tabs: TabConfiguration[] = [];
  public user: User;

  private unsubscribeSubject = new Subject<void>();

  public constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private dataService: DataService,
    private userService: UserService
  ) {
    const { globalPermissions, systemMessage } = this.dataService.fetchInfo();

    this.hasPermissionForSubscription = hasPermission(
      globalPermissions,
      permissions.enableSubscription
    );

    this.userService.stateChanged
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe((state) => {
        this.tabs = [
          {
            iconName: 'reader-outline',
            label: $localize`About`,
            path: ['/' + $localize`about`]
          },
          {
            iconName: 'sparkles-outline',
            label: $localize`Changelog`,
            path: ['/' + $localize`about`, 'changelog']
          },
          {
            iconName: 'ribbon-outline',
            label: $localize`License`,
            path: ['/' + $localize`about`, $localize`license`]
          }
        ];

        if (state?.user) {
          this.tabs.push({
            iconName: 'shield-checkmark-outline',
            label: $localize`Privacy Policy`,
            path: ['/' + $localize`about`, $localize`privacy-policy`],
            showCondition: this.hasPermissionForSubscription
          });
          this.user = state.user;

          this.hasMessage =
            hasPermission(
              this.user?.permissions,
              permissions.createUserAccount
            ) || !!systemMessage;

          this.changeDetectorRef.markForCheck();
        }

        this.tabs.push({
          iconName: 'happy-outline',
          label: 'OSS Friends',
          path: ['/' + $localize`about`, 'oss-friends']
        });
      });
  }

  public ngOnInit() {}

  public ngOnDestroy() {
    this.unsubscribeSubject.next();
    this.unsubscribeSubject.complete();
  }
}
