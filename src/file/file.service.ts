import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

@Injectable()
export class FileService {
  /**
   * @summary Handle the upload of a file.
   * @param file - The file to be uploaded.
   * @returns A public URL or path for the uploaded file.
   * @throws BadRequestException if the file is not uploaded.
   * @throws InternalServerErrorException if an internal server error occurs.
   */
  async handleFileUpload(file: Express.Multer.File): Promise<string> {
    try {
      if (!file) {
        throw new BadRequestException('File not uploaded');
      }
      // generate a public URL or path for the uploaded file
      const baseUrl = 'http://localhost:3001/api/files';
      const publicPath = baseUrl + '/' + file.filename;
      // sending the path to the client
      return publicPath;
    } catch (err) {
      console.log(err);
      if (err instanceof BadRequestException) {
        console.log('throwing from service');
        throw err;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
