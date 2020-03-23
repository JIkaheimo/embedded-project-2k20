#include "Joystick.h"

Joystick::Joystick(const PinName horizontalPin, const PinName verticalPin, const PinName buttonPin) : 
    _horizontal(horizontalPin),
    _vertical(verticalPin), 
    _button(buttonPin, PullUp) 
{
    // "Automatically" try to calibrate joystick axis readings.
    _verticalCalib = _vertical.read();
    _horizontalCalib = _horizontal.read();

    pollInput();
}


void Joystick::pollInput()
{
    // Read raw sensor data and scale it to range [0, 1]
    float horizontalRaw =   2.0f * (_horizontal.read() - _horizontalCalib);
    float verticalRaw =     2.0f * (_vertical.read() - _verticalCalib); 
    
    // Convert raw sensor data to circular grid.
    _tilt.horizontal = horizontalRaw * sqrt(1.0f - pow(verticalRaw, 2.0f) / 2.0f);
    _tilt.vertical = verticalRaw * sqrt(1.0f - pow(horizontalRaw, 2.0f) / 2.0f);
    
    bool pressed = _button.read() == 0;
    if (_lastPressed != pressed)
    {
        _lastPressed = _pressed;
        _pressed = pressed;
    }

}

Joystick::Tilt Joystick::readTilt()
{
    Tilt tempTilt;
    tempTilt = _tilt;
    
    _tilt.horizontal = 0.0f;
    _tilt.vertical = 0.0f;

    return tempTilt;
}

const bool Joystick::isTilted() const
/**
 * isTilted() returns true if the analog stick is tilted.
 */
{
    return (abs(_tilt.horizontal) + abs(_tilt.vertical)) > 0.02f;
}


const bool Joystick::isPressed() const
{
    return _pressed;
}


const bool Joystick::readPressed()
{
    // Reset keys' state.
    _lastPressed = _pressed;
    _pressed = false;

    return _lastPressed;
}
