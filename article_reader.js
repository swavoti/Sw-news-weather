import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk?version=4.0';
import Adw from 'gi://Adw?version=1';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export const ArticleReader = GObject.registerClass(
class ArticleReader extends Gtk.Box {
    _init() {
        super._init({
            orientation: Gtk.Orientation.VERTICAL,
            css_classes: ['article-page']
        });

        this.buildUI();
    }

    buildUI() {
        const scrolled = new Gtk.ScrolledWindow({ vexpand: true });
        this.content = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 12 });
        scrolled.set_child(this.content);
        this.append(scrolled);

        this.image = new Gtk.Picture({ css_classes: ['article-image'], can_shrink: true });
        this.titleLabel = new Gtk.Label({ wrap: true, xalign: 0, css_classes: ['article-title'] });
        this.bodyLabel = new Gtk.Label({ wrap: true, xalign: 0, css_classes: ['article-content'] });

        this.content.append(this.image);
        this.content.append(this.titleLabel);
        this.content.append(this.bodyLabel);
    }

    async loadArticle(item) {
        // Reset
        this.titleLabel.set_label(item.title);
        this.bodyLabel.set_label("Fetching full content...");
        this.image.set_file(null);

        if (item.thumbnail) {
            this.image.set_file(Gio.File.new_for_uri(item.thumbnail));
        }

        console.log(`ArticleReader: Fetching ${item.link}`);

        try {
            const [success, stdout, stderr] = GLib.spawn_command_line_sync(`curl -L -s "${item.link}"`);
            if (success) {
                const html = new TextDecoder().decode(stdout);
                const text = this.extractText(html);
                this.bodyLabel.set_label(text || item.content || item.description || "Could not extract content.");
            } else {
                this.bodyLabel.set_label(item.description || "Failed to fetch content.");
            }
        } catch (e) {
            console.error('ArticleReader Error:', e.message);
            this.bodyLabel.set_label(item.description || "Error loading article.");
        }
    }

    extractText(html) {
        // Very basic extraction of <p> tags
        const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
        let match;
        let results = [];
        while ((match = pRegex.exec(html)) !== null) {
            let text = match[1].replace(/<[^>]*>?/gm, '').trim();
            if (text.length > 50) results.push(text);
        }
        return results.slice(0, 15).join("\n\n");
    }
});
