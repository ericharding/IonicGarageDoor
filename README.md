
Simple app to control a garage door which is wired up with a raspberry pi/esp8266/board of the month.

MQTT Protocol:

|TOPIC                | Values         |
|---------------------|----------------|
|/garage/name/status | online, offline
|/garage/name/isopen | OPEN, CLOSED
|/garage/name/command | TOGGLE