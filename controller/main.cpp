#include "mbed.h"

/****************** 
 * SERIAL CONFIGS * 
 ******************/
const int BAUD_RATE = 9600;

Serial device(USBTX, USBRX);


/******************** 
 * JOYSTICK CONFIGS *
 ********************
 * 
 * (KY-023 Joystick module)
 * 
 * X values:
 * - 0V     = tilted left
 * - 1.65V  = resting
 * - 3.3V   = tilted right
 *
 * Y values:
 * - 0V     = tilted up
 * - 1.65V  = at rest
 * - 3.3V   = tilted down
 *
 */
const PinName JOYSTICK_X = A0;
const PinName JOYSTICK_Y = A1;
const PinName JOYSTICK_BTN = D8;

const float JOYSTICK_X_OFFSET = +0.0015;
const float JOYSTICK_Y_OFFSET = -0.011;

AnalogIn    joystickPinX(JOYSTICK_X);
AnalogIn    joystickPinY(JOYSTICK_Y);
DigitalIn   joystickPinButton(JOYSTICK_BTN, PullUp); // Use pullup for joystick button

float   joystickX, joystickY;
bool    joystickButton;

void readJoystick(float& x, float& y, bool& button);


void setup()
{
    device.baud(BAUD_RATE);
}


void loop()
{
    while (true)
    {
        readJoystick(joystickX, joystickY, joystickButton);

        device.printf("X: %.2f, Y: %.2f, JBTN: %s\n", joystickX, joystickY, joystickButton ? "true" : "false");
    }
}


int main()
{
    setup();
    loop();
}


void readJoystick(float& x, float& y, bool& button)
/**
 * readJoystick reads input from KY-023 Joystick module (XY-Axis).
 * 
 * x in [-1, 1]
 * y in [-1, 1]
 */
{
    x = 2 * (joystickPinX.read() - 0.5 + JOYSTICK_X_OFFSET);
    y = 2 * (joystickPinY.read() - 0.5 + JOYSTICK_Y_OFFSET);
    button = joystickPinButton.read() == 0;
}