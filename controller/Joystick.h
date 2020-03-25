#include "mbed.h"

class Joystick 
/* 
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
 */
{
    public:
        /*
         * Struct for organizing joystick position.
         */
        struct Tilt 
        {
            float horizontal = 0.0f;
            float vertical = 0.0f;
        };


        /*
         * Joystick default constructor
         */
        Joystick(PinName horizontalPin = A0, PinName verticalPin = A1, PinName buttonPin = D8);


        /*
         * pollInput() reads Joystick sensor values and updates
         * any input value dependent state variables.
         *
         * Use isTilted(), isPressed(), isReleased() to check the state of the
         * component and use readTilt() to access the position of joystick.
         */
        void pollInput();

        
        /*
         * isPressed() returns true if button has been pressed between
         * two consecutive pollInput() calls
         */
        const bool isPressed() const;


        /*
         * isReleased() returns true if button has been released between
         * two consecutive pollInput() calls
         */
        const bool isReleased() const;


        /*
         * isTilted() returns true if joystick is being tilted.
         * (not in rest)
         */
        const bool isTilted() const;


        /*
         * readTilt() returns the orientation of joystick.
         * Use in combination with isTilted() to get better results.
         */
        Tilt readTilt();

    private:
        // Pins
        AnalogIn _vertical;
        AnalogIn _horizontal;
        DigitalIn _button;

        // Calibration
        float _verticalCalib;
        float _horizontalCalib;

        bool _pressed;
        bool _lastPressed;

        Tilt _tilt;
};