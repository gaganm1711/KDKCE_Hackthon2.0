# 🪖 Smart Accident Detection Helmet

A **Smart IoT-based helmet safety system** that automatically detects accidents and sends emergency alerts with GPS location.

This project combines **motion sensing, vibration detection, GPS tracking, and cellular communication** to provide rapid assistance in case of a road accident.

---

# 🚀 Project Overview

Road accidents often become fatal because emergency services are not informed quickly.
The **Smart Accident Detection Helmet** solves this problem by automatically detecting a crash and notifying emergency contacts.

When an accident is detected:

1. A **10-second cancellation timer** starts
2. If the rider cancels → alert stops
3. If not cancelled → system automatically:

   * Retrieves **GPS location**
   * Sends **SMS with Google Maps link**
   * Makes an **emergency phone call**

This system is designed for **motorcycle riders, safety research, hackathons, and engineering competitions**.

---

# ⚙️ Key Features

### 📡 Automatic Accident Detection

Uses multiple sensors to detect a crash:

* **MPU6050 Accelerometer** → detects sudden acceleration
* **SW420 Vibration Sensor** → detects impact

If either sensor detects abnormal activity, the system assumes a possible accident.

---

### ⏳ 10-Second Cancel Timer

To avoid false alerts:

* The system starts a **10-second countdown**
* Rider can press the **cancel button**
* If pressed → emergency alert is stopped

---

### 📍 GPS Location Tracking

The **EC200U 4G module** retrieves the current location.

The coordinates are converted into a **Google Maps link** for easy navigation.

Example message:

```
Accident detected!
Location:
https://maps.google.com/?q=21.101225,79.101305
```

---

### 📱 Emergency SMS Alert

When an accident is confirmed, the system automatically sends an **SMS containing the exact GPS location**.

---

### 📞 Automatic Emergency Call

After sending the SMS, the system places a **phone call to the emergency contact**.

This ensures the alert is noticed even if the SMS is missed.

---

# 🧠 System Architecture

```
MPU6050  ─┐
          ├── ESP32 ─── EC200U 4G Module ── SMS + Call
Vibration ┘

Cancel Button → Stops alert within 10 seconds
```

---

# 🔧 Hardware Components

| Component              | Description                           |
| ---------------------- | ------------------------------------- |
| ESP32                  | Main microcontroller                  |
| MPU6050                | Motion and acceleration sensor        |
| SW420 Vibration Sensor | Detects impact or shock               |
| EC200U 4G LTE Module   | GPS, SMS and phone call communication |
| Push Button            | Cancel alert switch                   |
| Power Supply           | Battery or regulated 5V               |

---

# 🔌 Circuit Connections

## EC200U → ESP32

| EC200U | ESP32  |
| ------ | ------ |
| TX     | GPIO16 |
| RX     | GPIO17 |
| GND    | GND    |

---

## MPU6050 → ESP32

| MPU6050 | ESP32  |
| ------- | ------ |
| SDA     | GPIO21 |
| SCL     | GPIO22 |
| VCC     | 3.3V   |
| GND     | GND    |

---

## Vibration Sensor

| Sensor | ESP32  |
| ------ | ------ |
| DO     | GPIO27 |
| VCC    | 3.3V   |
| GND    | GND    |

---

## Cancel Button

```
GPIO26 ---- Switch ---- GND
```

GPIO26 uses **internal pull-up resistor**.

| Button State | Reading |
| ------------ | ------- |
| Not Pressed  | HIGH    |
| Pressed      | LOW     |

---

# 🔁 System Workflow

1. System initializes sensors and EC200U module
2. GPS module starts running
3. Helmet continuously monitors acceleration and vibration
4. If a crash is detected
5. A **10-second countdown timer begins**
6. Rider can cancel using the switch
7. If not cancelled:

   * GPS coordinates retrieved
   * Google Maps link generated
   * SMS sent to emergency contact
   * Emergency call initiated

---

# 💻 Software Requirements

Install the following libraries from **Arduino Library Manager**:

* `Adafruit MPU6050`
* `Adafruit Unified Sensor`
* `Wire` (built-in)

---

# 🖥 Example Serial Monitor Output

```
Accel: 9.78 | Vib: 0 | Btn: 1
Accel: 9.82 | Vib: 0 | Btn: 1

⚠ Possible Accident Detected
Cancel alert in 10 sec
Cancel alert in 9 sec
Cancel alert in 8 sec

Sending Emergency Alert
SMS Sent Successfully
Calling emergency contact
```

---

# 🌍 Applications

* Motorcycle safety systems
* Rider emergency alert devices
* IoT transportation safety
* Smart mobility research
* Engineering and hackathon projects

---

# 🔮 Future Improvements

Potential upgrades include:

* Helmet wear detection
* Cloud accident monitoring
* Mobile application integration
* Real-time live tracking
* Automatic ambulance notification
* AI-based crash detection

