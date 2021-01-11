import { Component, ViewChild } from '@angular/core';
import {MapComponent} from './components/map/map.component'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'quadrat2';
  @ViewChild(MapComponent, {static: false}) map: MapComponent;

  image = null;
  aoiDrawingMode = false;
  aoiType = 'Circle';
  featureDrawingMode = false;
  pct = '';
  // featureType = 'Circle';

  onSelectFile(event) {
    if (event.target.files && event.target.files[0]) {
      let reader = new FileReader();
      let _this = this;

      reader.readAsDataURL(event.target.files[0]); // read file as data url
      reader.onload = function (event) {
        // called once readAsDataURL is completed
        // @ts-ignore
        let dataUrl = event.target.result;
        
        let image = new Image();
        // @ts-ignore
        image.src = reader.result;
    
        image.onload = function() {
            _this.image = {
              url: dataUrl,
              image: image,
              height: image.height,
              width: image.width
            } 
        };
      }
    }

  }

  toggleAoi() {
    this.aoiDrawingMode = !this.aoiDrawingMode;
  }

  toggleFeature() {
    this.featureDrawingMode = !this.featureDrawingMode;
  }

  clearAoi() {
    this.map.clearAoi()
    this.pct = '';
  }
  clearFeature() {
    this.map.clearFeatures()
    this.pct = '';
  }

  calculate () {
    this.pct = this.map.calculateAreas().pct.toFixed(5);
  }
}
