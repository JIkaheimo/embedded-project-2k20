
from sys import stdout as out
from time import sleep


def wait_handler(handler_fnc, wait_text='Waiting...', max_dots=3, second_interval=0.5):
    """
    Helper function for handling the display process of on-going operation to the user and the actual operation.
    When a value is returned from handler_fnc wait handler finishes and returns the gotten value.
    """

    dot_counter = 1
    value = handler_fnc()

    # Iterate until a valid value is gotten.
    while value is None:
        # Add the wait text.
        if dot_counter == 1:
            out.write(wait_text)

        # Calculate the trailing dots.
        num_of_dots = dot_counter % (max_dots + 1)

        # Handle writing for the trailing dots.
        out.write('.' * num_of_dots)
        out.write(' ' * (max_dots - num_of_dots))
        out.flush()
        out.write('\b' * max_dots)

        # Wait for some time before new try.
        sleep(second_interval)

        value = handler_fnc()

        dot_counter += 1

    # Clear stdout
    out.write('\r')
    out.flush()

    return value

