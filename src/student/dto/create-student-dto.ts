// StudentDTO received from the client
export class CreateStudentDTO {
  email: string;
  password: string;
  role: string;

  constructor(email: string, password: string, role: string) {
    this.email = email;
    this.password = password;
    this.role = role;
  }
}
