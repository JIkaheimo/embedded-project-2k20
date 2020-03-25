#include "ADKey.h"

/** BUTTON LIMIT CONSTANTS */
const uint16_t MAX_A = 200;
const uint16_t MAX_B = 3500;
const uint16_t MAX_C = 6200;
const uint16_t MAX_D = 9000;
const uint16_t MAX_E = 38000;


ADKey::ADKey(const PinName keyPin) : _pin(keyPin) 
/*
 * ADKey default constructor
 */
{
    // Initialize input reading.
    pollInput();
}


void ADKey::pollInput() 
/*
 * pollInput() reads the ADKey sensor value and updates
 * any input value dependent state variables. 
 *
 * Use isPressed(), isReleased() to check the state of the
 * component and use readPressed(), readReleased() to get
 * the corresponding buttons.
 */
{
    // Convert input value to key.
    Key key = inputToKey(_pin.read_u16());

    // Update pressed key only if it is different 
    // from the last press.
    if (_lastKey != key)
    {
        _lastKey = _pressedKey;
        _pressedKey = key;
    }
}


const bool ADKey::isPressed() const 
/*
 * isPressed() returns true if button has been pressed between
 * two consecutive pollInput() calls
 */
{
    return (_pressedKey != Key::None) && (_lastKey != _pressedKey);
}


const bool ADKey::isReleased() const
/*
 * isReleased() returns true if button has been released between
 * two consecutive pollInput() calls
 */
{
    return (_pressedKey == Key::None) && (_lastKey != Key::None);
}


const ADKey::Key ADKey::readPressed() 
/*
 * readPressed() returns the pressed key from ADKey component.
 * Use in combination with isPressed() to get better results.
 */
{
    return _pressedKey;
}

const ADKey::Key ADKey::readReleased()
/* 
 * readReleased() returns the released key from ADKey component.
 * Use in combination with isReleased() to get better results.
 */
{
    return _lastKey;
}


ADKey::Key ADKey::inputToKey(const uint16_t input) const
/**
 * inputToKey maps the given raw input value to the pressed key.
 */
{
    Key key = Key::None;

    if (input < MAX_A) 
    {
        key = ADKey::A;
    } 
    else if (input < MAX_B) 
    {
        key = Key::B;
    } 
    else if (input < MAX_C) 
    {
        key = Key::C;
    } 
    else if (input < MAX_D) 
    {
        key = Key::D;
    } 
    else if (input < MAX_E) 
    {
        key = Key::E;
    }

    return key;
}