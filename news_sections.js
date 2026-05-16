import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk?version=4.0';
import Soup from 'gi://Soup?version=3.0';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Adw from 'gi://Adw?version=1';

export const NewsSections = GObject.registerClass(
class NewsSections extends Gtk.Box {
    _init() {
        super._init({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 0
        });

        this.session = new Soup.Session();

        // Breaking News Section
        this.append(new Gtk.Label({
            label: "Breaking News",
            css_classes: ['section-title'],
            halign: Gtk.Align.START
        }));

        this.carousel = new Adw.Carousel({
            css_classes: ['carousel-container'],
            spacing: 0
        });
        
        const carouselBox = new Gtk.Box({
            css_classes: ['carousel-wrapper']
        });
        carouselBox.append(this.carousel);
        this.append(carouselBox);

        // Trending & Categories Section
        this.append(new Gtk.Label({
            label: "Explore News",
            css_classes: ['section-title'],
            halign: Gtk.Align.START
        }));

        this.newsList = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 0
        });
        this.append(this.newsList);

        this.fetchBreaking();
        this.fetchTrending();
    }

    fetchBreaking() {
        const rssUrl = encodeURIComponent("https://www.bing.com/news/search?q=Breaking+News&format=rss");
        const url = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;
        const msg = Soup.Message.new('GET', url);

        this.session.send_and_read_async(msg, GLib.PRIORITY_DEFAULT, null, (session, res) => {
            try {
                const bytes = session.send_and_read_finish(res);
                const data = new TextDecoder().decode(bytes.get_data ? bytes.get_data() : bytes.toArray());
                const json = JSON.parse(data);
                
                if (json.items) {
                    json.items.slice(0, 5).forEach(item => {
                        this.carousel.append(this.createBreakingCard(item));
                    });
                }
            } catch (e) {
                console.error('Breaking News Error:', e);
            }
        });
    }

    fetchTrending() {
        const rssUrl = encodeURIComponent("https://www.bing.com/news/search?q=Trending&format=rss");
        const url = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;
        const msg = Soup.Message.new('GET', url);

        this.session.send_and_read_async(msg, GLib.PRIORITY_DEFAULT, null, (session, res) => {
            try {
                const bytes = session.send_and_read_finish(res);
                const data = new TextDecoder().decode(bytes.get_data ? bytes.get_data() : bytes.toArray());
                const json = JSON.parse(data);
                
                if (json.items) {
                    json.items.forEach(item => {
                        this.newsList.append(this.createNewsCard(item));
                    });
                }
            } catch (e) {
                console.error('Trending News Error:', e);
            }
        });
    }

    createBreakingCard(item) {
        const card = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            css_classes: ['breaking-news-card'],
            spacing: 8,
            hexpand: true
        });

        const title = new Gtk.Label({
            label: item.title,
            wrap: true,
            max_width_chars: 40,
            halign: Gtk.Align.START,
            css_classes: ['breaking-title']
        });

        card.append(title);
        
        const gesture = new Gtk.GestureClick();
        gesture.connect('pressed', () => {
            Gio.AppInfo.launch_default_for_uri_async(item.link, null, null, null);
        });
        card.add_controller(gesture);

        return card;
    }

    createNewsCard(item) {
        const card = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            css_classes: ['news-card'],
            spacing: 4
        });

        const title = new Gtk.Label({
            label: item.title,
            wrap: true,
            halign: Gtk.Align.START,
            css_classes: ['news-title']
        });

        const meta = new Gtk.Label({
            label: `${item.pubDate} • Bing`,
            halign: Gtk.Align.START,
            css_classes: ['news-meta']
        });

        card.append(title);
        card.append(meta);

        const gesture = new Gtk.GestureClick();
        gesture.connect('pressed', () => {
            Gio.AppInfo.launch_default_for_uri_async(item.link, null, null, null);
        });
        card.add_controller(gesture);

        return card;
    }
});
