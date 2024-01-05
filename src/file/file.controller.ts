import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/utils/public.decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileService } from './file.service';
import { Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

/**
 * @summary Controller responsible for handling file-related operations.
 */
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  /**
   * @summary Get an image by filename.
   * @param fileName - Name of the file to retrieve.
   * @param res - Express response object.
   * @returns The file retrieved as a response.
   */
  @Get('/:filename')
  @Public()
  @ApiOperation({ summary: 'Get an image by filename' })
  @ApiParam({ name: 'filename', description: 'Name of the file to retrieve' })
  @ApiResponse({ status: 200, description: 'File retrieved successfully' })
  @ApiNotFoundResponse({ description: 'File not found' })
  async getImage(@Param('filename') fileName, @Res() res: Response) {
    res.sendFile(fileName, { root: './uploads' });
  }

  /**
   * @summary Upload a file.
   * @param file - File to be uploaded.
   * @param res - Express response object.
   * @returns The file uploaded successfully.
   * @throws Error if the file type is not allowed or if an error occurs during upload.
   */
  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload a file' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const originalName = file.originalname; // Store the original name
          const extension = extname(file.originalname);
          callback(
            null,
            `${originalName}-${file.fieldname}-${uniqueSuffix}${extension}`,
          );
        },
      }),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
      },
      fileFilter: (req, file, callback) => {
        const allowedFileTypes = /\.(jpg|jpeg|png|gif|pdf|docx|webp)$/;

        if (!file.originalname.match(allowedFileTypes)) {
          return callback(
            new Error('Only image, PDF, and Word files are allowed!'),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  @ApiOperation({ summary: 'Handle file upload' })
  @ApiBody({ type: 'multipart/form-data', description: 'File to be uploaded' })
  @ApiCreatedResponse({
    description: 'File uploaded successfully',
    type: String,
  })
  @ApiBadRequestResponse({
    description: 'Invalid file or file not uploaded',
  })
  @ApiConflictResponse({
    description: 'File type not allowed',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occurred',
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
      const response = await this.fileService.handleFileUpload(file);
      return res.json(response);
    } catch (err) {
      throw err;
    }
  }
}
