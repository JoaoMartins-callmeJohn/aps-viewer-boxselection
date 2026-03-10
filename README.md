# APS Viewer - Box Selection

![platforms](https://img.shields.io/badge/platform-windows%20%7C%20osx%20%7C%20linux-lightgray.svg)
[![viewer](https://img.shields.io/badge/Viewer-v7-blue.svg)](https://aps.autodesk.com/en/docs/viewer/v7)
[![license](https://img.shields.io/:license-mit-green.svg)](https://opensource.org/licenses/MIT)

An [Autodesk Platform Services](https://aps.autodesk.com) Viewer extension that adds a **Select All in View** button, allowing users to programmatically select every element currently visible in the viewport. The extension wraps the built-in `Autodesk.BoxSelection` extension and provides a UI panel with an option to include or exclude occluded (hidden behind other geometry) elements.

![thumbnail](thumbnail.png)

## Features

- **Select All in View** — one-click selection of every element visible in the current camera frustum.
- **Include / Exclude Occluded Elements** — toggle whether elements hidden behind other geometry are included in the selection. When enabled, the selection uses geometric intersection rather than pixel-based visibility.
- **Custom Toolbar Button & Docking Panel** — integrates seamlessly into the Viewer toolbar with a panel that can be dragged and toggled.

## How It Works

The extension uses the built-in `Autodesk.BoxSelection` extension under the hood. When the user clicks **Select All in View**, it:

1. Loads (or reloads) `Autodesk.BoxSelection` with the current `useGeometricIntersection` setting.
2. Sets the box selection tool's start and end points to cover the entire canvas.
3. Retrieves the resulting selection and applies it to the viewer.

## Usage

1. Load a model in the Viewer.
2. Click the **Select All in View** toolbar button to open the panel.
3. Toggle **Include occluded elements** on or off depending on whether you want to select hidden geometry.
4. Click **Select All in View** in the panel to select all matching elements.

## Development

### Prerequisites

- [APS application credentials](https://aps.autodesk.com/en/docs/oauth/v2/tutorials/create-app/) (or an access token endpoint)
- A URN of a model translated via the [Model Derivative](https://aps.autodesk.com/en/docs/model-derivative/v2) service
- A web browser with JavaScript enabled
- A static file server (e.g., VS Code Live Server, `npx serve`, Python `http.server`)

### Running Locally

1. Clone this repository:

    ```bash
    git clone https://github.com/autodesk-platform-services/aps-viewer-boxselection.git
    cd aps-viewer-boxselection
    ```

2. Update `index.html` with your own access token endpoint and model URN. Replace the `getToken()` function with your token retrieval logic, and update the URN passed to `initAPSViewer()` in the `<body onload="...">` attribute.

3. Serve the files with any static HTTP server. For example:

    ```bash
    npx serve .
    ```

4. Open the served URL in your browser.

### Using the Extension in Your Own Project

1. Include the Viewer library and the extension script:

    ```html
    <script src="https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.min.js"></script>
    <script src="BoxSelectionExtension.js"></script>
    ```

2. Register the extension when initializing the Viewer:

    ```javascript
    const config = { extensions: ['BoxSelectionExtension'] };
    const viewer = new Autodesk.Viewing.GuiViewer3D(container, config);
    ```

## Known Limitations

- The extension uses the full canvas bounding rect for selection, so results depend on the current camera position and zoom level.
- Occluded element detection relies on `Autodesk.BoxSelection`'s `useGeometricIntersection` option, which may have performance implications on very large models.

## License

This sample is licensed under the terms of the [MIT License](LICENSE). Refer to the `LICENSE` file for more details.
