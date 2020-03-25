#include "mbed.h"

#include "ADKey.h"
#include "Joystick.h"


/********************* 
 ** SERIAL CONFIGS  ** 
 *********************/
const int BAUD_RATE = 9600;

Serial device(USBTX, USBRX);


/**********************
 ** JOYSTICK CONFIGS ** 
 **********************/
const PinName X_JOY = A0;
const PinName Y_JOY = A1;
const PinName B_JOY = D8;

Joystick joystick(X_JOY, Y_JOY, B_JOY);


/***********************
 **   ADKEY CONFIGS   **
 ***********************/
const PinName ADKEY = A2;

ADKey buttons(ADKEY);


/***********************
 **      SETUP        **
 ***********************/
void setup()
{
    device.baud(BAUD_RATE);

    // Initialize sensors.
    buttons.pollInput();
    joystick.pollInput();
}


/************************
 **        LOOP        **
 ************************/
void loop()
{
    while (true)
    {
        /********** ADKEY ***************/

        // Poll for ADKey input.
        buttons.pollInput();
        
        // Check for ADKey input events.
        if (device.writable() && buttons.isPressed()) 
        {
            device.printf("%c\n", buttons.readKey());
        }

        /********** JOYSTICK ************/

        // Poll for Joystick input.
        joystick.pollInput();

        // Check is device writable.
        if (device.writable())
        {
            // Check for Joystick input events.
            if (joystick.isPressed()) 
            {
                joystick.readPressed();
                device.printf("JB\n");
            } 
            
            if (joystick.isTilted()) 
            {
                Joystick::Tilt tilt = joystick.readTilt();
                device.printf("JT %.2f %.2f\n", tilt.horizontal, tilt.vertical);
            }
        }
    }
}


/*******************
 **     MAIN      **
 *******************/
int main()
{
    setup();
    loop();
}
