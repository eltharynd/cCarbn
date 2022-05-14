import { Component, OnInit } from '@angular/core'
import { ClipboardService } from 'ngx-clipboard'
import { AuthGuard } from 'src/app/auth/auth.guard'
import { SettingsService } from 'src/app/shared/settings.service'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-global',
  templateUrl: './global.component.html',
  styleUrls: ['./global.component.scss'],
})
export class GlobalComponent implements OnInit {
  showBrowserSource = false

  constructor(public clipboardApi: ClipboardService, private auth: AuthGuard, public settings: SettingsService) {}

  ngOnInit(): void {}

  copied
  copy() {
    this.clipboardApi.copyFromContent(this.settings.viewport.url)
    this.copied = 'Browser Source URL copied!'
  }
}
