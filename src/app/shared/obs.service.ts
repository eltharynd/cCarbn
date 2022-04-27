import { Injectable } from '@angular/core';
import { filter, from, map, Subject, take, toArray } from 'rxjs'
import OBSWebSocket, { OBSRequestTypes, OBSEventTypes, EventSubscription } from 'obs-websocket-js';
import { DataService } from './data.service'
import { throws } from 'assert'

@Injectable({
  providedIn: 'root'
})
export class OBSService {

  private obsstudio
  private OBS

  currentScene: string 
  scenes: any[] = []
  sources: any[] = []

  events: Subject<any> = new Subject()

  constructor(private data: DataService) { 
    //@ts-ignore
    if(window?.obsstudio) {
      //@ts-ignore
      this.obsstudio = window.obsstudio
      this.OBS = new OBSWebSocket()
      this.OBS.connect('ws://127.0.0.1:4455', undefined, EventSubscription.All).then(conn => {

        this.getItems().then(() => {
          this.data.socketIO.on('requestOBSlist', (data) => {
            if(data.userId)
              this.data.send('sendOBSlist', {
                userId: data.userId,
                response: {
                  currentScene: this.currentScene,
                  scenes: this.scenes,
                  sources: this.sources
                }
              })
          })
        })

        this.OBS.on('ConnectionOpened ', (event) => {
          this.getItems()
        })
        this.OBS.on('SceneCreated', (event) => {
          this.getItems()
        })
        this.OBS.on('SceneRemoved', (event) => {
          this.getItems()
        })
        this.OBS.on('SceneNameChanged', (event) => {
          this.getItems()
        })
        this.OBS.on('CurrentProgramSceneChanged', (event) => {
          this.getItems()
        })
        this.OBS.on('SceneListChanged', (event) => {
          this.getItems()
        })
        this.OBS.on('SceneItemCreated', (event) => {
          this.getItems()
        })
        this.OBS.on('SceneItemRemoved', (event) => {
          this.getItems()
        })
        this.OBS.on('InputCreated', (event) => {
          this.getItems()
        })
        this.OBS.on('InputRemoved', (event) => {
          this.getItems()
        })
        this.OBS.on('InputNameChanged', (event) => {
          this.getItems()
        })
        this.OBS.on('SourceFilterCreated', (event) => {
          this.getItems()
        })
        this.OBS.on('SourceFilterRemoved', (event) => {
          this.getItems()
        })
        this.OBS.on('SourceFilterNameChanged', (event) => {
          this.getItems()
        })
      })
    }

    this.data.socketIO.on('receiveOBSlist', (data) => {
      this.currentScene = data.currentScene
      this.scenes = data.scenes
      this.sources = data.sources
      console.log(this.scenes)
      console.log(this.sources)
    })
  }

  private async getItems() {

    let response = await this.OBS.call('GetSceneList')
    if(response) {
      this.currentScene = response.currentProgramSceneName
      this.scenes = response.scenes
      for(let s of this.scenes) {
        let sources =  await this.OBS.call('GetSceneItemList', {
          sceneName: s.sceneName
        })
        s.sources = sources.sceneItems

        /* for(let source of s.sources) {
          if(source.isGroup) {
            let inner = await this.OBS.call('GetGroupItemList', {
              sceneName: source.sourceName
            })
            source.items = inner.sceneItems
          }
        } */
      }
    }
  
    response = await this.OBS.call('GetInputList')
    if(response) {
      this.sources = response.inputs
      let groups = await this.OBS.call('GetGroupList')
      if(groups) {
        for(let g of groups.groups) {
          this.sources.push({
            inputKind: 'group', inputName: g
          })
        }  
      }
      this.sources.sort((a, b) => {
        if(a.inputName.toLowerCase() < b.inputName.toLowerCase())
          return -1
        else if (a.inputName.toLowerCase() > b.inputName.toLowerCase())
          return 1
        else return 0
      })

      for(let s of this.sources) {
        let response = await this.OBS.call('GetSourceFilterList', {
          sourceName: s.inputName
        })
        s.filters = response.filters
      }
    }

    if(this.data._userId) {
      this.data.send('sendOBSlist', {
        userId: this.data._userId,
        response: {
          currentScene: this.currentScene,
          scenes: this.scenes,
          sources: this.sources
        }
      })
    }
   
  }

  async toggleSource(visibile: boolean, scene: string, source: string) {

    let response = await this.OBS.call('GetSceneItemId', {
      sceneName : scene,
      sourceName: source
    })

    if(response)
      await this.OBS.call('SetSceneItemEnabled', {
        sceneName: scene,
        sceneItemId: response.sceneItemId,
        sceneItemEnabled: visibile
      })
  }

  async toggleFilter(visible: boolean, source: string, filter: string) {
    await this.OBS.call('SetSourceFilterEnabled', {
      sourceName: source,
      filterName: filter,
      filterEnabled: visible
    })

  }

}
