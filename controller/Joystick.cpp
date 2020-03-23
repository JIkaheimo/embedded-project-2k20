#include "Joystick.h"

Joystick::Joystick(const PinName horizontalPin, const PinName verticalPin, const PinName buttonPin) : 
    _horizontal(horizontalPin),
    _vertical(verticalPin), 
    _button(buttonPin, PullUp) 
{
    // "Automatically" calibrate joystick axis data.
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
    _horizontalData = horizontalRaw * sqrt(1.0f - pow(verticalRaw, 2.0f) / 2.0f);
    _verticalData = verticalRaw * sqrt(1.0f - pow(horizontalRaw, 2.0f) / 2.0f);
    _tilt.vertical = _verticalData;
    _tilt.horizontal = _horizontalData;

    bool pressed = _button.read() == 0;
    if (_lastPressed != pressed)
    {
        _lastPressed = _pressed;
        _pressed = pressed;
    }

}

Joystick::Tilt Joystick::readTilt()
{
    _horizontalData = 0.0f;
    _verticalData = 0.0f;
    return _tilt;
}

bool Joystick::isTilted()
/**
 * isTilted() returns true if the analog stick is tilted.
 */
{
    return (abs(_horizontalData) + abs(_verticalData)) > 0.02f;
}

bool Joystick::isPressed()
{
    return _pressed != false;
}

bool Joystick::readPressed()
{
    // Reset keys' state.
    _lastPressed = _pressed;
    _pressed = false;

    return _lastPressed;
}
