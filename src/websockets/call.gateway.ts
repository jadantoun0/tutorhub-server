import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class CallGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;
  private socketList: Record<
    string,
    { userName: string; video: boolean; audio: boolean }
  > = {};

  handleConnection(client: Socket) {
    console.log(`Connected to call gateway: ${client.id}`);
  }

  // Handle the 'check-user' event
  /**
   * @summary Handles the 'check-user' event.
   * @param client - The socket that triggered the event.
   * @param data - Data containing the roomId and userName.
   */
  @SubscribeMessage('BE-check-user')
  handleCheckUser(client: Socket, data: { roomId: string; userName: string }) {
    let error = false;
    console.log('CHECK USER INVOKED');

    this.server
      .to(data.roomId)
      .allSockets()
      .then((clients) => {
        clients.forEach((client) => {
          if (this.socketList[client]?.userName === data.userName) {
            error = true;
          }
        });
        client.emit('FE-error-user-exist', { error });
      });
  }

  /**
   * @summary Handles the 'join-room' event.
   * @param client - The socket that triggered the event.
   * @param data - Data containing the roomId and userName.
   */
  // Handle the 'join-room' event
  @SubscribeMessage('BE-join-room')
  async handleJoinRoom(
    client: Socket,
    data: { roomId: string; userName: string },
  ) {
    console.log('JOIN ROOM INVOKED');
    // Socket Join RoomName
    client.join(data.roomId);
    this.socketList[client.id] = {
      userName: data.userName,
      video: true,
      audio: true,
    };

    try {
      // Set User List
      const clients = await this.server.to(data.roomId).allSockets();
      const users = Array.from(clients).map((clientId) => ({
        userId: clientId,
        info: this.socketList[clientId],
      }));
      console.log('USERS RETURNED: ', users);
      client.broadcast.to(data.roomId).emit('FE-user-join', users);
    } catch (e) {
      console.log(e);
      client.emit('FE-error-user-exist', { err: true });
    }
  }

  /**
   * @summary Handles the 'call-user' event.
   * @param client - The socket that triggered the event.
   * @param data - Data containing the userToCall, from, and signal.
   */
  // Handle the 'call-user' event
  @SubscribeMessage('BE-call-user')
  handleCallUser(
    client: Socket,
    data: { userToCall: string; from: string; signal: any },
  ) {
    console.log('CALL USER INVOKED');
    this.server.to(data.userToCall).emit('FE-receive-call', {
      signal: data.signal,
      from: data.from,
      info: this.socketList[client.id],
    });
  }

  /**
   * @summary Handles the 'accept-call' event.
   * @param client - The socket that triggered the event.
   * @param data - Data containing the signal and to.
   */
  // Handle the 'accept-call' event
  @SubscribeMessage('BE-accept-call')
  handleAcceptCall(client: Socket, data: { signal: any; to: string }) {
    console.log('ACCEPT CALL INVOKED');
    this.server.to(data.to).emit('FE-call-accepted', {
      signal: data.signal,
      answerId: client.id,
    });
  }

  /**
   * @summary Handles the 'send-message' event.
   * @param client - The socket that triggered the event.
   * @param data - Data containing the roomId, msg, and sender.
   */
  // Handle the 'send-message' event
  @SubscribeMessage('BE-send-message')
  handleSendMessage(
    client: Socket,
    data: { roomId: string; msg: string; sender: string },
  ) {
    this.server
      .to(data.roomId)
      .emit('FE-receive-message', { msg: data.msg, sender: data.sender });
  }

  /**
   * @summary Handles the 'BE-leave-room' event.
   * @param client - The socket that triggered the event.
   * @param data - Data containing the roomId.
   */
  // Handle the 'BE-leave-room' event
  @SubscribeMessage('BE-leave-room')
  handleLeaveRoom(client: Socket, data: { roomId: string }) {
    const leaverId = client.id;
    delete this.socketList[leaverId];

    client.broadcast
      .to(data.roomId)
      .emit('FE-user-leave', { userId: leaverId, userName: [leaverId] });

    const socketRoom = this.server.sockets.sockets[leaverId];
    if (socketRoom) {
      socketRoom.leave(data.roomId);
    }
  }

  /**
   * @summary Handles the 'toggle-camera-audio' event.
   * @param client - The socket that triggered the event.
   * @param data - Data containing the roomId and switchTarget.
   */
  // Handle the 'toggle-camera-audio' event
  @SubscribeMessage('BE-toggle-camera-audio')
  handleToggleCameraAudio(
    client: Socket,
    data: { roomId: string; switchTarget: string },
  ) {
    if (data.switchTarget === 'video') {
      this.socketList[client.id].video = !this.socketList[client.id].video;
    } else {
      this.socketList[client.id].audio = !this.socketList[client.id].audio;
    }
    client.broadcast.to(data.roomId).emit('FE-toggle-camera', {
      userId: client.id,
      switchTarget: data.switchTarget,
    });
  }
}
