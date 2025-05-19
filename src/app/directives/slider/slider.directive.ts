import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[appSimpleSlider]',
  standalone: true
})
export class SimpleSliderDirective implements OnInit, OnDestroy {
  private container: HTMLElement;
  private index = 0;
  private intervalId: any;

  constructor(private el: ElementRef) {
    this.container = this.el.nativeElement;
  }

  ngOnInit(): void {
    this.startSlider();
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  startSlider(): void {
    const slides = this.container.children;
    const totalSlides = slides.length;

    this.intervalId = setInterval(() => {
      this.index = (this.index + 1) % totalSlides;
      const offset = -this.index * 100;

      this.container.style.transition = 'transform 0.5s ease-in-out';
      this.container.style.transform = `translateX(${offset}%)`;
    }, 4000); 
  }
}
