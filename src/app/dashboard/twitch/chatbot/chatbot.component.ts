import { Component } from '@angular/core';
import { AuthGuard } from 'src/app/auth/auth.guard'
import { DataService } from 'src/app/shared/data.service'
import { ListenersService } from 'src/app/shared/listeners.service'
import { environment } from 'src/environments/environment'
@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent {

  url = environment?.production ? 'https://cCarbn.io/' : 'http://localhost:4200/'
  object = Object

  _storeable = {
    commands: [
      {
        usage: '!cmd add <command> <answer>',
        description: 'Adds a <command> that returns and <answer>'
      },
      {
        usage: '!cmd edit <command> <answer>',
        description: 'Replaces a <command>\'s answer with the new <answer>'
      },
      {
        usage: '!cmd delete <command>',
        description: 'Deletes the <command>'
      },
      {
        usage: '!cmd show <command>',
        description: 'Shows the answer for the <command>'
      },
      {
        usage: '!cmd source <command>',
        description: 'Shows the source of the <command>'
      },
      {
        usage: '!cmd args <command> ',
        description: 'Shows arguments required by the command'
      },
      {
        usage: '!cmd list',
        description: 'Shows all stored commands'
      },
      {
        usage: '!cmd flush',
        description: 'Deletes all stored commands'
      }
    ],
    keywords: [
      {
        key: '@user',
        effect: `Replaces this with the user sending the command.`
      },
      {
        key: '@<any word>',
        effect: `Replaces this with an argument sent with the command.
                  This works with @ followed by <any word> (except for user).
                  You will see that same word as the name of the parameter.`
      },
      {
        key: '$rnd<123>',
        effect: `Replaces with a random integer number from 0 to the specified number <123>.`
      }
    ],
    options: [
      {
        key: '--cd=<123>',
        description: 'Sets cooldown for <123> seconds. (default none)'
      },
      {
        key: '--cdpu',
        description: 'Sets cooldown on a per user basis. (default global)'
      },
      {
        key: '--mods',
        description: 'Only mods are allowed to execture this command. (default false)'
      },
      {
        key: '--streamer',
        description: 'Only the streamer is allowed to exceute this command. (default false)'
      },
    ]
  }

  _pokemon = {
    commands: [
      { command: `!evo <pokemon>`, description: `Displays the evolution line of the <pokemon>.`},
      { command: `!weak <pokemon>`, description: `Displays the <pokemon> types effectiveness.`},
      { command: `!move <move>`, description: `Displays the <move>'s details. `},
      { command: `!nature <nature>`, description: `Displays what stats are changed by <nature>.`},
      { command: `!ability <ability>`, description: `Displays the <ability>'s in-game description.`},
      { command: `!ability+ <ability>`, description: `Displays the <ability>'s effect details.`}
    ]
  }

  _common = {
    commands: [
      { command: `<any mention of ccarbn>`, description: `cCarbn answers the greeting`},
      { command: `F`, description: `cCarbn "F"s too`},
      { command: `^`, description: `cCarbn "^"s too`}
    ]
  }

  _self = {
    commands: [
      { command: `!hug <user>`, description: `Hugs the user`},
      { command: `!tuck <user>`, description: `Tucks the user`},
      { command: `!time <timezone or abbreviation>`, description: `Returns the time in that specific timezone (Europe/Bern, CET, EST, PST)`},
      { command: `!8ball <question>`, description: `Peers into the future to answer your question...`},
      { command: `!dadjokes`, description: `Attemps to tell a dad joke from a public API.`},
      { command: `!darkjoke`, description: `Attempts to tell a dark joke from a public API.\nWARNING: can be offensive!`},
    ]
  }

  constructor(public listeners: ListenersService, public data: DataService, public auth: AuthGuard) {}

}
