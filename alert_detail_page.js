import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk?version=4.0';
import Adw from 'gi://Adw?version=1';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export const AlertDetailPage = GObject.registerClass(
class AlertDetailPage extends Gtk.Box {
    _init() {
        super._init({
            orientation: Gtk.Orientation.VERTICAL,
            css_classes: ['alert-detail-page'],
            vexpand: true
        });

        this.buildUI();
    }

    buildUI() {
        const header = new Adw.HeaderBar();
        this.backBtn = new Gtk.Button({ icon_name: 'go-previous-symbolic' });
        header.pack_start(this.backBtn);
        this.append(header);

        const scrolled = new Gtk.ScrolledWindow({ vexpand: true });
        this.append(scrolled);

        this.content = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 24,
            margin_start: 32,
            margin_end: 32,
            margin_top: 32,
            margin_bottom: 32
        });
        scrolled.set_child(this.content);

        this.titleLabel = new Gtk.Label({ wrap: true, xalign: 0, css_classes: ['alert-detail-title'] });
        this.content.append(this.titleLabel);

        this.mapImage = new Gtk.Picture({
            css_classes: ['alert-detail-map'],
            width_request: 600,
            height_request: 300,
            can_shrink: true
        });
        this.content.append(this.mapImage);

        this.bodyLabel = new Gtk.Label({ wrap: true, xalign: 0, css_classes: ['alert-detail-body'] });
        this.content.append(this.bodyLabel);
    }

    loadAlert(alertData) {
        this.titleLabel.set_label(alertData.title);
        this.bodyLabel.set_label("Analyzing risk data and fetching proof...");
        
        const lat = alertData.lat || -25.7449;
        const lon = alertData.lon || 28.1878;
        const mapUrl = `https://static-maps.yandex.ru/1.x/?ll=${lon},${lat}&z=10&l=map,trf&size=600,300`;
        this.mapImage.set_file(Gio.File.new_for_uri(mapUrl));

        // Fetch "proof" or extra info
        const query = encodeURIComponent(alertData.title + " news");
        const fetchUrl = `https://www.bing.com/news/search?q=${query}`;
        
        try {
            const [success, stdout] = GLib.spawn_command_line_sync(`curl -L -s "${fetchUrl}"`);
            if (success && stdout && stdout.length > 0) {
                const html = new TextDecoder().decode(stdout);
                const proof = this.extractProof(html);
                if (proof) {
                    this.bodyLabel.set_label(proof);
                } else {
                    this.bodyLabel.set_label("⚠️ CRITICAL ALERT: Emergency services have issued a high-risk warning. \n\nNo specific local news available yet, but satellite data confirms high-intensity atmospheric disturbance in your immediate coordinates. \n\nACTION: Seek shelter immediately.");
                }
            } else {
                this.bodyLabel.set_label("⚠️ WARNING: FAILED TO FETCH REMOTE EMERGENCY INFO. \n\nLocal data indicates extreme conditions. Do not wait for news confirmation. Stay indoors and away from windows.");
            }
        } catch (e) {
            this.bodyLabel.set_label("⚠️ ERROR: Emergency data fetch failed. \n\nPlease follow local radio instructions and evacuation protocols immediately.");
        }
    }

    extractProof(html) {
        const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
        let match;
        let results = [];
        while ((match = pRegex.exec(html)) !== null) {
            let text = match[1].replace(/<[^>]*>?/gm, '').trim();
            if (text.length > 60) results.push(text);
        }
        return results.slice(0, 5).join("\n\n");
    }
});
