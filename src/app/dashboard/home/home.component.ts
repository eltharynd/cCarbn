import { Component, OnInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme'
import { DeviceDetectorService } from 'ngx-device-detector'
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

  constructor(private sidebarService: NbSidebarService, private devide: DeviceDetectorService) {}

  ngOnInit() {
    if(this.devide.isDesktop())
      setTimeout(() => {
        this.sidebarService.expand()
      }, 500);
  }
}