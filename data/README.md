# AFTERLIGHT data

These are derived **real data**, not generated city points or interpolated brightness.

* Night lights: Cheng, H. et al. (2026), [A temporally consistent global 500 m-resolution monthly VIIRS-like nighttime light dataset (1992–2024)](https://doi.org/10.5194/essd-18-3449-2026), [HKU dataset](https://doi.org/10.25442/hku.31321315.v2), CC BY 4.0. Annual mean GeoTIFFs accessed through the [faviolc Hugging Face mirror](https://huggingface.co/datasets/faviolc/hku-viirs-nighttime-lights-global), pinned revision `1b75d3c86fb1c84b15052ccfbcca2f6145ad3ae7`.
* GDP: World Bank WDI, [`NY.GDP.MKTP.KD`](https://data.worldbank.org/indicator/NY.GDP.MKTP.KD), constant 2015 US dollars, 2004–2024. Null means an observation was unavailable; there is no interpolation.
* Boundaries: Natural Earth 1:50m admin-0 countries, public domain. Somaliland geometry is combined with Somalia. Western Sahara is displayed as a disputed context territory and excluded from the 54-country statistical comparison.

The data rectangle includes Cabo Verde's western tip, Mauritius/Rodrigues, Seychelles and South Africa's Prince Edward/Marion islands. South Africa's optional `cameraBounds` frames its mainland; its statistics retain the subantarctic island geometry. The yearly light images are 1360 × 1312 pixels, with identical Web Mercator geometry.

## Method

The local preparation script requests native TIFF tiles covering Africa, validates byte-range responses, decodes the native pixels and averages aligned 16 × 16 blocks to a 0.0666667° grid (about 7.4 km at the equator). It does not need to download entire global TIFFs. Cached annual grids and original auxiliary data are kept in `.cache/`.

Country membership uses `all_touched` rasterization. A cell crossing a boundary is assigned to one country. Spherical cell area supplies the area weights. Mean radiance and total radiance are calculated from this coarse grid. Lit area is the area of cells with **mean radiance ≥1 nW cm⁻² sr⁻¹**. Clusters are eight-connected lit cells across Africa, labelled before country intersection. A country counts every component intersecting its cells. Concentration is its intersection area with the largest intersecting component divided by its total lit area, or null when there is no lit area. `coverage` is finite radiance area / rasterized country area; `litShare` is lit area / finite radiance area. These coarse-grid clusters are exploratory measures, not exact urban settlements or native-resolution hotspot counts. Small islands and boundary cells are especially sensitive to coarse rasterization.

The earlier source years are reconstructed VIIRS-like radiance from older DMSP observations. This is a harmonized modelled satellite record, not direct VIIRS observations for all 21 years. Model uncertainty, sensor changes, gas flaring and non-economic lighting affect interpretation. GDP and lights correlations describe association, not causation, and trending annual levels can produce high correlations.

`lights/YYYY.png` is reprojected to EPSG:3857 and georeferenced by the WGS84 corners in `atlas.json.rasterBounds`. All years share one logarithmic colour/opacity transfer function, enhancing weak signals for display. Display intensity is not a linear quantitative radiance scale. No synthetic light points are added. Metrics are derived before display enhancement.

`source-manifest.json` pins the satellite mirror revision and records annual source paths, file sizes and LFS SHA-256 hashes, plus hashes of the downloaded GDP and boundary responses.

## Local preparation (not included in the app repository)

Python dependencies: `numpy rasterio scipy pillow tifffile imagecodecs`. Run `python prepare_data.py` from any working directory. A repository `.day04-tools` directory is supported for isolated dependencies. Complete all downloads before publishing `atlas.json`; an intermediate preview is marked `metadata.preparing`.
