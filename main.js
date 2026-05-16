import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk?version=4.0';
import Adw from 'gi://Adw?version=1';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Gdk from 'gi://Gdk';

import { WeatherHeaderWidget } from './weatherinfo.js';
import { PinterestFeed } from './pinterest_feed.js';
import { WeatherPage } from './weather_page.js';
import { ArticleReader } from './article_reader.js';
import { AlertDetailPage } from './alert_detail_page.js';

const SwavotiNewsApp = GObject.registerClass(
class SwavotiNewsApp extends Adw.Application {
    _init() {
        super._init({
            application_id: 'za.co.swavoti.news',
            flags: Gio.ApplicationFlags.FLAGS_NONE
        });
    }

    vfunc_startup() {
        super.vfunc_startup();
        this.loadStyles();
        Adw.StyleManager.get_default().set_color_scheme(Adw.ColorScheme.FORCE_LIGHT);
    }

    loadStyles() {
        const provider = new Gtk.CssProvider();
        provider.load_from_file(Gio.File.new_for_path(GLib.build_filenamev([GLib.get_current_dir(), 'style.css'])));
        Gtk.StyleContext.add_provider_for_display(Gdk.Display.get_default(), provider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
    }

    vfunc_activate() {
        let window = this.active_window;
        if (!window) {
            window = new Adw.ApplicationWindow({
                application: this,
                title: 'Swavoti News',
                default_width: 800,
                default_height: 900
            });

            const rootBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
            window.set_content(rootBox);

            this.sidebar = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, css_classes: ['custom-sidebar'] });
            rootBox.append(this.sidebar);

            const createNavBtn = (name, iconPath, labelText) => {
                const btn = new Gtk.Button({ css_classes: ['nav-button'] });
                const content = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 4, halign: Gtk.Align.CENTER });
                content.append(new Gtk.Image({ file: GLib.build_filenamev([GLib.get_current_dir(), 'assets', iconPath]), pixel_size: 24 }));
                content.append(new Gtk.Label({ label: labelText, css_classes: ['nav-label'] }));
                btn.set_child(content);
                btn.connect('clicked', () => {
                    this.stack.set_visible_child_name(name);
                    this.updateNavHighlight(name);
                    header.visible = (name !== 'weather');
                });
                return btn;
            };

            this.newsBtn = createNavBtn('news', 'news_lucide.svg', 'NEWS');
            this.weatherBtn = createNavBtn('weather', 'weather_lucide.svg', 'WEATHER');
            this.sidebar.append(this.newsBtn);
            this.sidebar.append(this.weatherBtn);
            this.updateNavHighlight('news');

            const contentBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, hexpand: true });
            rootBox.append(contentBox);

            const toolbarView = new Adw.ToolbarView({ vexpand: true });
            contentBox.append(toolbarView);

            const header = new Adw.HeaderBar();
            this.backBtn = new Gtk.Button({ icon_name: 'go-previous-symbolic', visible: false });
            this.backBtn.connect('clicked', () => {
                this.stack.set_visible_child_name('news');
                this.updateNavHighlight('news');
                this.backBtn.visible = false;
                this.sidebar.visible = true;
                header.visible = true;
            });
            header.pack_start(this.backBtn);

            const logo = new Gtk.Image({ file: GLib.build_filenamev([GLib.get_current_dir(), 'assets', 'logo.png']), pixel_size: 32 });
            header.pack_start(logo);
            header.pack_start(new WeatherHeaderWidget());

            this.searchEntry = new Gtk.SearchEntry({ placeholder_text: 'Search news...', hexpand: true });
            header.set_title_widget(this.searchEntry);
            toolbarView.add_top_bar(header);

            this.stack = new Adw.ViewStack({ vexpand: true });
            
            this.feed = new PinterestFeed();
            const feedScrolled = new Gtk.ScrolledWindow({ vexpand: true });
            feedScrolled.set_child(this.feed);
            this.stack.add_named(feedScrolled, 'news');

            this.weatherPage = new WeatherPage();
            this.stack.add_named(this.weatherPage, 'weather');

            this.articleReader = new ArticleReader();
            this.stack.add_named(this.articleReader, 'article');

            this.alertDetailPage = new AlertDetailPage();
            this.stack.add_named(this.alertDetailPage, 'alert_detail');

            toolbarView.set_content(this.stack);

            // Back button for alert detail
            this.alertDetailPage.backBtn.connect('clicked', () => {
                this.stack.set_visible_child_name('weather');
                this.sidebar.visible = true;
            });

            this.feed.connect('article-selected', (feed, item) => {
                this.articleReader.loadArticle(item);
                this.stack.set_visible_child_name('article');
                this.backBtn.visible = true;
                this.sidebar.visible = false;
            });

            this.searchEntry.connect('activate', () => {
                const query = this.searchEntry.get_text();
                if (query) {
                    this.stack.set_visible_child_name('news');
                    this.updateNavHighlight('news');
                    this.feed.fetchNews(query);
                }
            });
        }
        window.present();
    }

    updateNavHighlight(name) {
        this.newsBtn.remove_css_class('active');
        this.weatherBtn.remove_css_class('active');
        if (name === 'news') this.newsBtn.add_css_class('active');
        else if (name === 'weather') this.weatherBtn.add_css_class('active');
    }
});

const app = new SwavotiNewsApp();
app.run([GLib.get_prgname()].concat(ARGV));
