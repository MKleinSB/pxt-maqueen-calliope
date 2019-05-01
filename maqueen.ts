let maqueencb: Action
let maqueenmycb: Action
//let maqueene = "1"
let maqueenparam = 0
let alreadyInit = 0
let IrPressEvent = 0
//const MOTOR_ADDRESS = 0x10

enum PingUnit {
    //% block="cm"
    Centimeters,
    //% block="μs"
    MicroSeconds
}

// MakeCode blocks for Infrared Original Code by 劉正吉
// https://github.com/lioujj/pxt-IR MIT License
// Changes for Calliope Mini by M. Klein
//

let tempHandler: Action;
const pwmPeriod = 26;
let rec_init = false;
let arr: number[] = []
let received = false
let first = true
let rec_Type = ""
let messageStr = ""
let recPin = 9 // -> P16 Änderung für Calliope Mini
let thereIsHandler = false
arr = []

function convertHexStrToNum(myMsg: string): number {
    let myNum = 0
    for (let i = 0; i < myMsg.length; i++) {
        if ((myMsg.charCodeAt(i) > 47) && (myMsg.charCodeAt(i) < 58)) {
            myNum += (myMsg.charCodeAt(i) - 48) * (16 ** (myMsg.length - 1 - i))
        } else if ((myMsg.charCodeAt(i) > 96) && (myMsg.charCodeAt(i) < 103)) {
            myNum += (myMsg.charCodeAt(i) - 87) * (16 ** (myMsg.length - 1 - i))
        } else if ((myMsg.charCodeAt(i) > 64) && (myMsg.charCodeAt(i) < 71)) {
            myNum += (myMsg.charCodeAt(i) - 55) * (16 ** (myMsg.length - 1 - i))
        } else {
            myNum = 0
            break
        }
    }
    return myNum
}

//------------------receiver-------------

function resetReceiver() {
    arr = []
    received = false
}

control.inBackground(function () {
    basic.forever(function () {
        if ((!received) && (rec_init)) {
            if (arr.length > 20) {
                if ((input.runningTimeMicros() - arr[arr.length - 1]) > 120000) {
                    if (first) {
                        resetReceiver()
                        first = false
                    } else {
                        received = true
                        decodeIR();
                    }
                }
            }
        }
    })
})

function decodeIR() {
    let addr = 0
    let command2 = 0
    messageStr = ""
    rec_Type = ""
    for (let j = 0; j <= arr.length - 1 - 1; j++) {
        arr[j] = arr[j + 1] - arr[j]
    }
    if (((arr[0] + arr[1]) > 13000) && ((arr[0] + arr[1]) < 14000)) {
        rec_Type = "NEC"
        arr.removeAt(1)
        arr.removeAt(0)
        addr = pulseToDigit(0, 15, 1600)
        command2 = pulseToDigit(16, 31, 1600)
        messageStr = convertNumToHexStr(addr, 4) + convertNumToHexStr(command2, 4)
        arr = [];
        if (thereIsHandler) {
            tempHandler();
        }
    } else if (((arr[0] + arr[1]) > 2600) && ((arr[0] + arr[1]) < 3200)) {
        rec_Type = "SONY"
        arr.removeAt(1)
        arr.removeAt(0)
        command2 = pulseToDigit(0, 11, 1300)
        messageStr = convertNumToHexStr(command2, 3)
        arr = [];
        if (thereIsHandler) {
            tempHandler();
        }
    }
    resetReceiver();
}

function pulseToDigit(beginBit: number, endBit: number, duration: number): number {
    let myNum2 = 0
    for (let k = beginBit; k <= endBit; k++) {
        myNum2 <<= 1
        if ((arr[k * 2] + arr[k * 2 + 1]) < duration) {
            myNum2 += 0
        } else {
            myNum2 += 1
        }
    }
    return myNum2
}

function convertNumToHexStr(myNum: number, digits: number): string {
    let tempDiv = 0
    let tempMod = 0
    let myStr = ""
    tempDiv = myNum
    while (tempDiv > 0) {
        tempMod = tempDiv % 16
        if (tempMod > 9) {
            myStr = String.fromCharCode(tempMod - 10 + 97) + myStr
        } else {
            myStr = tempMod + myStr
        }
        tempDiv = tempDiv / 16  // Math.idiv(tempDiv, 16) geändert wegen Calliope V0-Core
    }
    while (myStr.length != digits) {
        myStr = "0" + myStr
    }
    return myStr
}



//% weight=10 color=#008B00 icon="\uf136" block="maqueen"
namespace maqueen {

    /**
    *  set the IR receiver pin.
    */
    //% blockId=setREC_pin block="Infrarotempfänger an Pin %myPin" blockExternalInputs=false
    //% subcategory="IR"
    //% weight=85 blockGap=10
    //% myPin.fieldEditor="gridpicker" myPin.fieldOptions.columns=4
    //% myPin.fieldOptions.tooltips="false" myPin.fieldOptions.width="300"
    //% myPin.defl=DigitalPin.C16
    export function setREC_pin(myPin: DigitalPin) {
        recPin = myPin;
        pins.setEvents(recPin, PinEventType.Pulse)
        pins.setPull(recPin, PinPullMode.PullUp)
        pins.onPulsed(recPin, PulseValue.Low, function () {
            arr.push(input.runningTimeMicros())
        })
        pins.onPulsed(recPin, PulseValue.High, function () {
            arr.push(input.runningTimeMicros())
        })
        control.onEvent(recPin, DAL.MICROBIT_PIN_EVENT_ON_TOUCH, tempHandler);
        rec_init = true;
    }

