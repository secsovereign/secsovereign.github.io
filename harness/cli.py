"""bitcoin-cli wrapper for the local regtest datadir.

The datadir is disposable. Tests start bitcoind themselves.
"""

import json
import subprocess

DATADIR = "/tmp/btc-regtest"


class CliError(RuntimeError):
    def __init__(self, cmd, stderr):
        super().__init__(stderr.strip() or "bitcoin-cli failed")
        self.cmd = cmd
        self.stderr = stderr


def cli(*args, wallet=None):
    cmd = ["bitcoin-cli", f"-datadir={DATADIR}"]
    if wallet:
        cmd.append(f"-rpcwallet={wallet}")
    cmd += [str(a) for a in args]
    proc = subprocess.run(cmd, text=True, capture_output=True)
    if proc.returncode != 0:
        raise CliError(args, proc.stderr or proc.stdout)
    out = proc.stdout.strip()
    if not out:
        return None
    try:
        return json.loads(out)
    except json.JSONDecodeError:
        return out


def ensure_bitcoind():
    try:
        cli("getblockcount")
        return
    except CliError:
        pass
    subprocess.run(
        ["bitcoind", f"-datadir={DATADIR}", "-daemon"],
        check=True,
    )
    for _ in range(50):
        try:
            cli("getblockcount")
            return
        except CliError:
            import time
            time.sleep(0.1)
    raise RuntimeError("bitcoind did not come up")
