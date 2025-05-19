import { Component, OnInit, OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink } from "@angular/router"
import { MatCardModule } from "@angular/material/card"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatDividerModule } from "@angular/material/divider"
import { MatProgressBarModule } from "@angular/material/progress-bar"
import { BookingService } from "../../services/booking.service"
import { RoomService } from "../../services/room.service"
import { AuthService } from "../../services/auth.service"
import { HotelService } from "../../services/hotel.service"
import { Booking } from "../../models/booking.model"
import { Room } from "../../models/room.model"
import { User } from "../../models/user.model"
import { Hotel } from "../../models/hotel.model"
import { Observable, combineLatest, map, of, switchMap } from "rxjs"
import { Injectable } from "@angular/core"
import { FoglalasDirectiveDirective } from "../../directives/foglalas/foglalas-directive.directive"
import { SimpleSliderDirective } from "../../directives/slider/slider.directive"
import { ReszletekDirectiveDirective } from "../../directives/reszletek/reszletek.directive"

@Injectable({
  providedIn: "root",
})

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressBarModule,
    FoglalasDirectiveDirective,
    SimpleSliderDirective,
    ReszletekDirectiveDirective
  ],
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})


export class DashboardComponent implements OnInit, OnDestroy {
  rooms$!: Observable<Room[]>
  recentBookings$!: Observable<(Booking & { roomDetails?: Room })[]>
  activeBookingsCount$!: Observable<number>
  availableRoomsCount$!: Observable<number>
  currentUser$!: Observable<User | null>
  userName = ""

  featuredHotels: Hotel[] = []
  currentFeaturedHotelIndex = 0;
  currentFeaturedHotel: Hotel | null = null
  currentHotelIndex = 0
  hotelInterval?: any
  featuredRooms$!: Observable<any[]>

  constructor(
    private bookingService: BookingService,
    private roomService: RoomService,
    private authService: AuthService,
    private hotelService: HotelService,
  ) {}

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$
    this.rooms$ = this.roomService.getRooms()

    this.hotelService.getHotels().subscribe((hotels) => {
      this.featuredHotels = hotels
      if (this.featuredHotels.length > 0) {
        this.currentFeaturedHotel = this.featuredHotels[0]
        this.currentHotelIndex = 0

        this.hotelInterval = setInterval(() => {
          this.nextHotel();
        }, 5000)
      }
    })

    this.featuredRooms$ = this.hotelService.getHotels().pipe(
      switchMap((hotels) => {
        if (hotels.length === 0) {
          return of(this.defaultFeaturedRooms); // Alapértelmezett szobák, ha nincs hotel
        }
    
        const hotelIds = hotels.slice(0, 3).map((hotel) => hotel.id); // Legfeljebb 3 hotel
        console.log('Hotel IDs:', hotelIds);
    
        return combineLatest(
          hotelIds.map((hotelId) =>
            this.roomService.getRoomsByHotel(hotelId!).pipe(
              map((rooms) => {
                const hotel = hotels.find((h) => h.id === hotelId);
                if (rooms.length > 0) {
                  return {
                    id: rooms[0].id,
                    name: `${hotel?.name || 'Hotel'} - ${rooms[0].type || 'Szoba'}`, 
                    hotelId: hotelId,
                    hotelName: hotel?.name || '',
                    image: rooms[0].images?.[0] || '/room1.jpg',
                  };
                } else {
                  return {
                    id: null,
                    name: hotel?.name || 'Nincs elérhető szoba',
                    hotelId: hotelId,
                    hotelName: hotel?.name || '',
                    image: hotel?.images?.[0] || '/room1.jpg',
                  };
                }
              })
            )
          )
        );
      })
    );

    this.recentBookings$ = this.currentUser$.pipe(
      switchMap((user) => {
        if (!user) return of([])

        return this.bookingService.getBookingsByUser(user.uid).pipe(
          map((bookings) => bookings.slice(0, 5)),
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
      }),
    )

    this.activeBookingsCount$ = this.bookingService
      .getBookings()
      .pipe(map((bookings) => bookings.filter((b) => b.status === "confirmed").length))

    this.availableRoomsCount$ = this.roomService.getAvailableRooms().pipe(map((rooms) => rooms.length))

    const user = localStorage.getItem("user")
    if (user) {
      const parsedUser = JSON.parse(user)
      this.userName = parsedUser.displayName || "Vendég"
    } else {
      this.userName = "Vendég"
    }
  }

  ngOnDestroy(): void {
    if (this.hotelInterval) {
      clearInterval(this.hotelInterval)
    }
  }

  prevHotel(): void {
    this.currentHotelIndex = (this.currentHotelIndex - 1 + this.featuredHotels.length) % this.featuredHotels.length
    this.currentFeaturedHotel = this.featuredHotels[this.currentHotelIndex]
  }

  nextHotel(): void {
    this.currentHotelIndex = (this.currentHotelIndex + 1) % this.featuredHotels.length
    this.currentFeaturedHotel = this.featuredHotels[this.currentHotelIndex]
  }

  cancelBooking(id: string): void {
    this.bookingService.updateBooking(id, { status: "cancelled" }).subscribe()
  }

  defaultFeaturedRooms = [
    {
      id: 1,
      name: "Egyágyas",
      hotelId: null,
      hotelName: "",
      image: "/room1.jpg",
    },
    {
      id: 2,
      name: "Lakosztály",
      hotelId: null,
      hotelName: "",
      image: "/room2.jpg",
    },
    {
      id: 3,
      name: "Deluxe",
      hotelId: null,
      hotelName: "",
      image: "/room3.jpg",
    },
  ]
}
