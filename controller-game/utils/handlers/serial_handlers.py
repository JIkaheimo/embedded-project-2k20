from utils import handlers
from utils import find_device


def read_handler(input_handler, serial_data):
    """
    Handles serial read events.

    @Params
    input/data handler
    data read from serial (input)
    """

    # Pass data to input handler.
    input = serial_data.split(' ')
    input_handler(input)


def connect_handler(gui):
    """
    Handles serial connect events.

    @Params
    gui of the application
    """

    # Display connect to the user.
    gui.update_status('Controller connected.', True)


def disconnect_handler(gui, serial_reader):
    """
    Handles serial disconnect events.

    @Params
    gui of the application
    serial data reader
    """

    # Display disconnect to the user.
    gui.update_status(
        'Controller disconnected. Please plug it in or wait...', False)

    # Try to re-establish the connection with serial device.
    nucleo_port = handlers.wait_handler(
        find_nucleo, 'Connection lost with Nucleo. Trying to reconnect (Press CTRL+C to exit)')

    print('\nSuccesfully reconnected with Nucleo.')

    serial_reader.reconnect(nucleo_port)


#############
# Helpers.  #
#############

def find_nucleo():
    return find_device('STM')
