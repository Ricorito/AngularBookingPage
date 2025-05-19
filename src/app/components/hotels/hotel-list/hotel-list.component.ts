import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink } from "@angular/router"
import { MatCardModule } from "@angular/material/card"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatChipsModule } from "@angular/material/chips"
import { MatInputModule } from "@angular/material/input"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatSelectModule } from "@angular/material/select"
import { MatDialog, MatDialogModule } from "@angular/material/dialog"
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar"
import { FormControl, ReactiveFormsModule } from "@angular/forms"
import { HotelService } from "../../../services/hotel.service"
import { AuthService } from "../../../services/auth.service"
import { Hotel } from "../../../models/hotel.model"
import { Observable, combineLatest, map, startWith } from "rxjs"

@Component({
  selector: "app-hotel-list",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: "./hotel-list.component.html",
  styleUrls: ["./hotel-list.component.scss"],
})
export class HotelListComponent implements OnInit {
  hotels$!: Observable<Hotel[]>
  filteredHotels$!: Observable<Hotel[]>
  isAdmin$!: Observable<boolean>

  searchControl = new FormControl("")
  starsControl = new FormControl("")

  constructor(
    private hotelService: HotelService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.hotels$ = this.hotelService.getHotels()
    this.isAdmin$ = this.authService.isAdmin()

    this.filteredHotels$ = combineLatest([
      this.hotels$,
      this.searchControl.valueChanges.pipe(startWith("")),
      this.starsControl.valueChanges.pipe(startWith("")),
    ]).pipe(
      map(([hotels, search, stars]) => {
        let filtered = hotels

        // Keresés szűrő
        if (search) {
          const searchLower = search.toLowerCase()
          filtered = filtered.filter(
            (hotel) =>
              hotel.name.toLowerCase().includes(searchLower) ||
              hotel.city.toLowerCase().includes(searchLower) ||
              hotel.country.toLowerCase().includes(searchLower),
          )
        }

        // Csillagok szűrő
        if (stars) {
          filtered = filtered.filter((hotel) => hotel.stars === Number.parseInt(stars))
        }

        return filtered
      }),
    )
  }

  resetFilters(): void {
    this.searchControl.setValue("")
    this.starsControl.setValue("")
  }

  deleteHotel(id: string): void {
    if (confirm("Biztosan törölni szeretnéd ezt a hotelt? Ez a művelet nem visszavonható.")) {
      this.hotelService.deleteHotel(id).subscribe({
        next: () => {
          this.snackBar.open("Hotel sikeresen törölve", "Bezárás", { duration: 3000 })
        },
        error: (error) => {
          this.snackBar.open("Hiba a hotel törlésekor", "Bezárás", { duration: 3000 })
          console.error(error)
        },
      })
    }
  }
}

