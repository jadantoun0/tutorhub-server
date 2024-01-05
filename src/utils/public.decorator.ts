import { SetMetadata } from '@nestjs/common';

// Creating @Public decorator to specify public routes
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
