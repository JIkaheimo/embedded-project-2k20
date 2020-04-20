import serial
import serial.tools.list_ports

#############################################################
# Configurations used for serial communication with Nucleo. #
#############################################################

BAUDRATE = 9600

# Packet configs.
BYTESIZE = serial.EIGHTBITS
PARITY = serial.PARITY_NONE
STOPBITS = serial.STOPBITS_ONE


#############################################################
# Helper functions.                                         #
#############################################################

def add_config(serial):
    """
    Configures the given serial object with default configs.

    @Params
    serial.Serial without configuration.

    @Returns
    serial.Serial with configuration.
    """

    serial.baudrate = BAUDRATE

    serial.bytesize = BYTESIZE
    serial.parity = PARITY
    serial.stopbits = STOPBITS

    return serial


def find_device(deviceIdentifier):
    """
    Tries to find a serial device with the given identifier and returns its port
    if the device can be found, otherwise returns None.

    @Parmas
    identifier of the serial device as a string.

    @Returns
    the port of the serial device as a string or None if the device can't be detected.
    """

    for port, identifier, _ in serial.tools.list_ports.comports():
        if (identifier.startswith(deviceIdentifier)):
            return port

    return None
