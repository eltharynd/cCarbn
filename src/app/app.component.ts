import { Component, } from '@angular/core'
import { DataService } from './shared/data.service'

@Component({
  selector: 'app-root',
  template: '<div id="outlet"><router-outlet></router-outlet></div>'
})
export class AppComponent {
  title = 'elthabot'

  constructor(private data: DataService) {}

}
