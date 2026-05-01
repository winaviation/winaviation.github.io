import bz2
import datetime
import gzip
import hashlib
import json
import os
import shutil
import subprocess

DEBS_DIR = "./debs"
PACKAGES_FILE = "Packages"
RELEASE_FILE = "Release"
REPO_BASE_URL = "https://winaviation.github.io/repo"

PACKAGE_FIELDS = [
    "Package",
    "Name",
    "Version",
    "Architecture",
    "Maintainer",
    "Author",
    "Depends",
    "Icon",
    "Description",
    "Section",
    "SileoDepiction",
    "Filename",
    "Size",
    "SHA256",
]


def read_deb_fields(deb_path):
    try:
        result = subprocess.run(
            ["dpkg-deb", "-f", deb_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            text=True,
            check=False,
        )
    except Exception:
        return {}

    fields = {}
    current_key = None
    for line in result.stdout.splitlines():
        if line.startswith(" "):
            if current_key:
                fields[current_key] += "\n" + line.strip()
            continue
        if ": " not in line:
            continue
        key, value = line.split(": ", 1)
        current_key = key.strip()
        fields[current_key] = value.strip()
    return fields


def sha256(path):
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(8192), b""):
            digest.update(chunk)
    return digest.hexdigest()


def compress(path):
    for suffix in (".gz", ".bz2"):
        try:
            os.remove(path + suffix)
        except FileNotFoundError:
            pass

    with open(path, "rb") as source:
        with gzip.open(path + ".gz", "wb") as target:
            shutil.copyfileobj(source, target)

    with open(path, "rb") as source:
        with bz2.open(path + ".bz2", "wb") as target:
            shutil.copyfileobj(source, target)


def write_release():
    now = datetime.datetime.now(datetime.timezone.utc)
    date_str = now.strftime("%a, %d %b %Y %H:%M:%S UTC")
    lines = [
        "Origin: dylv's repo",
        "Label: dylv's repo",
        "Suite: stable",
        "Version: 1.0",
        "Codename: ios",
        f"Date: {date_str}",
        "Architectures: iphoneos-arm iphoneos-arm64 iphoneos-arm64e",
        "Components: main",
        "Description: my nice lil repo",
        "SHA256:",
    ]

    for filename in (PACKAGES_FILE, "Packages.gz", "Packages.bz2"):
        if not os.path.exists(filename):
            continue
        lines.append(f" {sha256(filename)} {os.path.getsize(filename)} {filename}")

    with open(RELEASE_FILE, "w", encoding="utf-8") as handle:
        handle.write("\n".join(lines) + "\n")


def safe_package_name(package_name):
    return "".join(
        char for char in package_name if char.isalnum() or char in ("-", "_", ".")
    ).strip(".")


def read_changelog(package_name, version):
    safe_name = safe_package_name(package_name)
    if not safe_name or not version:
        return ""

    candidates = [
        os.path.join("changelogs", safe_name, f"{version}.md"),
        os.path.join("changelogs", f"{version}.md"),
    ]
    for path in candidates:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as handle:
                return handle.read().strip()
    return ""


def generate_depiction(fields):
    package_name = fields.get("Package", "")
    version = fields.get("Version", "")
    changelog = read_changelog(package_name, version)
    if not changelog:
        return ""

    safe_name = safe_package_name(package_name)
    depiction_dir = os.path.join("depictions", safe_name)
    os.makedirs(depiction_dir, exist_ok=True)

    data = {
        "class": "DepictionTabView",
        "tabs": [
            {
                "tabname": "Overview",
                "views": [
                    {
                        "class": "DepictionHeaderView",
                        "title": fields.get("Name") or package_name,
                        "subtitle": version,
                    },
                    {
                        "class": "DepictionMarkdownView",
                        "markdown": fields.get("Description") or f"Package: {package_name}",
                    },
                ],
            },
            {
                "tabname": "Changelog",
                "views": [
                    {
                        "class": "DepictionMarkdownView",
                        "markdown": changelog,
                    }
                ],
            },
        ],
    }

    output_path = os.path.join(depiction_dir, "index.json")
    with open(output_path, "w", encoding="utf-8") as handle:
        json.dump(data, handle, ensure_ascii=False, indent=2)
        handle.write("\n")

    return f"{REPO_BASE_URL}/depictions/{safe_name}/index.json"


def write_packages():
    if not os.path.exists(DEBS_DIR):
        print(f"error: {DEBS_DIR} directory not found")
        return

    packages = []
    for filename in os.listdir(DEBS_DIR):
        if not filename.endswith(".deb"):
            continue

        deb_path = os.path.join(DEBS_DIR, filename)
        fields = read_deb_fields(deb_path)
        package = {
            "Package": fields.get("Package", ""),
            "Name": fields.get("Name", ""),
            "Version": fields.get("Version", ""),
            "Architecture": fields.get("Architecture", ""),
            "Maintainer": fields.get("Maintainer", ""),
            "Author": fields.get("Author", ""),
            "Depends": fields.get("Depends", ""),
            "Icon": fields.get("Icon", ""),
            "Description": fields.get("Description", ""),
            "Section": fields.get("Section", ""),
            "Filename": f"debs/{filename}",
            "Size": str(os.path.getsize(deb_path)),
            "SHA256": sha256(deb_path),
        }

        sileo_depiction = fields.get("SileoDepiction", "") or generate_depiction(fields)
        if sileo_depiction:
            package["SileoDepiction"] = sileo_depiction

        packages.append(package)

    with open(PACKAGES_FILE, "w", encoding="utf-8") as handle:
        for package in packages:
            for field in PACKAGE_FIELDS:
                value = package.get(field)
                if value:
                    handle.write(f"{field}: {value}\n")
            handle.write("\n")

    compress(PACKAGES_FILE)
    write_release()


if __name__ == "__main__":
    write_packages()
