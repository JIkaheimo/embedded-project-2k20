import tkinter as tk

COLORS.INACTIVE = "#BBB"


class ControllerWindow(tk.Frame):

    def __init__(self, master=None):
        super().__init__(master=master)

        # INITIALIZE APP CONFIGS

        self.__COLORS = {}
        self.__COLORS["INACTIVE"] = "#BBB"
        self.__COLORS["ACTIVE"] = "#8c5259"

        self.__ANALOG_BASE_X = 100
        self.__ANALOG_BASE_Y = 100
        self.__ANALOG_BASE_RADIUS = 40

        self.__ANALOG_STICK_RADIUS = 10

        # INITIALIZE CANVAS

        self.__canvas = tk.Canvas(self, width=600, height=400)

        self.__create_circle(self.__ANALOG_BASE_X,
                             self.__ANALOG_BASE_Y, self.__ANALOG_BASE_RADIUS)

        self.__analog_stick = self.__create_circle(
            0, 0, self.__ANALOG_STICK_RADIUS)

        self.__label = tk.Label(self)
        self.__label["text"] = "asd"
        self.__label.pack()

        # Create button rectangles.
        self.__buttons = self.__create_keys(400, 10)
        self.__buttons["J"] = self.__analog_stick

        self.__canvas.pack()

        self.update_analog(0, 0)

        self.pack()
    # __init__ end

    def update_analog(self, x, y):

        # Get analog circle center coordinate.
        analog_x = self.__ANALOG_BASE_X + x * self.__ANALOG_BASE_RADIUS

        analog_y = self.__ANALOG_BASE_Y + y * self.__ANALOG_BASE_RADIUS

        self.__label["text"] = "X: {}, Y: {}".format(x, y)

        self.__canvas.coords(self.__analog_stick, analog_x - self.__ANALOG_STICK_RADIUS, analog_y -
                             self.__ANALOG_STICK_RADIUS, analog_x + self.__ANALOG_STICK_RADIUS, analog_y + self.__ANALOG_STICK_RADIUS)

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
        self.__update_fill(pressed, self.__COLORS.get("ACTIVE"))

        # Update button to default state after 100ms
        self.after(100, lambda: self.__update_fill(
            pressed, self.__COLORS.get("INACTIVE")))

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
                key_x, key_y, fill=self.__COLORS.get("INACTIVE"))

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
