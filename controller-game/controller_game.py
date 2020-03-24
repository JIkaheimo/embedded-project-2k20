import serial
import serial.tools.list_ports
import socketio

import asyncio
import serial_asyncio


# Serial configs
BAUD_RATE = 9600


async def serialWorker(eventLoop, port):
    reader, writer = await serial_asyncio.open_serial_connection(url=port, baudrate=BAUD_RATE)
    print("Connection established!")

    # Read serial input
    while True:
        msg = await reader.readuntil(b'\n')


if __name__ == '__main__':
    nucleoPort = None

    # Get port number for Nucleo.
    for port, identifier, _ in serial.tools.list_ports.comports():
        if (identifier.startswith("STMicroelectronics")):
            nucleoPort = port

    loop = asyncio.get_event_loop()
    loop.run_until_complete(serialWorker(loop, port))
    loop.close()
