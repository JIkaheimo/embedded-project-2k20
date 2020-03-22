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

float   joystickX = 0.0f, 
        joystickY = 0.0f;

bool    joystickButton = false;

void readJoystick(float& x, float& y, bool& button);


/*****************
 * ADKEY CONFIGS *
 *****************
 *
 * Button layout:
 *
 * A   B
 * C D E
 *
 */
const int A_MIN = 0;
const int A_MAX = 5;

const int B_MIN = 40;
const int B_MAX = 50;

const int C_MIN = 80;
const int C_MAX = 99;

const int D_MIN = 100;
const int D_MAX = 150;

const int E_MIN = 500;
const int E_MAX = 550;

const PinName ADKEY = A2;

AnalogIn adkeyPin(ADKEY);

void readADKey(bool&, bool&, bool&, bool&, bool&);

bool    buttonA = false, 
        buttonB = false, 
        buttonC = false, 
        buttonD = false, 
        buttonE = false;


void setup()
{
    device.baud(BAUD_RATE);
}


void loop()
{
    while (true)
    {
        readJoystick(joystickX, joystickY, joystickButton);
        readADKey(buttonA, buttonB, buttonC, buttonD, buttonD);

        // Send controller state to serial device.
        device.printf("X: %.2f, Y: %.2f, J: %s, A: %s, B: %s, C: %s, D: %s, E: %s\n", 
            joystickX, 
            joystickY, 
            joystickButton  ? "true" : "false",
            buttonA         ? "true" : "false",
            buttonB         ? "true" : "false",
            buttonC         ? "true" : "false",
            buttonD         ? "true" : "false",
            buttonE         ? "true" : "false"
        );
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


void readADKey(
    bool& buttonA, 
    bool& buttonB, 
    bool& buttonC, 
    bool& buttonD, 
    bool& buttonE
)
{
    buttonA = false;
    buttonB = false;
    buttonC = false;
    buttonD = false;
    buttonE = false;

    float reading = adkeyPin.read();

    if (reading < 0.001) {
        buttonA = true;
    } else if (reading < 0.05) {
        buttonB = true;
    } else if (reading < 0.1) {
        buttonC = true;
    } else if (reading < 0.15) {
        buttonD = true;
    } else if (reading < 0.6) {
        buttonE = true;
    }
}