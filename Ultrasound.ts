enum RgbUltrasonics {
    //% block=left
    Left = 0x00,
    //% block=right
    Right = 0x01,
    //% block=all
    All = 0x02
}

enum RgbColors {
    //% block=red
    Red = 0xFF0000,
    //% block=orange
    Orange = 0xFFA500,
    //% block=yellow
    Yellow = 0xFFFF00,
    //% block=green
    Green = 0x00FF00,
    //% block=blue
    Blue = 0x0000FF,
    //% block=indigo
    Indigo = 0x4b0082,
    //% block=violet
    Violet = 0x8a2be2,
    //% block=purple
    Purple = 0xFF00FF,
    //% block=white
    White = 0xFFFFFF,
    //% block=black
    Black = 0x000000
}

enum ColorEffect {
    //% block=none
    None = 0x00,
    //% block=breathing
    Breathing = 0x01,
    //% block=rotate
    Rotate = 0x02,
    //% block=flash
    Flash = 0x03
}


namespace IrRemote {
 //let neoStrip: neopixel.Strip;
let emRGBLight: MGRGBLight.EmakefunRGBLight;
let matBuf = pins.createBuffer(17);
let distanceBuf = 0;
/**
     * Get RUS04 distance
     * @param pin Microbit ultrasonic pin; eg: P2
    */
    //% blockId=Ultrasonic block="Read RgbUltrasonic Distance at pin %pin(cm)"  group="RGB超声波"
    //% weight=76
    //% inlineInputMode=inline
    //% subcategory="传感器"
    export function Ultrasonic(pin: DigitalPin): number {
        pins.setPull(pin, PinPullMode.PullNone);
        pins.digitalWritePin(pin, 0);
        control.waitMicros(2);
        pins.digitalWritePin(pin, 1);
        control.waitMicros(50);
        pins.digitalWritePin(pin, 0);
        // read pulse
        let d = pins.pulseIn(pin, PulseValue.High, 25000);
        let ret = d;
        // filter timeout spikes
        if (ret == 0 && distanceBuf != 0) {
            ret = distanceBuf;
        }
        distanceBuf = d;
        return Math.floor(ret * 9 / 6 / 58);
        //return Math.floor(ret / 40 + (ret / 800));
        // Correction
    }

    function RgbDisplay(indexstart: number, indexend: number, rgb: RgbColors): void {
        for (let i = indexstart; i <= indexend; i++) {
            emRGBLight.setPixelColor(i, rgb);
        }
        emRGBLight.show();
    }

    //% blockId="motorbit_rus04" block="part %index show color %rgb effect %effect rgbpin %pin"  group="RGB超声波"
    //% weight=75
    //% inlineInputMode=inline
    //% subcategory="传感器"
    export function sensorbit_rus04(pin: DigitalPin, index: RgbUltrasonics, rgb: RgbColors, effect: ColorEffect): void {
        let start, end;
        if (!emRGBLight) {
            emRGBLight = MGRGBLight.create(pin, 6, EMRGBPixelMode.RGB)
        }
        if (index == RgbUltrasonics.Left) {
            start = 0;
            end = 2;
        } else if (index == RgbUltrasonics.Right) {
            start = 3;
            end = 5;
        } else if (index == RgbUltrasonics.All) {
            start = 0;
            end = 5;
        }
        switch (effect) {
            case ColorEffect.None:
                RgbDisplay(start, end, rgb);
                break;
            case ColorEffect.Breathing:
                for (let i = 0; i < 255; i += 2) {
                    emRGBLight.setBrightness(i);
                    RgbDisplay(start, end, rgb);
                    //basic.pause((255 - i)/2);
                    basic.pause((i < 20) ? 80 : (255 / i));
                }
                for (let i = 255; i > 0; i -= 2) {
                    emRGBLight.setBrightness(i);
                    RgbDisplay(start, end, rgb);
                    basic.pause((i < 20) ? 80 : (255 / i));
                }
                break;
            case ColorEffect.Rotate:
                for (let i = 0; i < 4; i++) {
                    emRGBLight.setPixelColor(start, rgb);
                    emRGBLight.setPixelColor(start + 1, 0);
                    emRGBLight.setPixelColor(start + 2, 0);
                    if (index == RgbUltrasonics.All) {
                        emRGBLight.setPixelColor(end - 2, rgb);
                        emRGBLight.setPixelColor(end - 1, 0);
                        emRGBLight.setPixelColor(end, 0);
                    }
                    emRGBLight.show();
                    basic.pause(150);
                    emRGBLight.setPixelColor(start, 0);
                    emRGBLight.setPixelColor(start + 1, rgb);
                    emRGBLight.setPixelColor(start + 2, 0);
                    if (index == RgbUltrasonics.All) {
                        emRGBLight.setPixelColor(end - 2, 0);
                        emRGBLight.setPixelColor(end - 1, rgb);
                        emRGBLight.setPixelColor(end, 0);
                    }
                    emRGBLight.show();
                    basic.pause(150);
                    emRGBLight.setPixelColor(start, 0);
                    emRGBLight.setPixelColor(start + 1, 0);
                    emRGBLight.setPixelColor(start + 2, rgb);
                    if (index == RgbUltrasonics.All) {
                        emRGBLight.setPixelColor(end - 2, 0);
                        emRGBLight.setPixelColor(end - 1, 0);
                        emRGBLight.setPixelColor(end, rgb);
                    }
                    emRGBLight.show();
                    basic.pause(150);
                }
                RgbDisplay(4, 9, 0);
                break;
            case ColorEffect.Flash:
                for (let i = 0; i < 6; i++) {
                    RgbDisplay(start, end, rgb);
                    basic.pause(150);
                    RgbDisplay(start, end, 0);
                    basic.pause(150);
                }
                break;
        }
    }


}