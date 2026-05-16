import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk?version=4.0';
import Soup from 'gi://Soup?version=3.0';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

export const WeatherHeaderWidget = GObject.registerClass(
class WeatherHeaderWidget extends Gtk.Box {
    _init() {
        super._init({
            orientation: Gtk.Orientation.HORIZONTAL,
            css_classes: ['header-weather'],
            spacing: 6,
            valign: Gtk.Align.CENTER
        });

        this.session = new Soup.Session();

        this.icon = new Gtk.Image({
            icon_name: 'weather-clear-symbolic',
            pixel_size: 16
        });

        this.tempLabel = new Gtk.Label({
            label: "--°",
            css_classes: ['header-temp']
        });

        this.append(this.icon);
        this.append(this.tempLabel);

        // Popover for full info
        this.popover = new Gtk.Popover();
        this.popover_content = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 10,
            css_classes: ['weather-popover-content']
        });
        this.popover.set_child(this.popover_content);
        this.popover.set_parent(this);

        const gesture = new Gtk.GestureClick();
        gesture.connect('pressed', () => {
            this.popover.popup();
        });
        this.add_controller(gesture);

        this.fetchWeather();
    }

    fetchWeather() {
        const lat = -25.7449;
        const lon = 28.1878;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

        console.log(`Weather: Fetching data from ${url}`);
        const msg = Soup.Message.new('GET', url);
        
        this.session.send_and_read_async(msg, GLib.PRIORITY_DEFAULT, null, (session, res) => {
            try {
                const bytes = session.send_and_read_finish(res);
                const data = new TextDecoder().decode(bytes.get_data ? bytes.get_data() : bytes.toArray());
                const json = JSON.parse(data);
                
                if (json.current_weather) {
                    const temp = Math.round(json.current_weather.temperature);
                    const code = json.current_weather.weathercode;
                    const wind = json.current_weather.windspeed;
                    
                    console.log(`Weather: Pretoria is ${temp}°C with wind speed ${wind} km/h (Code ${code}).`);
                    this.tempLabel.set_label(`${temp}°`);
                    
                    // Populate Popover
                    let child = this.popover_content.get_first_child();
                    while (child) {
                        let next = child.get_next_sibling();
                        this.popover_content.remove(child);
                        child = next;
                    }

                    this.popover_content.append(new Gtk.Label({ label: "Location: Pretoria", css_classes: ['popover-title'] }));
                    
                    const createRow = (iconName, text) => {
                        const row = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 10 });
                        row.append(new Gtk.Image({ icon_name: iconName, pixel_size: 16 }));
                        row.append(new Gtk.Label({ label: text }));
                        return row;
                    };

                    this.popover_content.append(createRow('temperature-symbolic', `Temperature: ${temp}°C`));
                    this.popover_content.append(createRow('weather-windy-symbolic', `Wind Speed: ${wind} km/h`));
                    this.popover_content.append(createRow('weather-clear-symbolic', `Condition Code: ${code}`));

                    // Simple weather code to icon mapping
                    let iconPath = 'sunny.png';
                    if (wind > 20) iconPath = 'windy.png';
                    else if (code >= 1 && code <= 3) iconPath = 'cloudy.png';
                    else if (code >= 51 && code <= 86) iconPath = 'rainy.png';
                    else iconPath = 'sunny.png';

                    const fullPath = GLib.build_filenamev([GLib.get_current_dir(), 'assets', iconPath]);
                    console.log(`Weather: Setting icon to ${fullPath}`);
                    this.icon.set_from_file(fullPath);
                    this.icon.pixel_size = 24;
                } else {
                    console.warn('Weather: Received invalid JSON response.');
                }
            } catch (e) {
                console.error('Weather: Error processing response:', e.message);
            }
        });
    }
});
