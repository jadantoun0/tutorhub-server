// StudentDTO returned to the client by the server
export class StudentDTO {
  _id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  profilePic?: string;
  bio?: string;
  nationality?: string;
  languages?: string;
  dateOfBirth?: Date;
  appointments?: string[];
  educationalLevel?: string;

  constructor(
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    role: string,
    profilePic: string,
    bio: string,
    nationality: string,
    languages: string,
    appointments: string[],
    dateOfBirth: Date,
    educationalLevel: string,
  ) {
    this._id = id;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.role = role;
    this.profilePic = profilePic;
    this.bio = bio;
    this.nationality = nationality;
    this.languages = languages;
    this.appointments = appointments;
    this.dateOfBirth = dateOfBirth;
    this.educationalLevel = educationalLevel;
  }
}
