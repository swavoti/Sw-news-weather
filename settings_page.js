import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk?version=4.0';
import Adw from 'gi://Adw?version=1';

export const SettingsPage = GObject.registerClass({
    Signals: {
        'check-updates': {},
        'apply-update': {}
    }
}, class SettingsPage extends Gtk.Box {
    _init() {
        super._init({
            orientation: Gtk.Orientation.VERTICAL,
            css_classes: ['settings-page'],
            vexpand: true
        });

        this.buildUI();
    }

    buildUI() {
        const header = new Adw.HeaderBar();
        const titleWidget = new Adw.WindowTitle({ title: "Settings", subtitle: "Preferences & Updates" });
        header.set_title_widget(titleWidget);
        this.append(header);

        const scrolled = new Gtk.ScrolledWindow({ vexpand: true });
        this.append(scrolled);

        const content = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 24,
            margin_start: 32,
            margin_end: 32,
            margin_top: 32,
            margin_bottom: 32
        });
        scrolled.set_child(content);

        // OTA Updates Section
        const updateSection = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 12 });
        updateSection.append(new Gtk.Label({ label: "OVER-THE-AIR UPDATES", xalign: 0, css_classes: ['section-title-premium'] }));

        const updateCard = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, css_classes: ['weather-hero-minimal'], spacing: 16 });
        
        this.statusLabel = new Gtk.Label({ 
            label: "App is up to date.", 
            css_classes: ['weather-desc-premium'],
            xalign: 0
        });
        updateCard.append(this.statusLabel);

        const btnBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 12 });
        
        this.checkBtn = new Gtk.Button({ label: "Check for Updates", css_classes: ['suggested-action'] });
        this.checkBtn.connect('clicked', () => {
            this.statusLabel.set_label("Checking GitHub for changes...");
            this.emit('check-updates');
        });
        
        this.applyBtn = new Gtk.Button({ label: "Download & Apply", css_classes: ['destructive-action'], visible: false });
        this.applyBtn.connect('clicked', () => {
            this.emit('apply-update');
        });

        btnBox.append(this.checkBtn);
        btnBox.append(this.applyBtn);
        updateCard.append(btnBox);
        
        updateSection.append(updateCard);
        content.append(updateSection);
    }

    showUpdateAvailable() {
        this.statusLabel.set_label("A new update is available on GitHub!");
        this.applyBtn.visible = true;
    }

    showUpdateProgress(msg) {
        this.statusLabel.set_label(msg);
        this.checkBtn.sensitive = false;
        this.applyBtn.sensitive = false;
    }

    showUpdateError(msg) {
        this.statusLabel.set_label(`Update Error: ${msg}`);
        this.checkBtn.sensitive = true;
        this.applyBtn.sensitive = true;
    }
});
