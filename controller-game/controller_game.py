import serial
import serial.tools.list_ports
import socketio
import tkinter as tk

from gui import ControllerWindow

import sys

import threading

from functools import partial


lock = threading.Lock()

controllerWindow = ControllerWindow()

# Input event handlers


def joystickButtonHandler(_):
    controllerWindow.press_key("J")


def joystickTiltHandler(tilt):
    x_tilt, y_tilt = [float(num) for num in tilt]
    controllerWindow.update_analog(x_tilt, y_tilt)


def adkeyHandler(key):
    controllerWindow.press_key(*key)


eventMapper = {
    "Joystick:Button":  joystickButtonHandler,
    "Joystick:Tilt":    joystickTiltHandler,
    "ADKey:Button":     adkeyHandler


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

        eventMapper.get(event)(params)


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

    # Create two threads as follows
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
