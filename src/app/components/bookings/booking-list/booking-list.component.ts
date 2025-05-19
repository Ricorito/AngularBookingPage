import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink } from "@angular/router"
import { MatTableModule } from "@angular/material/table"
import { MatSortModule,  Sort } from "@angular/material/sort"
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatInputModule } from "@angular/material/input"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatSelectModule } from "@angular/material/select"
import { MatDatepickerModule } from "@angular/material/datepicker"
import { MatNativeDateModule } from "@angular/material/core"
import { MatMenuModule } from "@angular/material/menu"
import { MatDialog, MatDialogModule } from "@angular/material/dialog"
import {  MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar"
import { FormControl, ReactiveFormsModule } from "@angular/forms"
import { BookingService } from "../../../services/booking.service"
import { RoomService } from "../../../services/room.service"
import { AuthService } from "../../../services/auth.service"
import { Booking } from "../../../models/booking.model"
import { Room } from "../../../models/room.model"
import { User } from "../../../models/user.model"
import { BehaviorSubject, Observable, combineLatest, map, startWith, switchMap, of } from "rxjs"

@Component({
  selector: "app-booking-list",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: "./booking-list.component.html",
  styleUrls: ["./booking-list.component.scss"],
})
export class BookingListComponent implements OnInit {
  displayedColumns: string[] = [
    "guestName",
    "roomNumber",
    "checkInDate",
    "checkOutDate",
    "status",
    "totalPrice",
    "actions",
  ]

  bookings$!: Observable<(Booking & { roomDetails?: Room })[]>
  filteredBookings$!: Observable<(Booking & { roomDetails?: Room })[]>
  isAdmin$!: Observable<boolean>
  currentUser$!: Observable<User | null>

  searchControl = new FormControl("")
  statusControl = new FormControl("")
  checkInDateControl = new FormControl(null)

  private sortSubject = new BehaviorSubject<Sort>({ active: "checkInDate", direction: "desc" })
  private pageSubject = new BehaviorSubject<PageEvent>({ pageIndex: 0, pageSize: 10, length: 0 })

  constructor(
    private bookingService: BookingService,
    private roomService: RoomService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.isAdmin$ = this.authService.isAdmin()
    this.currentUser$ = this.authService.currentUser$

    this.bookings$ = this.currentUser$.pipe(
      switchMap((user) => {
        if (!user) return of([])

        return this.isAdmin$.pipe(
          switchMap((isAdmin) => {
            if (isAdmin) {
              return this.bookingService.getBookings()
            }
            else {
              return this.bookingService.getBookingsByUser(user.uid)
            }
          }),
        )
      }),
      switchMap((bookings) => {
        if (bookings.length === 0) return of([])

        const bookingsWithRoomDetails$ = bookings.map((booking) =>
          this.roomService.getRoom(booking.roomId).pipe(
            map((room) => ({
              ...booking,
              roomDetails: room,
            })),
          ),
        )

        return combineLatest(bookingsWithRoomDetails$)
      }),
    )

    this.filteredBookings$ = combineLatest([
      this.bookings$,
      this.searchControl.valueChanges.pipe(startWith("")),
      this.statusControl.valueChanges.pipe(startWith("")),
      this.checkInDateControl.valueChanges.pipe(startWith(null)),
      this.sortSubject.asObservable(),
      this.pageSubject.asObservable(),
    ]).pipe(
      map(([bookings, search, status, checkInDate, sort, page]) => {
        let filtered = bookings

        if (search) {
          const searchLower = search.toLowerCase()
          filtered = filtered.filter(
            (booking) =>
              booking.guestName.toLowerCase().includes(searchLower) ||
              booking.guestEmail.toLowerCase().includes(searchLower),
          )
        }

        if (status) {
          filtered = filtered.filter((booking) => booking.status === status)
        }

        if (checkInDate) {
          const selectedDate = new Date(checkInDate)
          selectedDate.setHours(0, 0, 0, 0)

          filtered = filtered.filter((booking) => {
            const bookingDate = new Date(booking.checkInDate)
            bookingDate.setHours(0, 0, 0, 0)
            return bookingDate.getTime() === selectedDate.getTime()
          })
        }

        if (sort.active && sort.direction !== "") {
          filtered = this.getSortedData(filtered, sort)
        }

        const startIndex = page.pageIndex * page.pageSize
        return filtered.slice(startIndex, startIndex + page.pageSize)
      }),
    )
  }

  sortData(sort: Sort): void {
    this.sortSubject.next(sort)
  }

  handlePageEvent(event: PageEvent): void {
    this.pageSubject.next(event)
  }

  getSortedData(data: (Booking & { roomDetails?: Room })[], sort: Sort): (Booking & { roomDetails?: Room })[] {
    if (!sort.active || sort.direction === "") {
      return data
    }

    return data.slice().sort((a, b) => {
      const isAsc = sort.direction === "asc"
      switch (sort.active) {
        case "guestName":
          return compare(a.guestName, b.guestName, isAsc)
        case "roomNumber":
          return compare(a.roomDetails?.number, b.roomDetails?.number, isAsc)
        case "checkInDate":
          return compare(new Date(a.checkInDate).getTime(), new Date(b.checkInDate).getTime(), isAsc)
        case "checkOutDate":
          return compare(new Date(a.checkOutDate).getTime(), new Date(b.checkOutDate).getTime(), isAsc)
        case "status":
          return compare(a.status, b.status, isAsc)
        case "totalPrice":
          return compare(a.totalPrice, b.totalPrice, isAsc)
        default:
          return 0
      }
    })
  }

  cancelBooking(id: string): void {
    this.bookingService.updateBooking(id, { status: "cancelled" }).subscribe({
      next: () => {
        this.snackBar.open("Foglalás sikeresen lemondva", "Bezárás", { duration: 3000 })
      },
      error: (error) => {
        this.snackBar.open("Hiba a foglalás lemondásakor", "Bezárás", { duration: 3000 })
        console.error(error)
      },
    })
  }

  deleteBooking(id: string): void {
    if (confirm("Biztosan törölni szeretnéd ezt a foglalást? Ez a művelet nem visszavonható.")) {
      this.bookingService.deleteBooking(id).subscribe({
        next: () => {
          this.snackBar.open("Foglalás sikeresen törölve", "Bezárás", { duration: 3000 })
        },
        error: (error) => {
          this.snackBar.open("Hiba a foglalás törlésekor", "Bezárás", { duration: 3000 })
          console.error(error)
        },
      })
    }
  }

  canModifyBooking(booking: Booking): Observable<boolean> {
    return this.isAdmin$.pipe(
      switchMap((isAdmin) => {
        if (isAdmin) return of(true)
        return this.currentUser$.pipe(map((user) => user?.uid === booking.userId))
      }),
    )
  }
}

function compare(a: any, b: any, isAsc: boolean) {
  if (a === undefined && b === undefined) return 0
  if (a === undefined) return isAsc ? -1 : 1
  if (b === undefined) return isAsc ? 1 : -1
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1)
}

