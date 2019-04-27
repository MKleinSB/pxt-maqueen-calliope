# pxt-maqueen-calliope
Anpassung des micro maqueen an den Calliope Mini + Callio:bit PRO (wobei das Fahren alleine mit jedem Callio:bit funktioniert, da es über I2C läuft)

Pins die gejumpert werden müssen:

P0 (19) --> P15 RGB-LEDs

P1 (7)  --> P1 T/SR04

P2 (8)  --> P2 E/SR04

C16 (9) --> P13 LineL

C17 (15)--> P14 LineR

P3 (23) --> P16 IR-Receiver


Der Maqueen zeigt beim Calliope Mini ein seltsames Verhalten. Damit es funktioniert muss der Mini über den Batterieanschluss mit Strom versorgt werden. Und zwar muss zuerst der Mini angeschaltet werden und dann der Maqueen. Und das jedesmal, wenn man ein neues Programm aufgespielt hat, oder der Maqueen ausgeschaltet war!
