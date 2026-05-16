import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk?version=4.0';
import Soup from 'gi://Soup?version=3.0';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

export const NewsWidget = GObject.registerClass(
class NewsWidget extends Gtk.Box {
    _init() {
        super._init({
            orientation: Gtk.Orientation.VERTICAL,
            css_classes: ['news-list'],
            spacing: 0
        });

        this.session = new Soup.Session();

        this.loadingLabel = new Gtk.Label({
            label: "Loading Top Stories...",
            css_classes: ['loading-label'],
            halign: Gtk.Align.CENTER
        });
        
        this.append(this.loadingLabel);

        this.fetchNews();
    }

    fetchNews() {
        const rssUrl = encodeURIComponent("https://www.bing.com/news/search?q=Top+Stories&format=rss");
        const url = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;

        const msg = Soup.Message.new('GET', url);
        
        this.session.send_and_read_async(msg, GLib.PRIORITY_DEFAULT, null, (session, res) => {
            try {
                const bytes = session.send_and_read_finish(res);
                const data = new TextDecoder().decode(bytes.get_data ? bytes.get_data() : bytes.toArray());
                const json = JSON.parse(data);
                
                this.remove(this.loadingLabel);

                if (json.status === 'ok' && json.items) {
                    for (const item of json.items) {
                        this.append(this.createNewsCard(item));
                    }
                } else {
                    this.append(new Gtk.Label({ label: 'Failed to parse news feed.' }));
                }
            } catch (e) {
                this.loadingLabel.set_label('Error fetching news.');
                console.error('News Fetch Error:', e);
            }
        });
    }

    createNewsCard(item) {
        const card = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            css_classes: ['news-card'],
            spacing: 4
        });

        const titleLabel = new Gtk.Label({
            label: item.title,
            wrap: true,
            halign: Gtk.Align.START,
            css_classes: ['news-title']
        });

        const metaText = `${item.pubDate} • ${item.author || 'Bing News'}`;
        const metaLabel = new Gtk.Label({
            label: metaText,
            halign: Gtk.Align.START,
            css_classes: ['news-meta']
        });

        card.append(titleLabel);
        card.append(metaLabel);

        // Make it clickable
        const gesture = new Gtk.GestureClick();
        gesture.connect('pressed', () => {
            const uri = GLib.Uri.parse(item.link, GLib.UriFlags.NONE);
            if (uri) {
                Gio.AppInfo.launch_default_for_uri_async(item.link, null, null, null);
            }
        });
        card.add_controller(gesture);

        return card;
    }
});
