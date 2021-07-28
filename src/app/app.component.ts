import { Component, OnInit } from '@angular/core'
import { StatusService } from './shared/status.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'elthabot'
  status = 'DOWN'

  constructor(private statusService: StatusService) {}

  ngOnInit() {
    this.statusService
      .getStatus()
      .then((result: any) => {
        this.status = result.status
      })
  }

}
