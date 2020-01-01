// This component is a slider that returns a value between 0 and 1
import { Component, Input, Output, AfterViewChecked, EventEmitter } from '@angular/core';


declare var MIDIjs: any;

@Component({
  selector: 'slider-soret',
  templateUrl: './slider.component.html',
  styles: ['.draggable {cursor: move; }']
})
export class SliderComponent implements AfterViewChecked {
  @Input() sliderId: string;
  @Input() boxHeight: string;
  @Input() barHeight: string; // The thickness of the slide bar
  @Input() radius: string; // the radious of the circle that slides
  @Input() enabled: boolean;
  @Input() initialValue: string;
  @Output() valueChange: EventEmitter<number> = new EventEmitter<number>();
  mouseDown = false;
  isPlaying = false;
  circleId: string;
  currentValue: number;
  initialized = false;
  xCoordOfLeftBorder: number;

  constructor() {
  }

  // Need to initialize at this late stage, because the svg control must exist
  ngAfterViewChecked() {
    if (!this.initialized) {
      const boxHeight = parseInt(this.boxHeight, 10);
      const barHeight = parseInt(this.barHeight, 10);
      const box = document.getElementById(this.sliderId);
      box.setAttributeNS(null, 'height', this.boxHeight.toString());
      this.xCoordOfLeftBorder = this.getAbsXofElement(box);
      this.circleId = this.sliderId + 'circle';
      const circle = document.getElementById(this.circleId);
      circle.setAttributeNS(null, 'cx', this.radius.toString());
      circle.setAttributeNS(null, 'cy', (boxHeight / 2).toString());
      circle.setAttributeNS(null, 'r', this.radius.toString());
      const rectangleId = this.sliderId + 'rectangle';
      const rectangle = document.getElementById(rectangleId);
      rectangle.setAttributeNS(null, 'height', this.barHeight.toString());
      rectangle.setAttributeNS(null, 'y', ((boxHeight - barHeight) / 2).toString());
      if (this.initialValue && this.initialValue !== '0') {
        const value = parseFloat(this.initialValue);
        this.moveCircle(this.calculateXcoord(value));
      }
      this.initialized = true;
    }
  }

  public MouseDown(evt: MouseEvent) {
    this.mouseDown = true;
  }

  public MoveControl(event: MouseEvent) {
    if (this.mouseDown && this.enabled) {
      this.moveCircle(event.clientX - this.xCoordOfLeftBorder);
    }
  }

  public MouseUp() {
    this.mouseDown = false;
    if (this.enabled) {
      this.valueChange.next(this.currentValue);
    }
  }
  // the value of x received from the event is measured from the border of the screen
  // need to substract the x coordinate of the left side of the slider
  public barClicked(event: any) {
    if (this.enabled) {
      this.moveCircle(event.clientX - this.xCoordOfLeftBorder);
      this.valueChange.next(this.currentValue);
    }
  }

  // an external caller can use this method to position the slider at any arbitrary place
  public setValue(value: number) {
    this.moveCircle(this.calculateXcoord(value));
  }
  // value is the value between 0 and 1 that the position of the slider represents
  // returns the x distance in pixels from the left of the slider
  private calculateXcoord(value: number) {
    const radius = parseInt(this.radius, 10);
    const maxValue = this.getMaxValue();
    return (value * maxValue) + radius;
  }

  // x is the distance in pixels from the left of the slider
  // positions the center of the circle a distance of x from the left border
  private moveCircle(x: number) {
    const radius = parseInt(this.radius, 10);
    const maxValue = this.getMaxValue();
    const circle = document.getElementById(this.circleId);
    if (x < radius) {
      x = radius;
    }
    if (x > maxValue + radius) {
      x = maxValue + radius;
    }
    this.currentValue = (x - radius) / maxValue;
    circle.setAttributeNS(null, 'cx', x.toString());
  }

  private getMaxValue(): number {
    const radius = parseInt(this.radius, 10);
    const box = document.getElementById(this.sliderId);
    return box.clientWidth - (2 * radius);
  }
  private getAbsXofElement(element: any) {
    const boundingRect: any = element.getBoundingClientRect();
    return boundingRect.left;
  }
}
