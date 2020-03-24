import serial
import serial.tools.list_ports
import socketio


# Serial configs
SERIAL_PORT = '/dev/ttyACM0'
BAUD_RATE = 9600
PARITY = serial.PARITY_NONE
STOP_BITS = serial.STOPBITS_ONE
BYTE_SIZE = serial.EIGHTBITS
TIMEOUT = 1


def initSerial(nucleoPort):
    """
    Initializes a serial connection
    with a controller device.
    """

    return serial.Serial(
        port=nucleoPort,
        baudrate=BAUD_RATE,
        parity=PARITY,
        stopbits=STOP_BITS,
        bytesize=BYTE_SIZE,
        timeout=TIMEOUT
    )
# initSerial end


if __name__ == '__main__':

    nucleoPort = None

    # Get port number for Nucleo.
    for port, identifier, _ in serial.tools.list_ports.comports():
        if (identifier.startswith("STMicroelectronics")):
            nucleoPort = port

    print(nucleoPort)

    # Make sure Nucleo is available.
    if nucleoPort == None:
        print("Could not detect connected Nucleo. Please make sure it is correctly connected...")
        sys.exit()

    device = initSerial(nucleoPort)
    # Connect to serial port (controller).
    # device = initSerial()
