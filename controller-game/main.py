from utils import SerialReader, SerialOpenException
from utils.handlers import init, wait_handler
from utils.handlers.serial_handlers import find_nucleo

import socketio
from gui import ControllerWindow


def main():

    print('Starting the controller driver program...')

    # Setup GUI.
    controller_window = ControllerWindow()
    controller_window.update_status('Trying to find a Nucleo device...')

    # Try to find the connected Nucleo device.
    nucleo_port = wait_handler(
        find_nucleo, 'Please insert Nucleo device into USB port (Press CTRL+C to exit)')

    print(
        'Nucleo device was detected in port %s. Starting Serial reader.' % nucleo_port)

    # Establish a serial communication in different thread.
    serial_reader = SerialReader(nucleo_port)

    # Create socket to communicate with the game server (not used)
    sio = socketio.Client()

    # Initialize handlers
    handlers = init(controller_window, serial_reader, sio)

    # Initialize and start serial reader
    serial_reader \
        .on_read(handlers.read_handler) \
        .on_connect(handlers.connect_handler) \
        .on_disconnect(handlers.disconnect_handler) \
        .start()

    # Block execution with GUI.
    controller_window.mainloop()

    # This could be omitted.
    serial_reader.close()

    print('\nSuccessfully exited the application...')


if __name__ == '__main__':
    # Execute the application loop until user interrupts.
    try:
        main()
    except KeyboardInterrupt:
        print('\nSuccessfully exited the application...')
