Swavoti Weather News App 
Welcome to the Swavoti Weather News App! This application delivers real-time weather updates and localized news directly to your Linux desktop. Built for efficiency and speed, it ensures you stay informed about the elements and headlines that matter to you.

Features
Real-time Weather Tracking: Get live updates on temperature, humidity, wind speed, and forecasts.

Localized News Feed: Stay up to date with breaking news and trending stories.

Lightweight & Fast: Optimized specifically for Debian-based Linux distributions.

Clean UI: Simple, intuitive interface for seamless navigation.

Installation
Getting the app up and running on your system is quick and easy. Just run the following commands in your terminal:

1. Download the Package
Use wget to pull the latest .deb package directly to your machine:

Bash
wget https://scloudhoststaticloudhost.swavoti.co.za/swavoti-news_1.0.0_amd64.deb
2. Install the App
Install the downloaded package using apt. This will automatically handle any required dependencies:

Bash
sudo apt update && sudo apt install ./swavoti-news_1.0.0_amd64.deb
 Note: Make sure you include the ./ before the filename so apt knows to look for a local file instead of searching the online repositories!

How to Run
Once the installation is complete, you can launch the app via your system's application menu (look for Swavoti News) or spin it up directly from the terminal:

Bash
swavoti-news
Uninstallation
If you ever need to remove the app, you can easily purge it using apt:

Bash
sudo apt remove swavoti-news
License
This project is licensed under the MIT License - see the LICENSE file for details.

The product name Swavoti  and its assets is a trademark of Swavoti South Africa pty ltd 
