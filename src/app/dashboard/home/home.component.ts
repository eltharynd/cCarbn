import { Component, OnInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme'
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

  constructor(private sidebarService: NbSidebarService) {}

  ngOnInit() {
    setTimeout(() => {
      this.sidebarService.expand()
    }, 1000);
  }
}