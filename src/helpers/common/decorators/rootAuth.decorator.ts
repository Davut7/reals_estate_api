import { SetMetadata } from '@nestjs/common';

export const ROOT_AUTH_KEY = 'rootAuth';
export const RootAuth = () => SetMetadata(ROOT_AUTH_KEY, true);
