#include "Joystick.h"

const uint8_t CALIB_COUNT = 10;


Joystick::Joystick(const PinName horizontalPin, const PinName verticalPin, const PinName buttonPin) : 
    _horizontal(horizontalPin),
    _vertical(verticalPin), 
    _button(buttonPin, PullUp)
/*
 * Joystick default constructor.
 */
{
    // "Automatically" try to calibrate joystick axis readings.
    
    float xSumCalib = 0;
    float ySumCalib = 0;

    for (uint8_t iCalib = 0; iCalib < CALIB_COUNT; iCalib++)
    {
        xSumCalib += _vertical.read();
        ySumCalib += _horizontal.read();
    }
    _verticalCalib = xSumCalib / CALIB_COUNT;
    _horizontalCalib = ySumCalib / CALIB_COUNT;

    pollInput();
}


void Joystick::pollInput()
/*
 * pollInput() reads Joystick sensor values and updates
 * any input value dependent state variables.
 *
 * Use isTilted(), isPressed(), isReleased() to check the state of the
 * component and use readTilt() to access the position of joystick.
 */
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
/*
 * readTilt() returns the orientation of joystick.
 * Use in combination with isTilted() to get better results.
 */
{
    Tilt tempTilt;
    tempTilt = _tilt;
    
    _tilt.horizontal = 0.0f;
    _tilt.vertical = 0.0f;

    return tempTilt;
}


const bool Joystick::isTilted() const
/*
 * isTilted() returns true if joystick is being tilted.
 * (not in rest)
 */
{
    return (abs(_tilt.horizontal) + abs(_tilt.vertical)) > 0.02f;
}


const bool Joystick::isPressed() const 
/*
 * isPressed() returns true if button has been pressed between
 * two consecutive pollInput() calls
 */
{
    return (_pressed == true) && (_lastPressed != _pressed);
}


const bool Joystick::isReleased() const
/*
 * isReleased() returns true if button has been released between
 * two consecutive pollInput() calls
 */
{
    return (_pressed == false) && (_lastPressed != _pressed);
}


