#!/bin/bash

VERSION="1.0.0"
PKG_NAME="swavoti-news_${VERSION}_amd64"

echo "Building Debian package for Swavoti News v${VERSION}..."

# 1. Create directory structure
mkdir -p "$PKG_NAME/DEBIAN"
mkdir -p "$PKG_NAME/usr/bin"
mkdir -p "$PKG_NAME/usr/share/applications"
mkdir -p "$PKG_NAME/usr/share/icons/hicolor/256x256/apps"

# 2. Create control file
cat <<EOF > "$PKG_NAME/DEBIAN/control"
Package: swavoti-news
Version: $VERSION
Section: utils
Priority: optional
Architecture: amd64
Depends: gjs, libgtk-4-1, libadwaita-1-0, git, curl
Maintainer: Swavoti <info@swavoti.co.za>
Description: Swavoti News and Weather Super Edition
 A premium desktop application for news and weather with live satellite maps.
EOF

# 3. Create Smart Launcher Script
# This launcher clones the repo to ~/.local/share on first run so OTA updates work without sudo.
cat <<EOF > "$PKG_NAME/usr/bin/swavoti-news"
#!/bin/bash
USER_DIR="\$HOME/.local/share/swavoti-news-weather"

# Check if the app directory exists in user's home
if [ ! -d "\$USER_DIR" ]; then
    echo "First run detected. Initializing Swavoti News in user directory for OTA updates..."
    mkdir -p "\$HOME/.local/share"
    git clone https://github.com/swavoti/Sw-news-weather "\$USER_DIR"
fi

cd "\$USER_DIR"

# Ensure we are on the main branch for updates
git checkout main

# Launch the app
exec gjs -m main.js
EOF

chmod +x "$PKG_NAME/usr/bin/swavoti-news"

# 4. Create Desktop Entry
cat <<EOF > "$PKG_NAME/usr/share/applications/swavoti-news.desktop"
[Desktop Entry]
Name=Swavoti News
Comment=Premium News and Weather platform
Exec=swavoti-news
Icon=swavoti-news
Terminal=false
Type=Application
Categories=Utility;News;Weather;
EOF

# 5. Copy Icon
if [ -f "assets/logo.png" ]; then
    cp assets/logo.png "$PKG_NAME/usr/share/icons/hicolor/256x256/apps/swavoti-news.png"
fi

# 6. Build the package
dpkg-deb --build "$PKG_NAME"

echo "Package built successfully: ${PKG_NAME}.deb"
