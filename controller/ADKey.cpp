#include "ADKey.h"

/** CONSTANTS */
const uint16_t MAX_A = 200;
const uint16_t MAX_B = 3500;
const uint16_t MAX_C = 6200;
const uint16_t MAX_D = 9000;
const uint16_t MAX_E = 38000;

const uint16_t DEBOUNCE_DELAY = 50;


ADKey::ADKey(const PinName keyPin) : _pin(keyPin), _timer() {
    _timer.start();

    // Initialize input reading.
    pollInput();
}


void ADKey::pollInput() 
/*
 * pollInput() reads the ADKey sensor value and updates
 * any input value dependent state variables. 
 *
 * Use isPressed() and readKey() to check and access
 * any newly pressed keys.
 */
{
    // Add small debounce delay.
    if (_timer.read_ms() < DEBOUNCE_DELAY) {
        return;
    }

    // Convert input value to key.
    ADKey::Key key = inputToKey(_pin.read_u16());

    // Reset timer for debouncing.
    _timer.reset(); 
    
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
 * isPressed returns true if button has been pressed
 * since the last time of reading the key.
 */
{
    return _pressedKey != ADKey::Key::None;
}


const ADKey::Key ADKey::readKey() 
/**
 * readKey is used to get the pressed key of ADKey component.
 * Also clears the pressed key and re-initializes the component for reading.
 */
{
    // Reset keys' state.
    _lastKey = _pressedKey;
    _pressedKey = ADKey::Key::None;

    return _lastKey;
}


ADKey::Key ADKey::inputToKey(const uint16_t input) const
/**
 * inputToKey maps the given raw input value to the pressed key.
 */
{
    ADKey::Key key = ADKey::Key::None;

    if (input < MAX_A) 
    {
        key = ADKey::Key::A;
    } 
    else if (input < MAX_B) 
    {
        key = ADKey::Key::B;
    } 
    else if (input < MAX_C) 
    {
        key = ADKey::Key::C;
    } 
    else if (input < MAX_D) 
    {
        key = ADKey::Key::D;
    } 
    else if (input < MAX_E) 
    {
        key = ADKey::Key::E;
    }

    return key;
}