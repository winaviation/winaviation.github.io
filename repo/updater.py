V = "SHA256"
U = "Size"
T = "Filename"
S = "Packages"
N = "rb"
M = "Description"
L = "Depends"
K = "Author"
J = "Maintainer"
I = "Architecture"
H = "Version"
G = "Package"
F = "\n"
D = open
import bz2
import datetime as P
import gzip
import hashlib as B
import os as A
import shutil as O
import subprocess as C

E = "./debs"
Q = S
W = "Release"
Z = [G, H, I, J, K, L, M, T, U, V]


def a(deb_path):
    try:
        H = C.run(
            ["dpkg-deb", "-f", deb_path], stdout=C.PIPE, stderr=C.DEVNULL, text=True
        )
        I = H.stdout
        D = {}
        E = None
        for A in I.splitlines():
            if A.startswith(" "):
                if E:
                    D[E] += F + A.strip()
                continue
            if ": " in A:
                B, G = A.split(": ", 1)
                B = B.strip()
                G = G.strip()
                D[B] = G
                E = B
        return D
    except Exception:
        return {}


def R(path):
    A = B.sha256()
    with D(path, N) as C:
        for E in iter(lambda: C.read(8192), b""):
            A.update(E)
    return A.hexdigest()


def b(filename):
    G = ".bz2"
    F = ".gz"
    B = filename
    for H in [F, G]:
        try:
            A.remove(B + H)
        except FileNotFoundError:
            pass
    with D(B, N) as C:
        with gzip.open(B + F, "wb") as E:
            O.copyfileobj(C, E)
    with D(B, N) as C:
        with bz2.open(B + G, "wb") as E:
            O.copyfileobj(C, E)


def c():
    E = "dylv's repo"
    G = E
    H = E
    I = "stable"
    J = "1.0"
    K = "ios"
    L = "iphoneos-arm iphoneos-arm64 iphoneos-arm64e"
    M = "main"
    N = "my nice lil repo"
    O = P.datetime.now(P.timezone.utc)
    Q = O.strftime("%a, %d %b %Y %H:%M:%S UTC")
    C = [
        f"Origin: {G}",
        f"Label: {H}",
        f"Suite: {I}",
        f"Version: {J}",
        f"Codename: {K}",
        f"Date: {Q}",
        f"Architectures: {L}",
        f"Components: {M}",
        f"Description: {N}",
        "SHA256:",
    ]
    for B in [S, "Packages.gz", "Packages.bz2"]:
        if A.path.exists(B):
            T = A.path.getsize(B)
            U = R(B)
            C.append(f" {U} {T} {B}")
    with D(W, "w") as V:
        V.write(F.join(C) + F)


def X():
    C = ""
    S = []
    if not A.path.exists(E):
        print(f"error: {E} directory not found")
        return
    for N in A.listdir(E):
        if not N.endswith(".deb"):
            continue
        O = A.path.join(E, N)
        B = a(O)
        d = A.path.getsize(O)
        e = R(O)
        P = {
            G: B.get(G, C),
            H: B.get(H, C),
            I: B.get(I, C),
            J: B.get(J, C),
            K: B.get(K, C),
            L: B.get(L, C),
            M: B.get(M, C),
            T: f"debs/{N}",
            U: str(d),
            V: e,
        }
        S.append(P)
    with D(Q, "w") as W:
        for P in S:
            for X in Z:
                Y = P.get(X)
                if Y:
                    W.write(f"{X}: {Y}\n")
            W.write(F)
    b(Q)
    c()


if __name__ == "__main__":
    X()
