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
const PinName HORIZONTAL_JOY = A0;
const PinName VERTICAL_JOY = A1;
const PinName BUTTON_JOY = D8;
const uint16_t JOY_DEBOUNCE = 20;

Timer joystickTimer;
Joystick joystick(HORIZONTAL_JOY, VERTICAL_JOY, BUTTON_JOY);


/***********************
 **   ADKEY CONFIGS   **
 ***********************/
const PinName ADKEY = A2;
const uint16_t ADKEY_DEBOUNCE = 50;

Timer adkeyTimer;
ADKey buttons(ADKEY);


/************************
 **    HELPER FUNCS    **
 ************************/
void handleADKey();
void handleJoystick();


/***********************
 **      SETUP        **
 ***********************/
void setup()
{
    device.baud(BAUD_RATE);

    // Initialize tickers/timers
    joystickTimer.start();
    adkeyTimer.start();

    // Initialize sensors.
    buttons.pollInput();
    joystick.pollInput();
}


/************************
 **        LOOP        **
 ************************/
void loop()
{
    handleADKey();
    handleJoystick();
}


/*******************
 **     MAIN      **
 *******************/
int main()
{
    setup();
    while (true)
    {
        loop();
    }
}


/*******************
 **  HELPER FUNCS **
 *******************/

void handleADKey()
/* 
 * handleADKey() handles the input polling and 
 * event processing of ADKey component.
 */
{
    if (adkeyTimer.read_ms() >= ADKEY_DEBOUNCE) 
    {
        // Poll for ADKey input.
        buttons.pollInput();

        // Check for ADKey input events.

        if (buttons.isPressed())
        {
            device.printf("ADKey:ButtonPress %c\n", buttons.readPressed());
        } 
        
        if (buttons.isReleased())
        {
            device.printf("ADKey:ButtonRelease %c\n", buttons.readReleased());
        }

        adkeyTimer.reset();
    }
}


void handleJoystick()
/*
 * handleJoystick() handles the input polling and event 
 * processing of Joystick component.
 */
{
    if (joystickTimer.read_ms() >= JOY_DEBOUNCE)
    {
        // Poll for Joystick input.
        joystick.pollInput();

        // Check for joystick events.

        if (joystick.isPressed()) 
        {
            device.printf("Joystick:ButtonPress\n");
        } 

        if (joystick.isReleased())
        {
            device.printf("Joystick:ButtonRelease\n");
        }
        

        Joystick::Tilt tilt = joystick.readTilt();
        device.printf("Joystick:Tilt %.2f %.2f\n", tilt.horizontal, tilt.vertical);


        joystickTimer.reset();
    }
}