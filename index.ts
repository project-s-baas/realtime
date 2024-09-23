const server = Bun.serve({
  fetch(req, server) {
    // TODO : 특정 채널에 대한 인증 로직 검증 로직
    // 근데 이 인증로직은 message 에 처리해도 될 듯 하다.

    // TODO : ws.data 안에 여러 정보 넣기
    // 데이터를 바탕으로 아래 publish 나 subscribe 등을 결정하자.

    // 숫자 권한 or 라벨로 권한????
    // select, insert, update, delete / realtime_subscribe(하나로 퉁치자 각각 권한 분리할 이유가 없긴하다. 그 테이블에 대한 리얼타임 하나로)

    // upgrade the request to a WebSocket
    const upgrade = server.upgrade(req);

    if (upgrade) {
      console.log("WebSocket upgrade successful");
      return; // WebSocket 업그레이드 성공 시 추가적인 처리가 필요하지 않음
    } // WebSocket 업그레이드 실패 시

    console.error("WebSocket upgrade failed");
    return new Response("Upgrade failed", {
      status: 426,
      statusText: "Upgrade Required",
    });
  },
  websocket: {
    open(ws) {
      console.log("A client connected");
    },
    message(ws, message) {
      const parsedMessage = JSON.parse(message as string);
      const { type, channel, event, data } = parsedMessage;

      console.log(type);

      // 구독 처리
      if (type === "subscribe") {
        ws.subscribe(`${channel}:${event}`);

        console.log(`Subscribed to ${event ? `${channel}:${event}` : channel}`);
      }

      // 메시지 게시
      if (type === "publish") {
        if (event != "*") {
          // 특정 이벤트에 게시
          ws.publish(`${channel}:${event}`, JSON.stringify(data));
        }
        // 전체 채널에 게시
        ws.publish(`${channel}:*`, JSON.stringify(data));
        console.log(`Published to ${event ? `${channel}:${event}` : channel}`);
      }

      // 구독 해제처리
      if (type === "unsubscribe") {
        ws.unsubscribe(`${channel}:*`);
        if (event != "*") {
          ws.unsubscribe(`${channel}:${event}`);
        }
        console.log(`Unsubscribed to ${event ? `${channel}:${event}` : channel}`);
      }

    },
    close(ws) {
      console.log('A client disconnected');
    },
  },
});

console.log(`Listening on ${server.hostname}:${server.port}`);