    /**
        * Do something when a receive IR
        */
    //% blockId=onReceivedIR block="wenn IR Code empfangen" blockInlineInputs=true
    //% subcategory="IR"
    //% weight=70 blockGap=10
    export function onReceivedIR(handler: Action): void {
        tempHandler = handler
        thereIsHandler = true
    }

    /**
     * return the message of the received IR 
     */
    //% blockId=getMessage block="die empfangene IR Nachricht"
    //% subcategory="IR"
    //% weight=60 blockGap=10
    export function getMessage(): string {
        return messageStr
    }

    export class Packeta {
        public mye: string;
        public myparam: number;
    }

    export enum aMotors {
        //% blockId="M1" block="M1"
        M1 = 0,
        //% blockId="M2" block="M2"
        M2 = 1
    }

    export enum Dir {
        //% blockId="CW" block="CW"
        CW = 0x0,
        //% blockId="CCW" block="CCW"
        CCW = 0x1
    }

    export enum Patrol {
        //% blockId="PatrolLeft" block="PatrolLeft"
        PatrolLeft = 13,
        //% blockId="PatrolRight" block="PatrolRight"
        PatrolRight = 14
    }

    export enum LED {
        //% blockId="LEDLeft" block="LEDLeft"
        LEDLeft = 21, // C8
        //% blockId="LEDRight" block="LEDRight"
        LEDRight = 13 // C12
    }

    export enum LEDswitch {
        //% blockId="turnOn" block="turnOn"
        turnOn = 0x01,
        //% blockId="turnOff" block="turnOff"
        turnOff = 0x00
    }

    //% blockId=ultrasonic_sensor block="sensor unit|%unit"
    //% weight=95
    export function sensor(unit: PingUnit, maxCmDistance = 500): number {
        // send pulse
        pins.setPull(DigitalPin.P1, PinPullMode.PullNone);
        pins.digitalWritePin(DigitalPin.P1, 0);
        control.waitMicros(2);
        pins.digitalWritePin(DigitalPin.P1, 1);
        control.waitMicros(10);
        pins.digitalWritePin(DigitalPin.P1, 0);
        pins.setPull(DigitalPin.P2, PinPullMode.PullUp);



        // read pulse
        let d = pins.pulseIn(DigitalPin.P2, PulseValue.High, maxCmDistance * 42);
        console.log("Distance: " + d / 42);

        basic.pause(50)

        switch (unit) {
            case PingUnit.Centimeters: return d / 42;
            default: return d;
        }
    }

    //% weight=90
    //% blockId=motor_MotorRun block="Motor|%index|dir|%Dir|speed|%speed"
    //% speed.min=0 speed.max=255
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% direction.fieldEditor="gridpicker" direction.fieldOptions.columns=2
    export function MotorRun(index: aMotors, direction: Dir, speed: number): void {
        let buf = pins.createBuffer(3);
        if (index == 0) {
            buf[0] = 0x00;
        }
        if (index == 1) {
            buf[0] = 0x02;
        }
        buf[1] = direction;
        buf[2] = speed;
        pins.i2cWriteBuffer(0x10, buf);
    }

    //% weight=20
    //% blockId=motor_motorStop block="Motor stop|%motors"
    //% motors.fieldEditor="gridpicker" motors.fieldOptions.columns=2 
    export function motorStop(motors: aMotors): void {
        let buf = pins.createBuffer(3);
        if (motors == 0) {
            buf[0] = 0x00;
        }
        if (motors == 1) {
            buf[0] = 0x02;
        }
        buf[1] = 0;
        buf[2] = 0;
        pins.i2cWriteBuffer(0x10, buf);
    }

    //% weight=10
    //% blockId=motor_motorStopAll block="Motor Stop All"
    export function motorStopAll(): void {
        let buf = pins.createBuffer(3);
        buf[0] = 0x00;
        buf[1] = 0;
        buf[2] = 0;
        pins.i2cWriteBuffer(0x10, buf);
        buf[0] = 0x02;
        pins.i2cWriteBuffer(0x10, buf);
    }

    //% weight=20
    //% blockId=read_Patrol block="Read Patrol|%patrol"
    //% patrol.fieldEditor="gridpicker" patrol.fieldOptions.columns=2 
    export function readPatrol(patrol: Patrol): number {
        if (patrol == Patrol.PatrolLeft) {
            return pins.digitalReadPin(23)  //P3
        } else if (patrol == Patrol.PatrolRight) {
            return pins.digitalReadPin(15) //C17
        } else {
            return -1
        }
    }

    //% weight=20
    //% blockId=writeLED block="led|%led|ledswitch|%ledswitch"
    //% led.fieldEditor="gridpicker" led.fieldOptions.columns=2 
    //% ledswitch.fieldEditor="gridpicker" ledswitch.fieldOptions.columns=2
    export function writeLED(led: LED, ledswitch: LEDswitch): void {
        if (led == LED.LEDLeft) {
            pins.digitalWritePin(21, ledswitch) //C8
        } else if (led == LED.LEDRight) {
            pins.digitalWritePin(13, ledswitch) //C12
        } else {
            return
        }
    }
}
