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
    @Input() autoIndexing: boolean = false
    @Input() displayTextOverride: string

    @Input() uploading: Subject<any>
    @Input() uploaded: Subject<any>
    @Input() url: string|null
    @Input() reference: any

    @Input() disabled: boolean = false

    @Input() maxSizeInMB: number = 10
    @Input() allowedTypes: string[]|null
    @Input() blockedTypes: string[]|null
    
    rnd = uuid.v4()
    busy
    success
    failure

    feedbackMessage: string|null


    constructor(private auth: AuthGuard) { }

    async handleFileInput(eventTarget?: any) {
        if(!eventTarget.files )
        return
        if(this.uploading) this.uploading.next(true)
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
  
        if(this.allowedTypes) {
            let allowed = false
            for(let type of this.allowedTypes) {
                if((new RegExp(type, 'gi')).test(file.type)) {
                    allowed = true
                    break
                }     
            }
            if(!allowed) {
                this.failure = true
                this.busy = false
                if(this.uploaded) this.uploaded.next(false)
                this.feedbackMessage = `File format not valid.\nAllowed file types: ${this.allowedTypes.join(', ')}`
                return
            }
        }

        if(this.blockedTypes) {
            let blocked = false
            for(let type of this.blockedTypes) {
                if((new RegExp(type, 'gi')).test(file.type)) {
                    blocked = true
                    break
                }     
            }
            if(blocked) {
                this.failure = true
                this.busy = false
                if(this.uploaded) this.uploaded.next(false)
                this.feedbackMessage = `File format not valid.\Blocked file types: ${this.blockedTypes.join(', ')}`
                return
            }
        }

        let sizeInMB = file.size / 1024 / 1204
        if(this.maxSizeInMB && sizeInMB>this.maxSizeInMB) {
            this.failure = true
            this.busy = false
            if(this.uploaded) this.uploaded.next(false)
            this.feedbackMessage = `File too heavy.\nMax ${this.maxSizeInMB} MB.`
            return
        }

        let xhr = new XMLHttpRequest()
        
        xhr.open('POST', `${SERVER_URL}uploads/${this.auth.currentUser?._id}/${newName}`)
        //@ts-ignore
        xhr.setRequestHeader('Authorization', this.auth?.currentUser?.token ? `Basic ${this.auth.currentUser.token}` : '')
        xhr.setRequestHeader('AutoIndexing', `${this.autoIndexing}`)
        let contentType
        xhr.onreadystatechange = () => {
            if(xhr.HEADERS_RECEIVED) contentType = xhr.getResponseHeader('Content-Type')
        }
        xhr.onload = () => {
            //if(/image\//.test(contentType!))
                this.url = `${SERVER_URL}${JSON.parse(xhr.response).url}`
            if(this.uploaded) {
                if(this.reference) {
                    this.uploaded.next({
                        reference: this.reference,
                        url: JSON.parse(xhr.response)
                    })
                } else
                    this.uploaded.next(JSON.parse(xhr.response))
            }
            this.success = true
            this.busy = false
        }
        xhr.onerror = (err) => {console.error(err); this.failure = true}
        xhr.send(formData)
    }
}