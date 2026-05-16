import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk?version=4.0';
import WebKit from 'gi://WebKit?version=6.0';
import Adw from 'gi://Adw?version=1';

export const WeatherPage = GObject.registerClass(
class WeatherPage extends Gtk.Box {
    _init() {
        super._init({
            orientation: Gtk.Orientation.VERTICAL,
            vexpand: true,
            hexpand: true
        });

        this.buildUI();
    }

    buildUI() {
        // Dedicated Header for WebView control
        const header = new Adw.HeaderBar();
        const titleWidget = new Adw.WindowTitle({ title: "Weather Platform", subtitle: "Live Satellite & Forecast" });
        header.set_title_widget(titleWidget);

        // WebView Navigation Controls
        const webBackBtn = new Gtk.Button({ icon_name: 'go-previous-symbolic', tooltip_text: 'Back' });
        webBackBtn.connect('clicked', () => this.webView.go_back());
        
        const webForwardBtn = new Gtk.Button({ icon_name: 'go-next-symbolic', tooltip_text: 'Forward' });
        webForwardBtn.connect('clicked', () => this.webView.go_forward());

        header.pack_start(webBackBtn);
        header.pack_start(webForwardBtn);

        const refreshBtn = new Gtk.Button({ icon_name: 'view-refresh-symbolic', tooltip_text: 'Reload' });
        refreshBtn.connect('clicked', () => this.webView.reload());
        
        const homeBtn = new Gtk.Button({ icon_name: 'go-home-symbolic', tooltip_text: 'Home' });
        homeBtn.connect('clicked', () => this.webView.load_uri('https://www.yr.no'));
        
        header.pack_end(refreshBtn);
        header.pack_end(homeBtn);

        this.append(header);

        // WebKit WebView
        this.webView = new WebKit.WebView({
            vexpand: true,
            hexpand: true
        });

        // Use yr.no for highly accurate Scandinavian meteorology data
        this.webView.load_uri('https://www.yr.no');
        
        this.append(this.webView);
    }
});
