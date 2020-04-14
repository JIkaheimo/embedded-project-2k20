import serial
import serial.tools.list_ports
import socketio
import tkinter as tk

from pynput.keyboard import Key, Controller
from pynput import mouse


from gui import ControllerWindow

import sys

import threading

from functools import partial


lock = threading.Lock()

controllerWindow = ControllerWindow()

sio = socketio.Client()
sio.connect('http://localhost:5000')
print('my sid is', sio.sid)

keyboard = Controller()
mouseInput = mouse.Controller()
# Input event handlers


def joystickTiltHandler(x_tilt, y_tilt):
    x_tilt = float(x_tilt)
    y_tilt = float(y_tilt)

    if x_tilt > 0.05:
        keyboard.press(Key.left)
        keyboard.release(Key.right)
    elif x_tilt < -0.05:
        keyboard.press(Key.right)
        keyboard.release(Key.left)
    else:
        keyboard.release(Key.left)
        keyboard.release(Key.right)

    controllerWindow.update_analog(x_tilt, y_tilt)


def transmitPress(key):
    controllerWindow.press_key(*key)


def transmitRelease(key):
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


def read_serial(port):

    device = initSerial(port)

    buffer = []

    device.open()

    if not device.isOpen():
        print("Error connecting to serial port {}.".format(port))
        exit()

    while True:
        inputFromDevice = device.readline().decode('utf-8').rstrip()

        # Filter out empty events.
        if len(inputFromDevice) == 0:
            continue

        # Parse input
        input = inputFromDevice.split(" ")

        event = input[0]
        params = input[1:len(input)]
        eventMapper.get(event)(*params)


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

    # Create different thread to read serial input.
    try:
        serialThread = threading.Thread(
            target=read_serial, args=(nucleoPort, ))

        serialThread.daemon = True
        serialThread.start()
    except:
        print("Unable to open thread for reading serial data.")

    # Main loop
    try:
        controllerWindow.mainloop()
    except KeyboardInterrupt:
        exit()
