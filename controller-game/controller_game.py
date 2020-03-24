import serial
import socketio


# Serial configs
SERIAL_PORT = '/dev/ttyACM0'
BAUD_RATE = 9600
PARITY = serial.PARITY_NONE
STOP_BITS = serial.STOPBITS_ONE
BYTE_SIZE = serial.EIGHTBITS
TIMEOUT = 1


def initSerial():
    """
    Initializes a serial connection 
    with a controller device.
    """

    return serial.Serial(
        port=SERIAL_PORT,
        baudrate=BAUD_RATE,
        parity=PARITY,
        stopbits=STOP_BITS,
        bytesize=BYTE_SIZE,
        timeout=TIMEOUT
    )
# initSerial end


if __name__ == '__main__':

    # Connect to serial port (controller).
    device = initSerial()
