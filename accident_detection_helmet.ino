#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

#define RXD2 16
#define TXD2 17

#define VIB_PIN 27
#define BUTTON_PIN 26

HardwareSerial ec200u(2);
Adafruit_MPU6050 mpu;

float accelMagnitude;

String phoneNumber = "+919370004321";
String latitude = "";
String longitude = "";

void setup()
{
  Serial.begin(115200);
  ec200u.begin(115200, SERIAL_8N1, RXD2, TXD2);

  pinMode(VIB_PIN, INPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  Wire.begin();
  mpu.begin();

  Serial.println("Smart Accident Detection Helmet Ready");

  ec200u.println("AT");
  delay(1000);

  ec200u.println("AT+QGPS=1");
  delay(2000);
}

void loop()
{
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  accelMagnitude = sqrt(
    a.acceleration.x * a.acceleration.x +
    a.acceleration.y * a.acceleration.y +
    a.acceleration.z * a.acceleration.z
  );

  int vibration = digitalRead(VIB_PIN);
  int buttonState = digitalRead(BUTTON_PIN);

  Serial.print("📊 Accel: ");
  Serial.print(accelMagnitude);
  Serial.print(" | 📳 Vib: ");
  Serial.print(vibration);
  Serial.print(" | 🛑 Btn: ");
  Serial.println(buttonState);

  if (accelMagnitude > 20 || vibration == 1)
  {
    Serial.println("⚠ Possible Accident Detected");

    for (int i = 10; i > 0; i--)
    {
      Serial.print("Cancel alert in ");
      Serial.print(i);
      Serial.println(" sec");

      if (digitalRead(BUTTON_PIN) == LOW)
      {
        Serial.println("Alert Cancelled by User");
        return;
      }

      delay(1000);
    }

    Serial.println("Sending Emergency Alert");

    getGPS();
    sendSMS();
    makeCall();
  }

  delay(500);
}

void getGPS()
{
  Serial.println("Getting GPS location...");

  ec200u.println("AT+QGPSLOC=2");
  delay(3000);

  String response = "";

  while (ec200u.available())
  {
    char c = ec200u.read();
    response += c;
  }

  Serial.println(response);

  int firstComma = response.indexOf(",");
  int secondComma = response.indexOf(",", firstComma + 1);
  int thirdComma = response.indexOf(",", secondComma + 1);

  latitude = response.substring(firstComma + 1, secondComma);
  longitude = response.substring(secondComma + 1, thirdComma);

  Serial.print("Latitude: ");
  Serial.println(latitude);

  Serial.print("Longitude: ");
  Serial.println(longitude);
}

void sendSMS()
{
  String link = "https://maps.google.com/?q=" + latitude + "," + longitude;

  Serial.println("Sending SMS with location...");

  ec200u.println("AT+CMGF=1");
  delay(1000);

  ec200u.print("AT+CMGS=\"");
  ec200u.print(phoneNumber);
  ec200u.println("\"");

  delay(1000);

  ec200u.print("Accident detected!\nLocation:\n");
  ec200u.print(link);

  delay(500);

  ec200u.write(26);

  delay(5000);

  Serial.println("SMS Sent Successfully");
}

void makeCall()
{
  Serial.println("Calling emergency contact");

  ec200u.print("ATD");
  ec200u.print(phoneNumber);
  ec200u.println(";");

  delay(15000);

  ec200u.println("ATH");

  Serial.println("Call Ended");
}
