import { Component, Input } from "@angular/core"
import { Subject } from "rxjs"
import { AuthGuard } from "src/app/auth/auth.guard"
import { SERVER_URL } from "src/app/shared/data.service"
import * as uuid from 'uuid'

@Component({
    selector: 'app-uploader',
    templateUrl: './upload.component.html',
    styleUrls: ['./upload.component.scss']
})
export class UploadComponent {

    @Input() width: string
    @Input() height: string

    @Input() name: string

    @Input() uploaded: Subject<any>
    @Input() url: string|null

    rnd = uuid.v4()
    busy
    success
    failure

    constructor(private auth: AuthGuard) { }

    async handleFileInput(eventTarget?: any) {
        if(!eventTarget.files )
        return
        let file = eventTarget.files[0]

        this.busy = true
        this.success = false
        this.failure = false

        let headers: any = new Headers();
        //headers.append('Accept', 'image/gif');
        headers.append('Content-Type', 'application/octet-stream');

        const formData: FormData = new FormData()
        let newName = file.name
        if(this.name) newName = /\..*$/.test(this.name) ? this.name : newName.replace(/^.*\./, this.name+'.')
        //formData.append(key, this.fields[key])
        formData.append('file', file, newName)
  
        let xhr = new XMLHttpRequest()
        
        xhr.open('POST', `${SERVER_URL}uploads/${this.auth.currentUser?._id}/${newName}`)
        xhr.setRequestHeader('Authorization', this.auth?.currentUser?.token ? `Basic ${this.auth.currentUser.token}` : '')
        let contentType
        xhr.onreadystatechange = () => {
            if(xhr.HEADERS_RECEIVED) contentType = xhr.getResponseHeader('Content-Type')
        }
        xhr.onload = () => {
            //if(/image\//.test(contentType!))
                this.url = `${SERVER_URL}${JSON.parse(xhr.response).url}`

            if(this.uploaded) this.uploaded.next(JSON.parse(xhr.response))
            this.success = true
            this.busy = false
        }
        xhr.onerror = (err) => {console.error(err); this.failure = true}
        xhr.send(formData)
    }
}