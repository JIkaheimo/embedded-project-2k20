import threading
from utils.serial_config import add_config
import serial
from time import sleep

###################################
# Exceptions                      #
###################################


class SerialOpenException(Exception):
    """
    SerialOpenException will be raised when a connection with the serial device cannot be established.
    """
    pass


class SerialDisconnectException(Exception):
    """
    SerialDisconnectException will be raised when the serial device gets disconnected.
    """
    pass


####################################
# SerialThread                     #
####################################

class SerialReader(threading.Thread):
    """
    SerialReader creates a new thread for reading data from serial device.

    @Inherits
    threading.Thread
    """

    # Private props.
    __is_running = False
    __serial = None
    __read_Callback = None
    __disconnect_callback = None

    def __init__(self, port):
        """
        Constructor for SerialReader.

        @Params
        the port used for reading serial data.
        """

        super().__init__()

        # Close the thread when the program exits.
        self.daemon = True

        # Initialize and configure serial connection.
        self.__serial = serial.Serial()
        self.__serial.port = port
        self.__serial = add_config(self.__serial)

    def start(self):
        """
        start tries to connect with the device and starts a thread for
        reading serial data.
        """

        # Try to open a serial connection.
        try:
            self.__serial.open()
        except serial.SerialException as ex:
            raise SerialOpenException(ex)

        # Double check if the connection was actually established...
        if not self.__serial.isOpen():
            raise SerialOpenException(
                "Could not establish a serial connection in port", self.__serial.port)

        # Call connect callback if it is set.
        if self.__connect_callback is not None:
            self.__connect_callback()

        # Enable flag.
        self.__is_running = True

        # Start the thread.
        return super().start()

    def run(self):

        # Execute thread until user closes it (or program finishes)
        while self.__is_running:

            # Try to read input from the serial device.
            try:
                input_from_serial = self.__serial.readline().decode('utf-8').rstrip()

            # Ignore first read if connections is not synced.
            except UnicodeDecodeError:
                continue
            # Tru to reconnect if the device gets disconnected.
            except serial.SerialException:
                # Execute disconnect callback if it is set.
                if self.__disconnect_callback is not None:
                    self.__disconnect_callback()
                # Otherwise raise error.
                else:
                    raise SerialDisconnectException(
                        "Lost a connection with the serial device")

            # Filter out empty events.
            if len(input_from_serial) == 0:
                continue

            # Execute read event callback if it is set.
            if self.__read_callback is not None:
                self.__read_callback(input_from_serial)

        # Make sure the connection is closed properly.
        if self.__serial.isOpen():
            self.__serial.close()

    def reconnect(self, port):
        """
        Reconnects the connection within the given serial port.

        @Params
        the port for reconnect
        """
        self.__serial.port = port

        if self.__connect_callback is not None:
            self.__connect_callback()

        # Call connect callback if it is set.

    def close(self):
        """
        Closes the thread by setting the flag property.
        """
        self.__is_running = False

    #####################################
    # Callback setters.                 #
    #####################################

    def on_read(self, callback):
        """
        Sets a callback to be executed when data is received from the serial port.

        @Params
        callback to be executed when serial data is read.

        @Returns
        the object itself
        """
        self.__read_callback = callback
        return self

    def on_connect(self, callback):
        """
        Sets a callback to be executed when the connection is succesfully established.

        @Params
        callback to be executed when serial connection is established.

        @Returns
        the object itself
        """
        self.__connect_callback = callback
        return self

    def on_disconnect(self, callback):
        """
        Sets a callback to be executed when the connection to the serial device is lost.

        @Params
        callback to be executed when serial connection is lost.

        @Returns
        the object itself
        """
        self.__disconnect_callback = callback
        return self
