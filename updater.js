import GObject from 'gi://GObject';
import GLib from 'gi://GLib';

export const AutoUpdater = GObject.registerClass({
    Signals: {
        'update-available': {},
        'update-progress': { param_types: [GObject.TYPE_STRING] },
        'update-error': { param_types: [GObject.TYPE_STRING] }
    }
}, class AutoUpdater extends GObject.Object {
    _init() {
        super._init();
        this.checking = false;
        this.updatePending = false;
        this.startAutoCheck();
    }

    startAutoCheck() {
        // Check every 3 seconds (3000 ms)
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 3000, () => {
            if (!this.checking && !this.updatePending) {
                this.checkForUpdates();
            }
            return GLib.SOURCE_CONTINUE;
        });
    }

    async checkForUpdates() {
        this.checking = true;
        try {
            // Fetch latest from remote
            const [fetchSuccess] = GLib.spawn_command_line_sync('git fetch origin');
            if (fetchSuccess) {
                const [statusSuccess, stdout] = GLib.spawn_command_line_sync('git status -uno');
                const statusOut = new TextDecoder().decode(stdout);
                
                // If we are behind origin/main
                if (statusOut.includes('Your branch is behind')) {
                    console.log('Updater: Update available!');
                    this.updatePending = true;
                    this.emit('update-available');
                }
            }
        } catch (e) {
            console.error('Updater: Failed to check for updates', e);
        } finally {
            this.checking = false;
        }
    }

    async applyUpdate() {
        if (!this.updatePending) return;
        
        console.log('Updater: Applying update...');
        this.emit('update-progress', 'Downloading new code...');
        
        try {
            // Bulletproof OTA Update: Fetch and hard reset to discard any dirty local state
            const [fetchSuccess] = GLib.spawn_command_line_sync('git fetch origin');
            const [resetSuccess, pullOut, pullErr] = GLib.spawn_command_line_sync('git reset --hard origin/main');
            
            if (resetSuccess) {
                console.log('Updater: Update pulled successfully. Restarting...');
                this.emit('update-progress', 'Restarting application...');
                
                // Give UI a moment to show the message, then restart
                GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
                    // Exec the run script to restart the app
                    const runScript = GLib.build_filenamev([GLib.get_current_dir(), 'run.sh']);
                    GLib.spawn_command_line_async(`bash "${runScript}"`);
                    
                    // Exit current instance
                    imports.system.exit(0);
                    return GLib.SOURCE_REMOVE;
                });
            } else {
                const errStr = new TextDecoder().decode(pullErr);
                console.error('Updater: Failed to pull update', errStr);
                this.emit('update-error', 'Failed to merge updates.');
            }
        } catch (e) {
            console.error('Updater: Exception applying update', e);
            this.emit('update-error', e.message);
        }
    }
});
