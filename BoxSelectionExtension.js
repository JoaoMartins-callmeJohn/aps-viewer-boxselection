class BoxSelectionPanel extends Autodesk.Viewing.UI.DockingPanel {
    constructor(extension, id, title, options) {
        super(extension.viewer.container, id, title, options);
        this.extension = extension;
        this.container.style.left = (options.x || 0) + 'px';
        this.container.style.top = (options.y || 0) + 'px';
        this.container.style.width = (options.width || 300) + 'px';
        this.container.style.height = (options.height || 160) + 'px';
        this.container.style.resize = 'none';
        this.container.style.overflow = 'visible';
    }

    initialize() {
        this.title = this.createTitleBar(this.titleLabel || this.container.id);
        this.initializeMoveHandlers(this.title);
        this.container.appendChild(this.title);

        this.content = document.createElement('div');
        this.content.style.padding = '16px';
        this.content.style.boxSizing = 'border-box';
        this.content.style.backgroundColor = '#ffffff';
        this.content.style.fontFamily = 'ArtifaktElement, Arial, sans-serif';
        this.content.style.position = 'relative';
        this.content.style.zIndex = '2';
        this.content.style.pointerEvents = 'auto';
        this.content.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                <label for="occluded-toggle" style="font-size: 13px; color: #333; cursor: pointer; user-select: none;">
                    Include occluded elements
                </label>
                <label class="boxsel-switch" style="position: relative; display: inline-block; width: 40px; height: 22px; flex-shrink: 0; margin-left: 12px;">
                    <input type="checkbox" id="occluded-toggle" checked
                        style="opacity: 0; width: 0; height: 0;">
                    <span class="boxsel-slider"></span>
                </label>
            </div>
            <button id="boxsel-select-btn" style="
                width: 100%; padding: 8px 0; border: none; border-radius: 4px;
                background-color: #0696d7; color: #fff; font-size: 13px;
                font-family: ArtifaktElement, Arial, sans-serif;
                cursor: pointer; transition: background-color .2s;
            ">Select All in View</button>
            <style>
                #boxselection-panel { border-bottom: none !important; }
                .boxsel-slider {
                    position: absolute; cursor: pointer; inset: 0;
                    background-color: #ccc; border-radius: 22px;
                    transition: background-color .25s;
                }
                .boxsel-switch input:checked + .boxsel-slider { background-color: #0696d7; }
                .boxsel-slider::before {
                    content: ""; position: absolute; height: 16px; width: 16px;
                    left: 3px; bottom: 3px; background-color: #fff;
                    border-radius: 50%; transition: transform .25s;
                }
                .boxsel-switch input:checked + .boxsel-slider::before {
                    transform: translateX(18px);
                }
                #boxsel-select-btn:hover { background-color: #0579ab; }
            </style>
        `;
        this.container.appendChild(this.content);

        const toggle = this.content.querySelector('#occluded-toggle');
        toggle.addEventListener('change', () => {
            this.extension.includeOccluded = toggle.checked;
        });

        const selectBtn = this.content.querySelector('#boxsel-select-btn');
        selectBtn.addEventListener('click', () => {
            this.extension.selectAllInView();
        });
    }
}

class BoxSelectionExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this._button = null;
        this._panel = null;
        this.includeOccluded = true;
    }

    load() {
        console.log('BoxSelectionExtension loaded.');
        return true;
    }

    unload() {
        if (this._button) {
            const group = this.viewer.toolbar.getControl('boxselection-toolbar-group');
            if (group) {
                group.removeControl(this._button);
            }
            this._button = null;
        }
        if (this._panel) {
            this._panel.setVisible(false);
            this._panel.uninitialize();
            this._panel = null;
        }
        console.log('BoxSelectionExtension unloaded.');
        return true;
    }

    onToolbarCreated() {
        this._panel = new BoxSelectionPanel(this, 'boxselection-panel', 'Select All in View', {
            x: 10,
            y: 10,
            width: 280,
            height: 180,
        });

        let group = this.viewer.toolbar.getControl('boxselection-toolbar-group');
        if (!group) {
            group = new Autodesk.Viewing.UI.ControlGroup('boxselection-toolbar-group');
            this.viewer.toolbar.addControl(group);
        }

        const button = new Autodesk.Viewing.UI.Button('boxselection-button');
        button.setToolTip('Select All in View');
        group.addControl(button);

        const icon = button.container.querySelector('.adsk-button-icon');
        if (icon) {
            icon.style.backgroundImage = 'url(https://img.icons8.com/small/32/select-all.png)';
            icon.style.backgroundSize = '24px';
            icon.style.backgroundRepeat = 'no-repeat';
            icon.style.backgroundPosition = 'center';
        }

        button.onClick = () => {
            this._panel.setVisible(!this._panel.isVisible());
            button.setState(
                this._panel.isVisible()
                    ? Autodesk.Viewing.UI.Button.State.ACTIVE
                    : Autodesk.Viewing.UI.Button.State.INACTIVE
            );
        };

        this._button = button;
    }

    async selectAllInView() {
        this.viewer.unloadExtension('Autodesk.BoxSelection');

        const ext = await this.viewer.loadExtension('Autodesk.BoxSelection', {
            useGeometricIntersection: this.includeOccluded,
        });

        const tool = ext.boxSelectionTool;
        const { left: startX, top: startY, right: endX, bottom: endY } =
            this.viewer.impl.getCanvasBoundingClientRect();

        tool.startPoint.set(endX, endY);
        tool.endPoint.set(startX, startY);
        let selection = tool.getSelection();
        viewer.select(selection[0].ids);
        console.log(selection);
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('BoxSelectionExtension', BoxSelectionExtension);
