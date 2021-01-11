import { AfterViewInit, Component, Input, OnChanges, OnInit } from '@angular/core';
import 'ol/ol.css';
import ImageLayer from 'ol/layer/Image';
import Map from 'ol/Map';
import Projection from 'ol/proj/Projection';
import Static from 'ol/source/ImageStatic';
import View from 'ol/View';
import {getCenter} from 'ol/extent';

import {Vector as VectorSource} from 'ol/source';
import {Vector as VectorLayer} from 'ol/layer';
import Draw from 'ol/interaction/Draw';
import { MainService } from 'src/app/services/main.service';

import {Fill, Stroke, Style} from 'ol/style';

var aoiStyle = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.1)',
  }),
  stroke: new Stroke({
    color: '#319FD3',
    width: 2
  })
});

var featureStyle = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.5)',
  }),
  stroke: new Stroke({
    color: '#ff0000',
    width: 2
  })
});


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit, OnChanges{
  @Input() image = null;
  @Input() aoiType = 'Circle';
  @Input() aoiDrawingMode = false;
  @Input() featureDrawingMode = false;

  map = null;
  imageLayer = null;
  extent = null;
  projection = null;

  aoiSource = new VectorSource({wrapX: false});
  
  aoiLayer = new VectorLayer({
    source: this.aoiSource,
    style:aoiStyle
  });

  featureSource = new VectorSource({wrapX: false});
  
  featureLayer = new VectorLayer({
    source: this.featureSource,
    style: featureStyle
  });

  aoiDraw = null;
  featureDraw = null;

  initalZoom = 1.5;
  

  constructor(main: MainService) { }
  ngOnInit() {
    // Map views always need a projection.  Here we just want to map image
    // coordinates directly to map coordinates, so we create a projection that uses
    // the image extent in pixels.
    this.extent = [0, 0, 3200, 2400];
    this.projection = new Projection({
      code: 'image',
      units: 'pixels',
      extent: this.extent,
    });
    this.imageLayer = new ImageLayer({
      source: new Static({
        url: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Moss_Gametophytes_Sporophytes.JPG',
        projection: this.projection,
        imageExtent: this.extent,
      }),
    }) 
    this.map = new Map({
      layers: [ 
        this.imageLayer, this.aoiLayer, this.featureLayer
      ],
      view: new View({
        projection: this.projection,
        center: getCenter(this.extent),
        zoom: this.initalZoom,
        maxZoom: 8,
      }),
    });
  }
  ngAfterViewInit(){
    this.map.setTarget('map')
  }
  drawAoi () {
    if (!this.map) return;
    if (this.aoiDraw) {
      this.map.removeInteraction(this.aoiDraw);
    }
    this.aoiDraw = new Draw({
      source: this.aoiSource,
      type: this.aoiType,
    });
    if (this.aoiDrawingMode) {
      this.map.addInteraction(this.aoiDraw);
    } else {
      this.map.removeInteraction(this.aoiDraw);
    }
  }

  clearAoi () { this.aoiSource.clear(); }
  clearFeatures () { this.featureSource.clear(); }
 
  drawFeatures () {
    if (!this.map) return;
    if (this.featureDraw) {
      this.map.removeInteraction(this.featureDraw);
    }
    this.featureDraw = new Draw({
      source: this.featureSource,
      type: 'Polygon',
      freehand: true
    });
    if (this.featureDrawingMode) {
      this.map.addInteraction(this.featureDraw);
    } else {
      this.map.removeInteraction(this.featureDraw);
    }
  }


  calculateAreas () {
    var aoiArea = this.aoiSource.getFeatures()
      .map(x => {
        let geom = x.getGeometry()
        if (geom.getType() === 'Circle') {
          return Math.PI * (geom.getRadius()) **  2
        }
        return geom.getArea();
      })
      .reduce((a,b) => a + b, 0)
    var featureArea = this.featureSource.getFeatures()
      .map(x => {
        return x.getGeometry().getArea()
      })
      .reduce((a,b) => a + b, 0)

    return {
      aoiArea,
      featureArea,
      pct: featureArea / aoiArea
    }
  }

  ngOnChanges(changes) {
    if (changes.image && this.image){
      console.log('changes', this.image)
      let scaleFactor = 1;
      this.extent = [0, 0, this.image.width,this.image.height].map(x => x*scaleFactor)
      this.projection = new Projection({
        code: 'image',
        units: 'pixels',
        extent: this.extent,
      });
      this.imageLayer = new ImageLayer({
        source: new Static({
          url: this.image.url,
          projection: this.projection,
          imageExtent: this.extent,
        }),
      })
      this.map.setView(new View({
        projection: this.projection,
        center: getCenter(this.extent),
        zoom: this.initalZoom,
        maxZoom: 8,
      }))

      this.map.getLayers().setAt(0, this.imageLayer);
    }

    if (changes.aoiDrawingMode) {
      this.drawAoi()
    }
    if (changes.featureDrawingMode) {
      this.drawFeatures()
    }
    if (changes.aoiType) {
      this.drawAoi()
    }
  }

}
