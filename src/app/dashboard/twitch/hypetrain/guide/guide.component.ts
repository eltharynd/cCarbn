import { Component, OnInit } from '@angular/core'
import { NbWindowRef } from '@nebular/theme'

@Component({
  selector: 'app-guide',
  template: '<img src="assets/guide/hypetrain.png">',
})
export class GuideComponent implements OnInit {
  constructor(protected windowRef: NbWindowRef) {}

  ngOnInit(): void {}

  minimize() {
    this.windowRef.minimize()
  }

  close() {
    this.windowRef.close()
  }
}
