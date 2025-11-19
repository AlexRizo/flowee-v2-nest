import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { TaskWsService } from './task-ws.service';
import { CreateTaskWDto } from './dto/create-task-w.dto';
import { UpdateTaskWDto } from './dto/update-task-w.dto';
import { Server, Socket } from 'socket.io';
import { getRefreshToken } from 'src/aws/helpers/cookies';

@WebSocketGateway()
export class TaskWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly taskWsService: TaskWsService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(client.handshake.headers);
    const token = getRefreshToken(client.handshake.headers.cookie || '');
    console.log(`Client connected: ${client.id}; Refresh Token: ${token}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('createTaskW')
  create(@MessageBody() createTaskWDto: CreateTaskWDto) {
    return this.taskWsService.create(createTaskWDto);
  }

  @SubscribeMessage('findAllTaskWs')
  findAll() {
    return this.taskWsService.findAll();
  }

  @SubscribeMessage('findOneTaskW')
  findOne(@MessageBody() id: number) {
    return this.taskWsService.findOne(id);
  }

  @SubscribeMessage('updateTaskW')
  update(@MessageBody() updateTaskWDto: UpdateTaskWDto) {
    return this.taskWsService.update(updateTaskWDto.id, updateTaskWDto);
  }

  @SubscribeMessage('removeTaskW')
  remove(@MessageBody() id: number) {
    return this.taskWsService.remove(id);
  }
}
