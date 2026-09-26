# Mockup Export

Part of the builder (**priority 10**). Status: planned.

## Goal

Turn a finished paintjob into image files, made in the browser.

| Format | Content |
|---|---|
| PNG | High-res renders from preset camera angles, transparent or studio background |

## Technical Notes

- Render the canvas at a higher resolution with a one-off render target.
- Download straight from the browser. No server.

## Open Decisions

- Other formats in the browser (TIFF, layered PSD via `ag-psd`, SVG/PDF).
