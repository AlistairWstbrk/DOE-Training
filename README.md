# 3D Gaussian Splatting Viewer

> **Credit:** This project is a modified fork of the original WebGL real-time renderer for 3D Gaussian Splatting created by [antimatter15](https://github.com/antimatter15/splat). 

## About The Project

This repository serves as an interactive, web-based 3D Gaussian Splatting viewer developed for an undergraduate research project. While utilizing the core rendering capabilities of the original WebGL implementation, this version has been heavily customized to facilitate the organization, selection, and viewing of specific data sets—with a primary focus on vehicle scans. 

## Key Additions & Features

* **Interactive Scan Selector:** A custom UI integration that allows users to easily swap between different `.splat` models without needing to alter URL parameters.
* **Category Sorting:** Scans are organized by category, making it easier to filter and navigate through specific subsets of the research data.
* **Custom Vehicle Models:** Pre-configured to load and render specialized vehicle scans directly from the `models.json` registry.
* **Modified Camera Controls:** Adjusted default view matrices and refined camera handling to provide better inspection angles for the loaded models.

## Controls

*(Note: Update this section if your HTML modifications changed any of the default keybinds)*

**Movement & Camera**
* **Orbit:** Click and drag (Mouse) / One finger drag (Touch)
* **Pan:** Right-click and drag (Mouse) / Two-finger pan (Touch) / Arrow keys
* **Zoom:** Scroll wheel (Mouse) / Pinch (Touch)

## Development & Deployment

This project is deployed using GitHub Pages. Any updates pushed to the `main` branch will automatically trigger a new deployment. 

To add new models, ensure the `.ply` or `.splat` files are properly formatted, hosted with CORS enabled, and indexed within the repository's configuration.
