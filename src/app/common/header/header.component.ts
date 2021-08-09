import { Component, OnDestroy, OnInit } from "@angular/core"
import { Router } from "@angular/router"
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService } from "@nebular/theme"
import { Subject } from "rxjs"
import { filter, map, takeUntil } from "rxjs/operators"
import { AuthGuard } from "src/app/auth/auth.guard"


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  userMenu = [ { title: 'Profile'}, { title: 'Log out', } ];

  constructor(private router: Router, private sidebarService: NbSidebarService, private themeService: NbThemeService, private menuService: NbMenuService, public auth: AuthGuard, private breakpointService: NbMediaBreakpointsService) { }
  
  ngOnInit() {

    const { xl } = this.breakpointService.getBreakpointsMap()

    this.themeService.onMediaQueryChange().pipe(
      map(([, currentbreakPoint]) => currentbreakPoint.width < xl ),
      takeUntil(this.destroy$),
    ).subscribe((isLessThanXl: boolean) => { this.userPictureOnly = isLessThanXl })

    this.menuService.onItemClick().pipe(
      filter(({ tag }) => tag === 'user-context-menu'),
      map(({ item: { title } }) => title),
    ).subscribe(title => this.auth.logout())

  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  navigateHome(): boolean {
    this.router.navigate(['/dashboard'])
    return false
  }

  toggleSidebar(): boolean {
    console.log('toggle')
    this.sidebarService.toggle()
    return false
  }
}