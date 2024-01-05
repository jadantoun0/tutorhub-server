import { Module } from '@nestjs/common';
import { CallGateway } from './call.gateway';
// import { MessageGateway } from './message.gateway';

@Module({
  providers: [CallGateway],
})
export class WebsocketsModule {}
