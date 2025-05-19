import { Directive, ElementRef, Renderer2, HostListener, inject } from '@angular/core';

@Directive({
  selector: '[appFoglalasDirective]',
  standalone: true
})
export class FoglalasDirectiveDirective {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  constructor() {
    this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', '#385E3C');  
    this.renderer.setStyle(this.el.nativeElement, 'color', 'white');
    this.renderer.setStyle(this.el.nativeElement, 'border', 'none');
    this.renderer.setStyle(this.el.nativeElement, 'padding', '10px 20px');
    this.renderer.setStyle(this.el.nativeElement, 'fontWeight', 'bold');
    this.renderer.setStyle(this.el.nativeElement, 'borderRadius', '8px');
    this.renderer.setStyle(this.el.nativeElement, 'cursor', 'pointer');
    this.renderer.setStyle(this.el.nativeElement, 'boxShadow', '0 4px 6px rgba(0,0,0,0.1)');
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'background-color 0.3s, box-shadow 0.3s, transform 0.2s');
    }

  @HostListener('mouseenter')
  onMouseEnter() {
    this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', '#FFD700');
    this.renderer.setStyle(this.el.nativeElement, 'color', '#000000');
    this.renderer.setStyle(this.el.nativeElement, 'boxShadow', '0 6px 12px rgba(0,0,0,0.2)');
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', '#385E3C'); 
    this.renderer.setStyle(this.el.nativeElement, 'color', '#FFFFFF');
    this.renderer.setStyle(this.el.nativeElement, 'boxShadow', '0 4px 6px rgba(0,0,0,0.1)');
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
