export type Department = {
  id: string;
  name: string;
};

export type User = {
  userId: string;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  department: string | null; // departments.id
  departmentName: string | null;
  pictureUrl: string | null;
  registeredAt: string | null;
};

export type Room = {
  roomId: string;
  name: string;
  capacity: number;
  location: string | null;
  active: boolean;
  createdAt?: string;
};

export type BookingStatus = "ACTIVE" | "CANCELLED";

/** ข้อมูลผู้จองที่เปิดให้คนอื่นเห็นได้ */
export type BookingUser = Pick<User, "displayName" | "firstName" | "lastName" | "pictureUrl">;

export type Booking = {
  bookingId: string;
  roomId: string;
  userId: string | null;
  title: string | null;
  attendees: number | null;
  notes: string | null;
  startAt: string;
  endAt: string;
  status: BookingStatus;
  createdAt: string | null;
  updatedAt: string | null;
  room: Pick<Room, "roomId" | "name" | "location"> | null;
  user: BookingUser | null;
};

/** กติกาการจองจากตาราง config */
export type BookingRules = {
  openTime: string; // "HH:mm"
  closeTime: string; // "HH:mm"
  maxDaysAhead: number;
};

/** ผลลัพธ์มาตรฐานของ Server Action */
export type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string };
