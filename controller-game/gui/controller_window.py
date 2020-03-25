import tkinter as tk
from enum import Enum


class ControllerWindow(tk.Frame):

    WIDTH = 400
    HEIGHT = 210

    JOY_BASE_X = 100
    JOY_BASE_Y = 100
    JOY_BASE_RADIUS = 40

    JOY_RADIUS = 10

    KEYS_BASE_X = 200
    KEYS_BASE_Y = 50

    COLOR_INACTIVE = "#bbbbbb"
    COLOR_ACTIVE = "#8c5259"

    def __init__(self, master=None):
        super().__init__(master=master)

        # INITIALIZE CANVAS
        self.__canvas = tk.Canvas(
            self, width=self.WIDTH, height=self.HEIGHT)

        self.__create_circle(self.JOY_BASE_X,
                             self.JOY_BASE_Y, self.JOY_BASE_RADIUS)

        self.__analog_stick = self.__create_circle(
            0, 0, self.JOY_RADIUS)

        self.__label = tk.Label(self)
        self.__label["text"] = "asd"
        self.__label.pack()

        # Create button rectangles.
        self.__buttons = self.__create_keys(
            self.KEYS_BASE_X, self.KEYS_BASE_Y)

        # Add analog stick as button.
        self.__buttons["J"] = self.__analog_stick

        self.__canvas.pack()
        self.pack()

        self.update_analog(0, 0)
    # __init__ end

    def __conf(self, setting):
        return self.__config[setting].value

    def update_analog(self, x, y):

        # Get analog circle center coordinate.
        analog_x = self.JOY_BASE_X + x * self.JOY_BASE_RADIUS
        analog_y = self.JOY_BASE_X + y * self.JOY_BASE_RADIUS

        self.__label["text"] = "X: {}, Y: {}".format(x, y)

        self.__canvas.coords(self.__analog_stick, analog_x - self.JOY_RADIUS, analog_y -
                             self.JOY_RADIUS, analog_x + self.JOY_RADIUS, analog_y + self.JOY_RADIUS)

        """
  self.after(100, self.update_analog,
              self._ANALOG_BASE_X, self._ANALOG_BASE_Y)
              """

    def __create_circle(self, x, y, r, **kwargs):
        return self.__canvas.create_oval(x - r, y - r, x + r, y + r, **kwargs)

    def __create_rectangle(self, x, y, width=40, height=40, **kwargs):
        return self.__canvas.create_rectangle(x, y, x + width, y + height, **kwargs)

    def press_key(self, key):
        """
        press_key(self, key) displays a key press for
        the specific key.
        """

        # Get the key based on the given key code
        pressed = self.__buttons.get(key)

        # Set button as "pressed" (update fill color)
        self.__update_fill(pressed, self.COLOR_ACTIVE)

    def release_key(self, key):
        released = self.__buttons.get(key)

        self.__update_fill(released, self.COLOR_INACTIVE)

    # press_key end

    def __create_keys(self, start_x=400, start_y=10,  keycodes=["A", "B", "C", "D", "E"], keys_per_row=3):
        x_index = 0
        y_index = 0

        keys = {}

        for keycode in keycodes:
            # Get correct position for button
            key_x = start_x + 50 * x_index
            key_y = start_y + 50 * y_index

            # Create button rectangle.
            keys[keycode] = self.__create_rectangle(
                key_x, key_y, fill=self.COLOR_INACTIVE)

            # Create button text.
            self.__canvas.create_text(key_x + 20, key_y + 20, text=keycode)

            x_index += 1

            if x_index == keys_per_row:
                x_index = 0
                y_index += 1

        return keys
    # __create_keys end

    def __update_fill(self, component, fill):
        self.__canvas.itemconfig(component, fill=fill)
    # __update_fill end
