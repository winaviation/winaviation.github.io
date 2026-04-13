import bz2
import gzip
import hashlib
import os
import shutil
import subprocess

DEBS_DIR = "./debs"
OUTPUT_FILE = "Packages"

ORDER = [
    "Package",
    "Version",
    "Architecture",
    "Maintainer",
    "Author",
    "Depends",
    "Description",
    "Filename",
    "Size",
    "SHA256",
]


def get_control_fields(deb_path):
    try:
        result = subprocess.run(
            ["dpkg-deb", "-f", deb_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            text=True,
        )

        content = result.stdout
        fields = {}
        current_key = None

        for line in content.splitlines():
            if line.startswith(" "):
                if current_key:
                    fields[current_key] += "\n" + line.strip()
                continue

            if ": " in line:
                key, val = line.split(": ", 1)
                key = key.strip()
                val = val.strip()
                fields[key] = val
                current_key = key

        return fields

    except Exception:
        return {}


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def compress_packages_file(filename):
    # remove old compressed files
    for ext in [".gz", ".bz2"]:
        try:
            os.remove(filename + ext)
        except FileNotFoundError:
            pass

    # gzip
    with open(filename, "rb") as f_in:
        with gzip.open(filename + ".gz", "wb") as f_out:
            shutil.copyfileobj(f_in, f_out)

    # bzip2
    with open(filename, "rb") as f_in:
        with bz2.open(filename + ".bz2", "wb") as f_out:
            shutil.copyfileobj(f_in, f_out)


def main():
    entries = []

    for filename in os.listdir(DEBS_DIR):
        if not filename.endswith(".deb"):
            continue

        path = os.path.join(DEBS_DIR, filename)

        control = get_control_fields(path)
        size = os.path.getsize(path)
        sha256 = sha256_file(path)

        entry = {
            "Package": control.get("Package", ""),
            "Version": control.get("Version", ""),
            "Architecture": control.get("Architecture", ""),
            "Maintainer": control.get("Maintainer", ""),
            "Author": control.get("Author", ""),
            "Depends": control.get("Depends", ""),
            "Description": control.get("Description", ""),
            "Filename": f"debs/{filename}",
            "Size": str(size),
            "SHA256": sha256,
        }

        entries.append(entry)

    with open(OUTPUT_FILE, "w") as f:
        for entry in entries:
            for key in ORDER:
                val = entry.get(key)
                if val:
                    f.write(f"{key}: {val}\n")
            f.write("\n")


if __name__ == "__main__":
    main()
