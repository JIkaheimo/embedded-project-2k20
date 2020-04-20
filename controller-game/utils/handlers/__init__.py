from utils.handlers.serial_handlers import connect_handler, disconnect_handler, read_handler
from utils.handlers.input_handlers import press_handler, tilt_handler, release_handler
from utils.handlers.wait_handler import wait_handler
from utils.inputs import input_to_handler

from types import SimpleNamespace
from functools import partial


def init(gui, serial_reader, socket):
    """
    Initializes the handlers to operate with the given gui, serial reader and socket.

    @Params
    gui of the application
    serial reader used to read data from serial
    socket for client-server communication
    """

    handlers = SimpleNamespace()

    handlers.wait_handler = wait_handler
    handlers.connect_handler = partial(connect_handler, gui)
    handlers.disconnect_handler = partial(
        disconnect_handler, gui, serial_reader)
    handlers.read_handler = partial(
        read_handler, partial(input_to_handler, gui, socket))

    return handlers
