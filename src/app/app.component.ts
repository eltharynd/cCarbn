import { Component, OnInit } from '@angular/core'
import { StatusService } from './shared/status.service'

@Component({
  selector: 'app-root',
  template: '<div id="outlet"><router-outlet></router-outlet></div>'
})
export class AppComponent implements OnInit {
  title = 'elthabot'
  status = 'DOWN'

  constructor(private statusService: StatusService) {}

  ngOnInit() {
    /* this.statusService
      .getStatus()
      .then((result: any) => {
        this.status = result.status
      }) */
  }

}
