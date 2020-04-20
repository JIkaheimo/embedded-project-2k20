from functools import partial

from utils.handlers import input_handlers as inputs

#######################################
# INPUT CODES                         #
#######################################

JOYSTICK_PRESS = 'Joystick:ButtonPress'
JOYSTICK_RELEASE = 'Joystick:ButtonRelease'
JOYSTICK_TILT = 'Joystick:Tilt'
BUTTON_PRESS = 'ADKey:ButtonPress'
BUTTON_RELEASE = 'ADKey:ButtonRelease'


######################################
# INPUT MAP                          #
######################################

input_mapper = {
    JOYSTICK_PRESS: partial(inputs.press_handler, 'J'),
    JOYSTICK_RELEASE: partial(inputs.release_handler, 'J'),
    JOYSTICK_TILT: inputs.tilt_handler,
    BUTTON_PRESS: inputs.press_handler,
    BUTTON_RELEASE: inputs.release_handler
}

######################################
# INPUT MAPPER                       #
######################################


def input_to_handler(gui, socket, input):
    """
    Maps the serial input to the corresponding input handler.
    Also passes down gui and socket.

    @Params
    gui of the application
    socket for client-server communication
    input read from serial
    """

    event = input[0]
    params = input[1:len(input)]
    callback = input_mapper.get(event)

    if callback is not None:
        try:
            callback(*params, gui, socket)
        except:
            pass
