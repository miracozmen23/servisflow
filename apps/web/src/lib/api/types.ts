export type UserRole = "CUSTOMER" | "TECHNICIAN";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface DataResponse<T> {
  data: T;
}
