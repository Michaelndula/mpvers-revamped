 

<p align="center">
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="React Native is released under the MIT license." />
  </a>
</p>

## Contents

- [Brief](#-brief-on-mpvers)
- [Components](#components)
- [Requirements](#-requirements)
- [Getting Started](#-getting-started)
- [How it Works](#-how-it-works)


## 📚 Brief on mPVERs

### SUSPECTED ADVERSE DRUG REACTION

An Adverse Drug Reaction (ADR) is defined as a reaction that is noxious and unintended, and occurs at doses normally used in man for prophylaxis, diagnosis or treatment of a disease, or for modification of physiological function.

### POOR-QUALITY MEDICAL PRODUCTS AND HEALTH TECHNOLOGIES

All healthcare professionals (clinicians, dentists, nurses, pharmacists, physiotherapists, community health workers etc) are encouraged to report. Patients (or their next of kin) may also report.

### ADVERSE EVENT FOLLOWING IMMUNIZATION

An adverse event following immunization (AEFI) is defined as any unfavorable medical occurrence which follows immunization and which may or may not be caused by the usage of the vaccine. The adverse event may be any unfavorable or unintended sign, abnormal laboratory finding, symptom or disease.

### MEDICATION ERROR REPORTING FORM test

Submission of a report does not constitute an admission that medical personnel or manufacturer or the product caused or contributed to the event. Patient’s identity is held in strict confidence and program staff is not is not expected to and will not disclose reporter’s identity in response to any public request.

### MEDICAL DEVICES INCIDENT REPORTING

The Pharmacy and Poisons Board investigates all incidents reported to us in order to identify any faults with medical devices and to prevent similar incidents happening again. The Board may contact the manufacturer of this medical device to request they carry out an investigation.

### ADVERSE TRANSFUSION REACTION

Information supplied by you will contribute to the improvement of drug safety and therapy in Kenya.


## 📋 Requirements

PPB App targets iOS 9.0 and Android 4.1 (API 16) or newer. You may use Windows, macOS, or Linux as your development operating system, though building and running iOS apps is limited to macOS.

You will be required to have the Android Keystore and the relevant Certificates and Profiles for iOS as they are not included in the repo.

Read on how to build a release apk for [Android](https://facebook.github.io/react-native/docs/signed-apk-android) and [iOS](https://medium.com/@tunvirrahmantusher/create-ipa-and-apk-from-react-native-72fe53c6a8db) and publishing to [App Store](https://medium.com/@the_manifest/how-to-publish-your-app-on-apples-app-store-in-2018-f76f22a5c33a)

## Components

- assets (Images)
- src (app files)
  - actions
    - user
  - form_data (form data in json)
    - aefi
    - device
    - medication
    - padr
    - pqmp
    - sadr
    - transfusion
  - form_data_followup (form data in json)
    - aefi
    - device
    - medication
    - sadr
    - transfusion
  - reducers
    - currentUser
  - screens
    - dashboard
    - forms
      - add
        - validations
      - followup
        - validations
      - view
        - pdf (not in use)
    - intro
    - login
    - notifications
      - view
    - password
    - profile
    - register
    - reports
    - sidemenu
  - services
    - network
  - storage
    - db
  - ui
    - components
      - emptylist
      - icon
      - prompt
      - questions
      - questionview
    - container
  - utilities
    - colors
    - validation

## 📜 Getting Started

1. Download and configure [Node.js](https://nodejs.org/en/download/).
2. Go to the desired folder and clone the project using git.

If Node.js is installed globally, run

```bash
git clone 
```

Run yarn to install the packages

```bash
yarn install
```

or using npm

```bash
npm install
```

There are two options after that, you can run the application for Android or for iOS
For Android run:

```bash
npm run android
```

or if using yarn

```bash
yarn android
```

For iOS(Mac required) run:

```bash
npm run ios
```

or if using yarn

```bash
yarn ios
```

For ios you might need to install pods before running.
navigate to ios folder in your project root. The run

```bash
pod install
```

Review the section of scripts under packages.json to see other scripts that can be run

## 🎉 How it Works

## 📄 Errors

If you encounter a Duplicate Resources error when building the release version for Android:

Start Android Studio, click on build and rebuild app. There will be packages that require refactoring, ensure the packages have been refactored.

Edit the /node_modules/react-native/react.gradle file
and add the doLast right after the doFirst block, manually.

```bash
doFirst { ... }
doLast {
    def moveFunc = { resSuffix ->
        File originalDir = file("$buildDir/generated/res/react/release/${resSuffix}");
        if (originalDir.exists()) {
            File destDir = file("$buildDir/../src/main/res/${resSuffix}");
            ant.move(file: originalDir, tofile: destDir);
        }
    }
    moveFunc.curry("drawable-ldpi").call()
    moveFunc.curry("drawable-mdpi").call()
    moveFunc.curry("drawable-hdpi").call()
    moveFunc.curry("drawable-xhdpi").call()
    moveFunc.curry("drawable-xxhdpi").call()
    moveFunc.curry("drawable-xxxhdpi").call()
    moveFunc.curry("raw").call()
}
```

spawnSync ./gradlew EACCES error

Run chmod 755 android/gradlew
Run ./gradlew clean

if the you get and error on trying to clean then this is because the gradlew file has Windows file-endings. You can install dos2unix then  use dos2unix to convert the line-endings from CRLF Windows CarriageReturn + LineFeed to LF Linux LineFeed only:

``bash
  dos2unix ./gradlew
``
Rerun ./gradlew clean for a test

Remove and reinstall react-native-firebase/app


error: failed linking references.

Check package and change gradle values to match (compileSdkVersion should be at least 30)

```bash
android {
    compileSdkVersion 30
    buildToolsVersion "30.0.2"

    defaultConfig {
        minSdkVersion 16
        targetSdkVersion 30
        versionCode 1
        versionName "1.0"
    }
}

```
You can also open your project in the android studio and then delete all drawable-xxx folders and raw folder under resources.

Image cannot show image in iOS 14
On react-native/Libraries/Image/RCTUIImageViewAnimated.m

Look for
  ```bash

  - (void)displayLayer:(CALayer \*)layer
    {
    if (\_currentFrame) {
      layer.contentsScale = self.animatedImageScale;
      layer.contents = (\_\_bridge id)\_currentFrame.CGImage;
      }
    }
  ```
then replace it with

```bash

- (void)displayLayer:(CALayer *)layer
{
 if (_currentFrame) {
  layer.contentsScale = self.animatedImageScale;
  layer.contents = (__bridge id)_currentFrame.CGImage;
} else {
  [super displayLayer:layer];
}
}
```

[!] CocoaPods could not find compatible versions for pod "ReactCommon/callinvoker":

```bash
pod 'ReactCommon/callinvoker', :path => "../node_modules/react-native/ReactCommon"

to

pod 'React-callinvoker', :path => "../node_modules/react-native/ReactCommon/callinvoker"
```

Can't compile initial project for iOS : unknown type name 'bn_ulong' react native
Add to the pod file
```bash
pod 'OpenSSL-Universal', '~>1.0.2.20'
```
