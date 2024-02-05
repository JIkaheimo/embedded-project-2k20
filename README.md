# embedded-project-2k20

Embedded systems programming project, spring 2020.

[Open game](https://embedded-project.herokuapp.com/)

Developers: Jaakko Ikäheimo, Arttu Rusanen, Konsta Holm

Technologies used:

- [phaser.js](https://phaser.io/phaser3) as game engine, [matter.js](https://brm.io/matter-js/) as physics engine and [socket.io](https://socket.io/) for server communication.
- C/C++ for reading controller input and serial communication with computer.
- Python to simulate keypresses based on the controller input and display data in GUI.
- [Node.js](https://nodejs.org) + [express.js](https://expressjs.com) to setup multiplayer server, [socket.io](https://socket.io/) for client-server communication.

Repository structure:

- [docs](https://github.com/JIkaheimo/embedded-project-2k20/tree/master/docs) - project documents
  - [memos](https://github.com/JIkaheimo/embedded-project-2k20/tree/master/docs/memos) - meeting memos
- [controller](https://github.com/JIkaheimo/embedded-project-2k20/tree/master/controller) - C/C++ code for controller.
- [controller-game](https://github.com/JIkaheimo/embedded-project-2k20/tree/master/controller-game) - Python code to map controller input to key presses.
- [game](https://github.com/JIkaheimo/embedded-project-2k20/tree/master/game/) - server and client-side JavaScript code
  - [src](https://github.com/JIkaheimo/embedded-project-2k20/tree/master/game/src) - client-side game code
  - [server](https://github.com/JIkaheimo/embedded-project-2k20/tree/master/game/server) - server-side game code

Assets used:

- [Kenney](https://www.kenney.nl/assets) character assets.
- [HTML5 Game Development with Phaser 3 Master Course](https://www.udemy.com/course/html5-game-development-with-phaser-3-master-course/) map tileset.
