import St from 'gi://St';
import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as SystemActions from 'resource:///org/gnome/shell/misc/systemActions.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

export default class QuickShutdownButton extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._actions = SystemActions.getDefault();

        // PanelMenu.Button au lieu de St.Bin — intégration correcte dans le panel
        this._button = new PanelMenu.Button(0.0, this.metadata.name, true);

        this._icon = new St.Icon({
            icon_name: 'system-shutdown-symbolic',
            style_class: 'system-status-icon'
        });
        this._button.add_child(this._icon);

        this._updateStyle();
        this._settingsConn = this._settings.connect('changed::use-red-style',
            () => this._updateStyle());

        this._button.connect('button-release-event', (_actor, event) => {
            if (event.get_button() === 1) {
                this._actions.activatePowerOff();
                return Clutter.EVENT_STOP;
            }
            return Clutter.EVENT_PROPAGATE;
        });

        // Méthode officielle pour ajouter au panel
        Main.panel.addToStatusArea(this.uuid, this._button, 0, 'right');
    }

    _updateStyle() {
        const useRed = this._settings.get_boolean('use-red-style');
        this._button.style_class = useRed
            ? 'panel-button quick-shutdown-button red-style'
            : 'panel-button quick-shutdown-button';
    }

    disable() {
        if (this._settingsConn) {
            this._settings?.disconnect(this._settingsConn);
            this._settingsConn = null;
        }
        this._button?.destroy();
        this._button = null;
        this._icon = null;
        this._settings = null;
        this._actions = null;
    }
}
