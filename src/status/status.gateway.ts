import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import WebSocket, { Server } from 'ws';

@WebSocketGateway({
  // 原生 ws 不支持 namespace，只能通过不同端口区分，或者在业务层自己处理
  // 如果需要和 HTTP 服务共用端口，这里不填 port 即可
})
export class StatusGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server; // 原生 ws 的 Server 类型

  handleConnection(client: WebSocket) {
    console.log('Client connected');
  }

  handleDisconnect(client: WebSocket) {
    console.log('Client disconnected');
  }

  broadcastStatus<T>(event: string, payload: T) {
    // server.clients 是所有当前连接的客户端集合
    const message = JSON.stringify({
      event,
      data: payload,
    });

    this.server.clients.forEach((client) => {
      // WebSocket.OPEN 表示连接处于打开状态（可以发送消息）
      // 必须检查状态，避免向已断开的客户端发送消息导致报错
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (err) {
          console.error('发送消息失败：', err);
        }
      }
    });
  }
}
