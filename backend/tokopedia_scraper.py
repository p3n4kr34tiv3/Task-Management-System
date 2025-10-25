"""Utility script to scrape Tokopedia product pages.

This script downloads selected text fields and images from the
provided Tokopedia product URL. It saves the scraped text into a
``product.txt`` file and downloads any images found on the page
into a ``downloads`` directory.
"""

from __future__ import annotations

import os
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup


# Default headers so Tokopedia serves the normal product page
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
}


def scrape_tokopedia(url: str, download_dir: str = "downloads") -> dict[str, str]:
    """Scrape a Tokopedia product page.

    Parameters
    ----------
    url:
        The URL of the product page to scrape.
    download_dir:
        Directory where text and images will be saved.

    Returns
    -------
    dict
        A dictionary containing scraped text fields.
    """

    response = requests.get(url, headers=HEADERS)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    # Select key elements. Adjust the selectors as Tokopedia updates
    # their page structure.
    title_el = soup.select_one("h1[data-testid='lblPDPDetailProductName']")
    price_el = soup.select_one("div[data-testid='lblPDPDetailProductPrice']")
    description_el = soup.select_one("div[data-testid='lblPDPDescriptionProduk']")

    data = {
        "title": title_el.get_text(strip=True) if title_el else "",
        "price": price_el.get_text(strip=True) if price_el else "",
        "description": (
            description_el.get_text(" ", strip=True) if description_el else ""
        ),
    }

    out_dir = Path(download_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    # Save text data
    with (out_dir / "product.txt").open("w", encoding="utf-8") as f:
        for key, value in data.items():
            f.write(f"{key}: {value}\n")

    # Download images
    for i, img in enumerate(soup.find_all("img"), start=1):
        src = img.get("src")
        if not src:
            continue
        img_url = urljoin(url, src)
        try:
            img_response = requests.get(img_url, headers=HEADERS)
            img_response.raise_for_status()
        except Exception:
            continue

        extension = os.path.splitext(urlparse(img_url).path)[1] or ".jpg"
        with (out_dir / f"image_{i}{extension}").open("wb") as f:
            f.write(img_response.content)

    return data


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Scrape Tokopedia product page")
    parser.add_argument("url", help="Tokopedia product URL")
    parser.add_argument(
        "--output", "-o", default="downloads", help="Directory to store downloads"
    )
    args = parser.parse_args()

    info = scrape_tokopedia(args.url, args.output)
    print("Scraped fields:")
    for k, v in info.items():
        print(f"{k}: {v}")
