from pynput.keyboard import Key, Controller
from functools import partial

# Create only one controller for keyboard input.
keyboard_c = Controller()


def tilt_handler(x_tilt, y_tilt, gui, socket):
    """
    # Handles joystick tilt events.
    """

    x_tilt = float(x_tilt)
    y_tilt = float(y_tilt)

    # Horizontal tilt
    if x_tilt > 0.1:
        keyboard_c.press(Key.right)
        keyboard_c.release(Key.left)
    elif x_tilt < -0.1:
        keyboard_c.press(Key.left)
        keyboard_c.release(Key.right)
    else:
        keyboard_c.release(Key.left)
        keyboard_c.release(Key.right)

    # Vertical tilt
    if y_tilt > 0.1:
        keyboard_c.press(Key.down)
        keyboard_c.release(Key.up)
    elif y_tilt < -0.1:
        keyboard_c.press(Key.up)
        keyboard_c.release(Key.down)
    else:
        keyboard_c.release(Key.up)
        keyboard_c.release(Key.down)

    # Update gui to display analog tilt.
    gui.update_analog(x_tilt, y_tilt)


def press_handler(key, gui, socket):
    """
    Handles button press events.
    """

    # Fake button press.
    keyboard_c.press(key)

    # Update gui to display button press.
    gui.press_key(*key)


def release_handler(key, gui, socket):
    """
    Handles button release events
    """
    # Fake button release.
    keyboard_c.release(key)

    # Update gui to display button release.
    gui.release_key(*key)
