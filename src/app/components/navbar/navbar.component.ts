import { Component, OnInit, HostListener } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule, Router } from "@angular/router"
import { MatToolbarModule } from "@angular/material/toolbar"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatDividerModule } from "@angular/material/divider"

import { AuthService } from "../../services/auth.service"

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule, MatDividerModule],
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent implements OnInit {
  isLoggedIn$
  isMobileMenuOpen = false

  constructor(
    public authService: AuthService,
    private router: Router,
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn()
  }

  ngOnInit(): void {
    console.log("NavbarComponent initialized")
  }

  // Hozzáadott eseményfigyelő a dokumentum kattintásokra
  @HostListener("document:click", ["$event"])
  handleDocumentClick(event: MouseEvent) {
    // Ellenőrizzük, hogy a kattintás a hamburger menü gombra történt-e
    const mobileMenuButton = document.querySelector(".mobile-menu-button")
    if (mobileMenuButton && mobileMenuButton.contains(event.target as Node)) {
      console.log("Clicked on mobile menu button")
      return // Ha a hamburger gombra kattintottak, ne csináljunk semmit
    }

    // Ellenőrizzük, hogy a kattintás a mobil menün belül történt-e
    const mobileMenu = document.querySelector(".mobile-menu")
    if (mobileMenu && mobileMenu.contains(event.target as Node)) {
      console.log("Clicked inside mobile menu")
      return // Ha a menün belül kattintottak, ne csináljunk semmit
    }

    // Ha sem a gombra, sem a menüre nem kattintottak, zárjuk be a menüt
    if (this.isMobileMenuOpen) {
      console.log("Closing mobile menu due to outside click")
      this.closeMobileMenu()
    }
  }

  toggleMobileMenu(): void {
    console.log("toggleMobileMenu called, current state:", this.isMobileMenuOpen)
    this.isMobileMenuOpen = !this.isMobileMenuOpen
    document.body.style.overflow = this.isMobileMenuOpen ? "hidden" : ""
    console.log("Toggle mobile menu:", this.isMobileMenuOpen) // Debug
  }

  closeMobileMenu(): void {
    console.log("closeMobileMenu called")
    this.isMobileMenuOpen = false
    document.body.style.overflow = ""
    console.log("Close mobile menu") // Debug
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(["/login"])
    })
  }

  login(): void {
    this.router.navigate(["/login"])
  }
}

