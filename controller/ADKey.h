#include "mbed.h"
#include "string"

class ADKey 
/**
 *  ADKEY
 * 
 * Component layout:
 * (characters represent the corresponding keys...)
 *
 * A   B
 * C D E 
 *
 */
{
    public:
        /**
         * Keys of ADKey component
         */
        enum Key  
        {
            None =  (int) '-', 
            A =     (int) 'A', 
            B =     (int) 'B', 
            C =     (int) 'C',
            D =     (int) 'D', 
            E =     (int) 'E'
        };


        /**
         * ADKey default constructor
         * 
         * Params:
         * keyPin - Analog pin in which ADKey component is connected.
         */
        ADKey(const PinName keyPin = A2);


        /*
         * pollInput() reads the ADKey sensor value and updates
         * any input value dependent state variables. 
         *
         * Use isPressed() and readKey() to check and access
         * any newly pressed keys.
         */
        void pollInput();


        /*
         * isPressed returns true if button has been pressed
         * since the last time of reading the key.
         */
        const bool isPressed() const;


        /**
         * readKey is used to get the pressed key of ADKey component.
         * Also clears the pressed key and re-initializes the component for reading.
         */
        const ADKey::Key readKey();
        

    private:
        AnalogIn _pin;
        Timer _timer;

        ADKey::Key _pressedKey = ADKey::Key::None;
        ADKey::Key _lastKey = ADKey::Key::None;
        
        int _inputTime = 0;
        
        ADKey::Key inputToKey(const uint16_t) const;

};