#include "mbed.h"
#include "string"

class ADKey 
/*
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
        /*
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


        /*
         * ADKey default constructor
         */
        ADKey(const PinName keyPin = A2);


        /*
         * pollInput() reads the ADKey sensor value and updates
         * any input value dependent state variables. 
         *
         * Use isPressed(), isReleased() to check the state of the
         * component and use readPressed(), readReleased() to get
         * the corresponding buttons.
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
         * readPressed() returns the pressed key from ADKey component.
         * Use in combination with isPressed() to get better results.
         */
        const Key readPressed();
        

        /* 
         * readReleased() returns the released key from ADKey component.
         * Use in combination with isReleased() to get better results.
         */
        const Key readReleased();

    private:
        // Pins
        AnalogIn _pin;

        Key _pressedKey = Key::None;
        Key _lastKey = Key::None;
        
        Key inputToKey(const uint16_t) const;
};