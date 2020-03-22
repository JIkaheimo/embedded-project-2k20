#include "mbed.h"

const int BAUD_RATE = 9600;

Serial device(USBTX, USBRX);

void setup()
{
    device.baud(BAUD_RATE);
}

void loop()
{
    while (true)
    {
        device.printf("Hello serial!\n");
    }
}

int main()
{
    setup();
    loop();
}

