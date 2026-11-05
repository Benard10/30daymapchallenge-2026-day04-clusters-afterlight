# Day 4: Clusters | #30DayMapChallenge 2026

## AFTERLIGHT - Africa after dark

**How have Africa's night lights changed, and how does that compare with changes in its economies?**

AFTERLIGHT is an interactive map of **54 African countries from 2004 to 2024**. It brings together satellite records of night lights and national GDP figures. Choose a country, press play, and follow twenty years of change.

## What the app communicates

At night, lights gather around cities, towns, roads and industrial areas. These bright patches form clusters that show where light-producing human activity is concentrated.

The app asks two connected questions:

- **Where are the lights, and how have they changed?** Watch bright areas grow, fade or remain relatively unchanged over time.
- **How has GDP changed during the same years?** Follow the country's economic trend alongside its night-light trend.

GDP is the value of goods and services produced in a country. It gives a view of the size of an economy; it does not tell us how income is shared or how every household is doing.

The aim is to help you notice patterns and ask questions. Do lights and GDP rise together? Does one change faster? Are there years when their paths move apart?

**Brighter lights do not automatically mean a wealthier country. The app helps us explore a relationship, rather than assume an answer.**

## How to explore

1. **Choose a country** from the menu or click it on the map.
2. **Press play or move the year slider.** The country stays selected while the map and statistics update together.
3. **Watch the lights.** Look for changes in where bright areas gather and how far they extend.
4. **Read the left panel.** It shows the change in total night lights since 2004, the selected year's GDP, and its change since 2004 where data are available.
5. **Follow the chart.** Gold represents total night lights; violet represents GDP.
6. **Choose another country.** Its review starts at 2004.

Playback stops at 2024. Pressing play again restarts the same country's timeline. Moving the map manually pauses playback.

## Two stories, one timeline

The chart compares **how much each measure has changed**, rather than comparing dollars directly with light measurements.

Both lines start at **100** in the first year with usable data for both:

| Chart value | What it means |
| --- | --- |
| 100 | The starting amount |
| 150 | 50% more than the starting amount |
| 200 | Double the starting amount |
| 75 | 25% less than the starting amount |

For example, if the light line reaches 200 while GDP reaches 150, total night lights have doubled while GDP has increased by 50%. This is an illustration of how to read the chart, not a result for a particular country.

The starting year appears above the chart. It is usually 2004, but can be later when earlier GDP figures are missing. The panel's "since 2004" figures remain unavailable when that comparison cannot be made.

GDP uses **2015 prices** to support comparison across years without the effect of inflation. The map uses the **same light colour scale every year**.

## What the lights cannot tell us on their own

- Industry, gas flaring and changes in lighting technology can affect what satellites record.
- Similar trends do not prove that changes in lights caused changes in GDP, or the other way around.
- Each map shows a whole year's average, not one particular night.
- Earlier years include estimates based on older satellite records.
- Readings are grouped into cells about 7.4 km wide at the equator. This is a broad view, not a map of individual buildings or street lights. Small islands and border areas are less precise.
- Missing GDP figures stay missing; they are not replaced with zero or another year's value.

This release includes **21 yearly views, from 2004 to 2024**. Later years have not been added.

## More detail, when you want it

The selected-country panel keeps the main story in view: night lights, GDP and the comparison chart.

In the Africa overview, **Explore the numbers** contains additional measures and country comparisons. **About the data** explains the measurements, lists the sources and defines abbreviations such as GDP, VIIRS and DMSP.

See the [data guide](data/README.md) and [full methodology](data/methodology.json) for technical details.

## Run locally

From this repository's root:

```powershell
python -m http.server 5500 --bind 127.0.0.1
```

Open **http://127.0.0.1:5500/**. Choose another port if 5500 is already in use.

When serving the parent challenge collection instead, open **http://127.0.0.1:5500/2026/day04-clusters/**.

No build step, backend, database or API key is required. The app needs a WebGL-capable browser and internet access for the map library and fonts. Country statistics, boundaries and yearly light images are included locally.

## GitHub Pages

Suggested repository: `30daymapchallenge-2026-day04-clusters-afterlight`.

After pushing, select **Settings > Pages > Deploy from a branch > main > / (root)**. Keep `.nojekyll` in the repository. No build workflow is required.

The Git ignore rules retain the app, required data and credits. Preparation scripts, verification utilities, caches, raw satellite files and unused overlays remain local.

## Sources and credits

- **Night lights:** Cheng et al. (2026), [night-light dataset article](https://doi.org/10.5194/essd-18-3449-2026) and [original dataset](https://doi.org/10.25442/hku.31321315.v2). Annual files came from the [public mirror](https://huggingface.co/datasets/faviolc/hku-viirs-nighttime-lights-global), pinned to revision `1b75d3c86fb1c84b15052ccfbcca2f6145ad3ae7`. CC BY 4.0.
- **GDP:** [World Bank World Development Indicators](https://data.worldbank.org/indicator/NY.GDP.MKTP.KD), indicator `NY.GDP.MKTP.KD`, in constant 2015 US dollars. CC BY 4.0.
- **Boundaries:** Natural Earth 1:50m, public domain. Boundaries stay fixed throughout the timeline. Somaliland is included with Somalia; Western Sahara appears for context and is excluded from country rankings. These choices do not express a position on disputed boundaries.

Retain these credits and the notices in [data/README.md](data/README.md) when redistributing the derived data. The [source manifest](data/source-manifest.json) records source files, dates and hashes.

Built with HTML, CSS, JavaScript and MapLibre GL JS 4.7.1. MapLibre retains its BSD 3-Clause license; Google Fonts retain their font licenses. No separate application source license has been selected.
