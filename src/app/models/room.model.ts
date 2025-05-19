export interface Room {
  id?: string
  hotelId: string  
  number: string
  type: "single" | "double" | "suite" | "deluxe"
  price: number
  capacity: number
  description: string
  amenities: string[]
  images: string[]
  isAvailable: boolean
}
