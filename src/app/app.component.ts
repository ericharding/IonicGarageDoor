import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';

import * as mqtt from 'mqtt';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';

export interface Door { 
  name: string
  isOpen : Observable<boolean>
  isOnline : Observable<boolean>
  toggle : () => void;
}

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;

  doors: Observable<Door[]>

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen) {
    this.initializeApp();
    this.doors = Observable.of([
      { name: "Eric's Door", isOpen: Observable.of(true), isOnline: Observable.of(true), toggle: () => console.log("closed Eric's door") },
      { name: "Jim's Door", isOpen: Observable.of(false), isOnline: Observable.of(true), toggle: () => console.log("closed Jim's door") },
      { name: "Zander's Door", isOpen: Observable.of(false), isOnline: Observable.of(false), toggle: () => console.log('closed Zander\'s door') },
    ]);

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  selectDoor(door) {
    // this.nav.push(HomePage, { door: door });
    this.nav.setRoot(HomePage, { door: door });
  }
}
