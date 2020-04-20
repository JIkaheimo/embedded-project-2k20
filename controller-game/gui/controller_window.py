import tkinter as tk
import webbrowser


class ControllerWindow(tk.Frame):

    WIDTH = 400
    HEIGHT = 230

    JOY_BASE_X = 100
    JOY_BASE_Y = 100
    JOY_BASE_RADIUS = 40

    JOY_RADIUS = 10

    KEYS_BASE_X = 200
    KEYS_BASE_Y = 50

    COLOR_INACTIVE = '#bbbbbb'
    COLOR_ACTIVE = '#8c5259'

    #########################################
    # Constructor                           #
    #########################################

    def __init__(self, master=None):
        super().__init__(master=master)

        # INITIALIZE CANVAS
        self.__canvas = tk.Canvas(
            self, width=self.WIDTH, height=self.HEIGHT)

        self.__create_circle(self.JOY_BASE_X,
                             self.JOY_BASE_Y, self.JOY_BASE_RADIUS)

        self.__analog_stick = self.__create_circle(
            0, 0, self.JOY_RADIUS)

        self.__joystick_label = tk.Label(self)
        self.__joystick_label.pack()

        # Create button rectangles.
        self.__buttons = self.__create_keys(
            self.KEYS_BASE_X, self.KEYS_BASE_Y, ['A', 'B', 'C', 'D', 'E'], 3)

        # Add analog stick as button.
        self.__buttons['J'] = self.__analog_stick

        self.__canvas.pack()

        # Game launch button.
        self.__launch_button = tk.Button(self)
        self.__launch_button['text'] = 'Launch the game'
        self.__launch_button['command'] = self.__launch_game
        self.__launch_button.pack()

        # Controller status label.
        self.__status_label = tk.Label(self)
        self.__status_label.pack()

        self.pack()

        self.update_analog(0, 0)
    # __init__ end

    ###############################################
    # Public methods                              #
    ###############################################

    def press_key(self, key):
        """
        press_key displays a key press for
        the specific key.
        """

        # Get the key based on the given key code
        pressed = self.__buttons.get(key)

        # Set button as 'pressed' (update fill color)
        self.__update_fill(pressed, self.COLOR_ACTIVE)
    # press_key end

    def release_key(self, key):
        released = self.__buttons.get(key)

        self.__update_fill(released, self.COLOR_INACTIVE)
    # release_key end

    def update_status(self, status_text, is_enabled=True):

        # Update status text.
        self.__status_label['text'] = status_text

        # Enable/disable child components.
        if is_enabled:
            enable = 'normal'
        else:
            enable = 'disable'

        for child in self.winfo_children():
            child.configure(state=enable)
    # update_status end

    def update_analog(self, x, y):

        # Get analog circle center coordinate.
        analog_x = self.JOY_BASE_X + x * self.JOY_BASE_RADIUS
        analog_y = self.JOY_BASE_X + y * self.JOY_BASE_RADIUS

        self.__joystick_label['text'] = 'X: {}, Y: {}'.format(x, y)

        self.__canvas.coords(self.__analog_stick, analog_x - self.JOY_RADIUS, analog_y -
                             self.JOY_RADIUS, analog_x + self.JOY_RADIUS, analog_y + self.JOY_RADIUS)
    # update_analog end

    ############################################
    # Private methods                          #
    ############################################

    def __create_circle(self, x, y, radius, **kwargs):
        return self.__canvas.create_oval(x - radius, y - radius, x + radius, y + radius, **kwargs)
    # __create_circle end

    def __create_rectangle(self, x, y, width=40, height=40, **kwargs):
        return self.__canvas.create_rectangle(x, y, x + width, y + height, **kwargs)
    # __create_rectangle end

    def __create_keys(self, start_x, start_y,  keycodes, keys_per_row):
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

    def __launch_game(self):
        webbrowser.open('https://embedded-project.herokuapp.com/')
    # __launch_game end
