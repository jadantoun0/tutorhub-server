export interface UpdateTutorDTO {
  email: string;
  password: string;
  profilePic: string;
  firstName: string;
  lastName: string;
  bio: string;
  hourlyRate: number;
  nationality: string;
  languages: string;
  sessionType: string;
  education: string;
  subject: string;
  skills: string[];
  position: string;
  reviews: string[];
  appointment: string[];
}
