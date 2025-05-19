import { Directive, ElementRef, Renderer2, HostListener, inject } from '@angular/core';

@Directive({
  selector: '[appReszletekDirective]',
  standalone: true
})
export class ReszletekDirectiveDirective {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  constructor() {
    // Alap stílusok
    this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', 'white');  
    this.renderer.setStyle(this.el.nativeElement, 'color', '#333');
        }

  @HostListener('mouseenter')
  onMouseEnter() {
    this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', '#E0EBF6');
    this.renderer.setStyle(this.el.nativeElement, 'color', '#333');
    this.renderer.setStyle(this.el.nativeElement, 'boxShadow', '0 6px 12px rgba(0,0,0,0.2)');
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'scale(1.1)');
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', '#FFFFFF'); 
    this.renderer.setStyle(this.el.nativeElement, 'color', '#333');
    this.renderer.setStyle(this.el.nativeElement, 'boxShadow', '0 4px 6px rgba(0,0,0,0.1)');
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'scale(1)');

  }

  @HostListener('mousedown')
  onMouseDown() {
  this.renderer.setStyle(this.el.nativeElement, 'transform', 'scale(1.05)');
  }

  @HostListener('mouseup')
  onMouseUp() {
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'scale(1)');
  }
}
