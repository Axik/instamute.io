import tornado.web
import tornadio2
import tornadio2.router
import tornadio2.server
import tornadio2.conn


class IndexHandler(tornado.web.RequestHandler):
    """Regular HTTP handler to serve the chatroom page"""
    def get(self):
        self.render('index.html')


class SocketIOHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('./socket.io.js')


class ChatConnection(tornadio2.conn.SocketConnection):
    # Class level variable
    participants = set()
    resources = {'screen': False,
                 'video' : True,
                 'audio' : False
                }

    def on_open(self, info):
        self.emit('stunservers', {"url": "stun:stun.l.google.com:19302"})
        # self.send("Welcome from the server.")
        self.participants.add(self)

    def on_message(self, message):
        # Pong message back
        for p in self.participants:
            p.send(message)

    def on_close(self):
        self.participants.remove(self)

    @tornadio2.conn.event('join')
    def join(self, *args):
        raise NotImplemented

    @tornadio2.conn.event('leave')
    def leave(self, *args):
        raise NotImplemented

    @tornadio2.conn.event('create')
    def leave(self, *args):
        raise NotImplemented

    def removeFeed(self, types):
        raise NotImplemented

    @staticmethod
    def describeRoom(name):
        raise NotImplemented


# Create chat server
ChatRouter = tornadio2.router.TornadioRouter(ChatConnection, dict(websocket_check=True))

# Create application
application = tornado.web.Application(
    ChatRouter.apply_routes([(r"/", IndexHandler),
                             (r"/socket.io.js", SocketIOHandler),
                            ]),
    socket_io_port = 8888
)

if __name__ == "__main__":
    import logging
    logging.getLogger().setLevel(logging.DEBUG)

    tornadio2.server.SocketServer(application)
