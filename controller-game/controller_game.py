import serial
import serial.tools.list_ports
import socketio
import tkinter as tk

from gui import ControllerWindow
from functools import partial

from pynput.keyboard import Key, Controller
from pynput import mouse

import sys
import threading
from time import sleep

root = tk.Tk()
controllerWindow = ControllerWindow(root)

sio = socketio.Client()

keyboard = Controller()
mouseInput = mouse.Controller()


def joystickTiltHandler(x_tilt, y_tilt):
    ####################################
    # Handles joystick tilt events.
    ####################################

    x_tilt = float(x_tilt)
    y_tilt = float(y_tilt)

    # Map tilt to arrow key press.
    if x_tilt > 0.05:
        keyboard.press(Key.left)
        keyboard.release(Key.right)
    elif x_tilt < -0.05:
        keyboard.press(Key.right)
        keyboard.release(Key.left)
    else:
        keyboard.release(Key.left)
        keyboard.release(Key.right)

    # Update window to display analog tilt.
    controllerWindow.update_analog(x_tilt, y_tilt)


def transmitPress(key):
    ##################################
    # Handles button press events.
    #################################

    # Update window to display button press.
    controllerWindow.press_key(*key)


def transmitRelease(key):
    ###################################
    # Handles button release events
    ##################################

    # Update window to display button release.
    controllerWindow.release_key(*key)


eventMapper = {
    "Joystick:ButtonPress":     partial(transmitPress, "J"),
    "Joystick:ButtonRelease":   partial(transmitRelease, "J"),
    "Joystick:Tilt":            joystickTiltHandler,
    "ADKey:ButtonPress":        transmitPress,
    "ADKey:ButtonRelease":      transmitRelease
}


def initSerial(port):
    """
    Initializes a serial connection
    with a controller device in the given port.
    """

    device = serial.Serial()

    device.port = port
    device.baudrate = 9600

    device.bytesize = serial.EIGHTBITS
    device.parity = serial.PARITY_NONE
    device.stopbits = serial.STOPBITS_ONE

    # device.timeout = 0
    device.rtscts = False
    device.dsrdtr = False
    device.xonxoff = False

    return device
# initSerial end


class SerialThread(threading.Thread):
    #########################################################################
    # SerialThread handles the serial communication with Nucleo devices and
    # maps the read data to event handlers (if it can be mapped)...
    #########################################################################

    # Set this variable to kill the thread.
    __isRunning = False
    # State props.
    isDeviceOpen = False

    __device = None

    def start(self, serialDevice):
        # Try to open a connection to serial device.
        self.__device = serialDevice
        self.__device.open()
        self.daemon = True
        self.isDeviceOpen = self.__device.isOpen()
        return super().start()

    def run(self):
        if not self.isDeviceOpen:
            raise Exception(
                "Could not establish a serial connection with the given device...")

        self.__isRunning = True

        while self.__isRunning:
            # Parse serial data from the device.
            inputFromDevice = self.__device.readline().decode('utf-8').rstrip()

            # Filter out empty events.
            if len(inputFromDevice) == 0:
                continue

            # Parse input = map event and params.
            input = inputFromDevice.split(" ")
            event = input[0]
            params = input[1:len(input)]

            # Map input to handler function.
            try:
                eventMapper.get(event)(*params)
            except:
                print("Error reading data from serial... Trying to read again.")

    def kill(self):
        self.__isRunning = False
        self.__device.close()


if __name__ == '__main__':

    nucleoPort = None

    # Get port number for Nucleo.
    for port, identifier, _ in serial.tools.list_ports.comports():
        if (identifier.startswith("STMicroelectronics")):
            nucleoPort = port

    # Make sure nucleo is detected
    if nucleoPort == None:
        print("Could not detect connected Nucleo. Please make sure it is correctly connected...")
        sys.exit()

    # Create separate thread for reading data from Nucleo through serial.
    serialThread = SerialThread()
    serialThread.start(initSerial(nucleoPort))

    # Connect to the erver. TODO: Get game data from server.
    sio.connect('https://embedded-project.herokuapp.com')

    try:
        # controllerWindow blocks execution until exit or keyboard interrupt.
        controllerWindow.mainloop()
    except:
        root.destroy()

    # Cleanup...
    print('Killing serial thread...')
    serialThread.kill()

    sleep(1)

    print('Closing connection with server...')

    sio.disconnect()

    sleep(1)

    print('Done!')

    sys.exit()
