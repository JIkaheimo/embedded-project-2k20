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
        struct Tilt {
            float horizontal;
            float vertical;
        };

        Joystick(PinName = A0, PinName = A1, PinName = D8);

        void pollInput();

        bool isPressed();
        bool isTilted();

        Tilt readTilt();
        bool readPressed();

    private:
        AnalogIn _vertical;
        AnalogIn _horizontal;
        DigitalIn _button;

        float _verticalCalib;
        float _horizontalCalib;

        bool _isPressed;
        bool _pressed;
        bool _lastPressed;

        float _verticalData;
        float _horizontalData;
        Tilt _tilt;
};