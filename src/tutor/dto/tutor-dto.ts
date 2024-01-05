// TutorDTO returned to the client by the server
export class TutorDTO {
  _id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  profilePic?: string;
  bio?: string;
  hourlyRate?: number;
  nationality?: string;
  languages?: string;
  sessionType?: string;
  education?: string;
  subject?: string;
  skills?: string[];
  position?: string;
  reviews?: string[];
  appointments?: string[];

  constructor(
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    role: string,
    profilePic: string,
    bio: string,
    hourlyRate: number,
    nationality: string,
    languages: string,
    sessionType: string,
    education: string,
    subject: string,
    skills: string[],
    position: string,
    reviews: string[],
    appointments: string[],
  ) {
    this._id = id;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.role = role;
    this.profilePic = profilePic;
    this.bio = bio;
    this.hourlyRate = hourlyRate;
    this.nationality = nationality;
    this.languages = languages;
    this.appointments = appointments;
    this.sessionType = sessionType;
    this.education = education;
    this.subject = subject;
    this.skills = skills;
    this.position = position;
    this.reviews = reviews;
  }
}
