import { Component } from '@angular/core';
import { NavController, NavParams, MenuController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { Geolocation } from '@ionic-native/geolocation';
import { Door } from '../../app/app.component';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  activeDoor : Door
  hasDoor : boolean
  isOnline: Observable<boolean>
  isOpen : Observable<boolean>
  isOpenText : Observable<string>

  constructor(public navCtrl: NavController, public navParam : NavParams, public menu : MenuController) {
    this.activeDoor = navParam.get('door');
    this.hasDoor = this.activeDoor != null;

    if (this.hasDoor) {
      this.isOpen = this.activeDoor.isOpen;
      this.isOpenText = this.isOpen.map(b => b ? "OPEN" : "CLOSED");
      this.isOnline = this.activeDoor.isOnline;
    }
    else {
      this.menu.open();
    }
  }

  toggle_door() {
    if (this.activeDoor) {
      this.activeDoor.toggle();
    }
  }
}
