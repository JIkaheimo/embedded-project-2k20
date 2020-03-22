#include "mbed.h"

/* Serial configs */
const int BAUD_RATE = 9600;

Serial device(USBTX, USBRX);


/* Joystick configs */
const PinName JOYSTICK_X = A0;
const PinName JOYSTICK_Y = A1;
const PinName JOYSTICK_BTN = D8;

AnalogIn JoystickX(JOYSTICK_X);
AnalogIn JoystickY(JOYSTICK_Y);
DigitalIn JoystickButton(JOYSTICK_BTN, PullUp);


void setup()
{
    device.baud(BAUD_RATE);
}


void loop()
{
    while (true)
    {
        device.printf("Hello serial!\n");
    }
}


int main()
{
    setup();
    loop();
}

