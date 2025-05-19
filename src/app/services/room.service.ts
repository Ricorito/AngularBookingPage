import { Injectable } from '@angular/core';
import { getDatabase,ref, push,set,update,remove,get,query,orderByChild,equalTo} from 'firebase/database';
import { Observable, from, map, of } from 'rxjs';
import type { Room } from '../models/room.model';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private database = getDatabase();
  private roomsPath = 'rooms';

  constructor() {}

  getRooms(): Observable<Room[]> {
    const roomsRef = ref(this.database, this.roomsPath);

    return from(get(roomsRef)).pipe(
      map((snapshot) => {
        const rooms: Room[] = [];
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const room = childSnapshot.val();
            room.id = childSnapshot.key;
            rooms.push(room);
            return false;
          });
        }
        return rooms.sort((a, b) => a.number.localeCompare(b.number));
      })
    );
  }

  getRoomsByHotel(hotelId: string): Observable<Room[]> {
  const roomsQuery = query(
    ref(this.database, this.roomsPath),
    orderByChild('hotelId'),
    equalTo(hotelId)
  );

  return from(get(roomsQuery)).pipe(
    map((snapshot) => {
      const rooms: Room[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const room = childSnapshot.val();
          room.id = childSnapshot.key;
          rooms.push(room);
          return false;
        });
      }
      return rooms.sort((a, b) => a.number.localeCompare(b.number));
    })
  );
}

  getAvailableRooms(): Observable<Room[]> {
    const roomsRef = ref(this.database, this.roomsPath);

    return from(get(roomsRef)).pipe(
      map((snapshot) => {
        const rooms: Room[] = [];
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const room = childSnapshot.val();
            if (room.isAvailable) {
              room.id = childSnapshot.key;
              rooms.push(room);
            }
            return false;
          });
        }
        return rooms.sort((a, b) => a.price - b.price);
      })
    );
  }

  getAvailableRoomsByHotel(hotelId: string): Observable<Room[]> {
    const roomsRef = ref(this.database, this.roomsPath);

    return from(get(roomsRef)).pipe(
      map((snapshot) => {
        const rooms: Room[] = [];
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const room = childSnapshot.val();
            if (room.isAvailable && room.hotelId === hotelId) {
              room.id = childSnapshot.key;
              rooms.push(room);
            }
            return false;
          });
        }
        return rooms.sort((a, b) => a.price - b.price);
      })
    );
  }

  getRoomsByType(type: Room['type']): Observable<Room[]> {
    const roomsRef = ref(this.database, this.roomsPath);

    return from(get(roomsRef)).pipe(
      map((snapshot) => {
        const rooms: Room[] = [];
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const room = childSnapshot.val();
            if (room.type === type) {
              room.id = childSnapshot.key;
              rooms.push(room);
            }
            return false;
          });
        }
        return rooms.sort((a, b) => a.price - b.price);
      })
    );
  }

  getRoom(id: string): Observable<Room> {
    const roomRef = ref(this.database, `${this.roomsPath}/${id}`);

    return from(get(roomRef)).pipe(
      map((snapshot) => {
        if (snapshot.exists()) {
          const room = snapshot.val();
          room.id = snapshot.key;
          return room;
        } else {
          throw new Error('Szoba nem található!');
        }
      })
    );
  }

  addRoom(room: Omit<Room, 'id'>): Observable<string> {
    const roomsRef = ref(this.database, this.roomsPath);
    const newRoomRef = push(roomsRef);

    return from(set(newRoomRef, room)).pipe(map(() => newRoomRef.key || ''));
  }

  updateRoom(id: string, room: Partial<Room>): Observable<void> {
    const roomRef = ref(this.database, `${this.roomsPath}/${id}`);
    return from(update(roomRef, room));
  }

  deleteRoom(id: string): Observable<void> {
    const roomRef = ref(this.database, `${this.roomsPath}/${id}`);
    return from(remove(roomRef));
  }

  checkRoomAvailability(
    roomId: string,
    checkInDate: Date,
    checkOutDate: Date
  ): Observable<boolean> {
    return of(true);
  }
}
