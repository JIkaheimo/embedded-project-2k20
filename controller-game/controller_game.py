import serial
import serial.tools.list_ports
import socketio
import tkinter as tk

import sys

import threading


lock = threading.Lock()


class Window(tk.Frame):

    def __init__(self, master=None):
        super().__init__(master=master)
        self.pack()

        self._ANALOG_BASE_X = 100
        self._ANALOG_BASE_Y = 100
        self._ANALOG_BASE_RADIUS = 40

        self._ANALOG_STICK_RADIUS = 10

        self.analog_stick = None

        self.label = tk.Label(self)
        self.label["text"] = "asd"
        self.label.pack()

        self.canvas = tk.Canvas(self, width=600, height=400)
        self.create_circle(self._ANALOG_BASE_X,
                           self._ANALOG_BASE_Y, self._ANALOG_BASE_RADIUS)
        self.analog_stick = self.create_circle(
            0, 0, self._ANALOG_STICK_RADIUS)
        self.canvas.pack()

    def update_analog(self, x, y):

        # Get analog circle center coordinate.
        analog_x = self._ANALOG_BASE_X + x * \
            self._ANALOG_BASE_RADIUS

        analog_y = self._ANALOG_BASE_Y + y * \
            self._ANALOG_BASE_RADIUS

        self.label["text"] = "X: {}, Y: {}".format(analog_x, analog_y)

        self.canvas.coords(self.analog_stick, analog_x - self._ANALOG_STICK_RADIUS, analog_y -
                           self._ANALOG_STICK_RADIUS, analog_x + self._ANALOG_STICK_RADIUS, analog_y + self._ANALOG_STICK_RADIUS)

        """
        self.after(100, self.update_analog,
                   self._ANALOG_BASE_X, self._ANALOG_BASE_Y)
                   """

    def create_circle(self, x, y, r, **args):
        return self.canvas.create_oval(x - r, y - r, x + r, y + r, **args)

    def analog_button_click(self, state):
        if state:
            self.canvas.itemconfig(self.analog_stick, fill="#F00")
            self.after(100, self.analog_button_click, False)
        else:
            self.canvas.itemconfig(self.analog_stick, fill="#BBB")


window = Window()

# Input event handlers


def joystickButtonHandler(_):
    window.analog_button_click(True)


def joystickTiltHandler(tilt):
    window.update_analog(float(tilt[0]), float(tilt[1]))
    window.analog_button_click(False)


def adkeyHandler(socket, key):
    pass


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

        window.mainloop()
    except KeyboardInterrupt:
        exit()
