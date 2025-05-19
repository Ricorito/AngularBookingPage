import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatChipsModule } from "@angular/material/chips";
import { MatTabsModule } from "@angular/material/tabs";
import { MatListModule } from "@angular/material/list";
import { MatDividerModule } from "@angular/material/divider";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { RoomService } from "../../../services/room.service";
import { BookingService } from "../../../services/booking.service";
import { Room } from "../../../models/room.model";
import { Booking } from "../../../models/booking.model";
import { Observable, catchError, map, of, switchMap } from "rxjs";

@Component({
  selector: "app-room-detail",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatListModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: "./room-detail.component.html",
  styleUrls: ["./room-detail.component.scss"],
})
export class RoomDetailComponent implements OnInit {
  room$!: Observable<Room>;
  roomBookings$!: Observable<Booking[]>;
  isLoading = true; 

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomService: RoomService,
    private bookingService: BookingService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.room$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get("id");
        if (!id) {
          
          this.isLoading = false;  
          return of(null);
        }
  
        return this.roomService.getRoom(id).pipe(
          catchError((error) => {
            this.snackBar.open("Hiba a szoba részleteinek betöltése során.", "Bezár", { duration: 3000 });
            this.router.navigate(["/rooms"]);
            return of(null);
          }),
          map((room) => {
            this.isLoading = false;
            return room;
          })
        );
      })
    ) as Observable<Room>;

    this.roomBookings$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get("id");
        if (!id) return of([]);

        return this.bookingService.getBookingsByRoom(id).pipe(
          map((bookings) =>
            bookings.filter(
              (booking) => booking.status !== "cancelled" && new Date(booking.checkOutDate) >= new Date()
            )
          ),
          catchError((error) => {
            console.error("Hiba a foglalások betöltése során", error);
            return of([]);
          })
        );
      })
    );
  }
}
