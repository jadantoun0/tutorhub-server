// import {
//   SubscribeMessage,
//   WebSocketGateway,
//   WebSocketServer,
//   OnGatewayDisconnect,
//   OnGatewayConnection,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';

// @WebSocketGateway({ cors: true })
// export class MessageGateway
//   implements OnGatewayDisconnect, OnGatewayConnection
// {
//   @WebSocketServer()
//   private server: Server;
//   private users: { [key: string]: string } = {};

//   handleConnection() {
//     console.log('connected to messaging gateway');
//   }

//   handleDisconnect(client: Socket): void {
//     const disconnectedUserId = Object.keys(this.users).find(
//       (key) => this.users[key] === client.id,
//     );
//     if (disconnectedUserId) {
//       delete this.users[disconnectedUserId];
//       console.log(`User ${disconnectedUserId} disconnected.`);
//     }
//   }

//   @SubscribeMessage('registerUser')
//   /**
//    * @summary Handles the 'registerUser' event.
//    * @param client - The socket that triggered the event.
//    * @param userId - The user ID to register.
//    */
//   handleRegisterUser(client: Socket, userId: string): void {
//     this.users[userId] = client.id;
//     console.log(
//       `User with ID ${userId} registered with socket ID ${client.id}`,
//     );
//   }

//   /**
//    * @summary Handles the 'privateMessage' event.
//    * @param client - The socket that triggered the event.
//    * @param data - Data containing receiverId, senderId, and message.
//    */
//   @SubscribeMessage('privateMessage')
//   handlePrivateMessage(
//     client: Socket,
//     data: { receiverId: string; senderId: string; message: string },
//   ): void {
//     const { receiverId, senderId, message } = data;
//     const receiverSocketId = this.users[receiverId];

//     if (receiverSocketId) {
//       this.server.to(receiverSocketId).emit('privateMessage', {
//         senderId,
//         message,
//       });
//     } else {
//       console.log('User you are sending to is not connected');
//     }
//   }
// }
