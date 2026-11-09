#!/usr/bin/env python3
"""Print the merge counts cited in Who Governs Bitcoin's Code.

The inputs sit next to this file. prs.jsonl is the S0910 enriched
pull-request list measured on September 10, 2026, reduced to number,
author, created_at, merged, merged_by, and merged_at.
maintainers.json is the roster of GitHub logins and the login aliases
used to build that set.

Author and merger are GitHub logins from the API fields, not git emails.
The script lowercases them and does not rewrite either one through the
alias table. The alias table only canonicalizes the roster. A missing
merger is not a self-merge. TheCharlatan and sedited stay two logins.
"""

import json
from collections import Counter
from datetime import datetime
from pathlib import Path


HERE = Path(__file__).resolve().parent


def normalize_login(login, aliases):
    if not login:
        return ""
    lower = str(login).strip().lower()
    if lower in aliases:
        return str(aliases[lower]).lower()
    return lower


def roster_set(doc):
    aliases = {str(k).lower(): str(v) for k, v in (doc.get("aliases") or {}).items()}
    logins = set()
    for login in doc.get("github_logins") or []:
        logins.add(normalize_login(login, aliases))
    for key, value in aliases.items():
        logins.add(normalize_login(key, aliases))
        logins.add(normalize_login(value, aliases))
    logins.discard("")
    return logins


def one_decimal(numerator, denominator):
    return f"{(100.0 * numerator / denominator):.1f}"


def main():
    doc = json.loads((HERE / "maintainers.json").read_text(encoding="utf-8"))
    roster = roster_set(doc)
    rows = 0
    merged = 0
    merged_with_login = 0
    created_min = None
    created_max = None
    merged_min = None
    merged_max = None
    maintainer_merges = 0
    self_merges = 0
    year_total = Counter()
    year_self = Counter()
    mergers = Counter()

    with (HERE / "prs.jsonl").open(encoding="utf-8") as handle:
        for line in handle:
            if not line.strip():
                continue
            rows += 1
            pr = json.loads(line)
            created_at = pr.get("created_at")
            if created_at:
                if created_min is None or created_at < created_min:
                    created_min = created_at
                if created_max is None or created_at > created_max:
                    created_max = created_at
            if not pr.get("merged"):
                continue
            merged += 1
            merged_at = pr.get("merged_at")
            if merged_at:
                if merged_min is None or merged_at < merged_min:
                    merged_min = merged_at
                if merged_max is None or merged_at > merged_max:
                    merged_max = merged_at
            author = (pr.get("author") or "").lower()
            merger = (pr.get("merged_by") or "").lower()
            if merger:
                merged_with_login += 1
                mergers[merger] += 1
            if author not in roster:
                continue
            maintainer_merges += 1
            is_self = bool(merger and author and merger == author)
            if is_self:
                self_merges += 1
            if not merged_at:
                continue
            year = datetime.fromisoformat(merged_at.replace("Z", "+00:00")).year
            year_total[year] += 1
            if is_self:
                year_self[year] += 1

    top = mergers.most_common(3)
    top_sum = sum(count for _, count in top)
    named_ten = mergers.most_common(10)
    named_ten_sum = sum(count for _, count in named_ten)
    remainder = merged - named_ten_sum

    print(f"rows {rows}")
    print(f"created_min {created_min}")
    print(f"created_max {created_max}")
    print(f"merged_min {merged_min}")
    print(f"merged_max {merged_max}")
    print(f"roster_logins {len(roster)}")
    print(f"maintainer_merges {maintainer_merges}")
    print(f"self_merges {self_merges}")
    print(f"self_merge_percent {one_decimal(self_merges, maintainer_merges)}")
    print(f"year_2025_maintainer_merges {year_total[2025]}")
    print(f"year_2025_self_merges {year_self[2025]}")
    print(f"year_2025_self_merge_percent {one_decimal(year_self[2025], year_total[2025])}")
    print(f"merged {merged}")
    print(f"merged_with_login {merged_with_login}")
    print(f"unique_merger_logins {len(mergers)}")
    for login, count in top:
        print(f"top_{login} {count}")
    print(f"top3 {top_sum}")
    print(f"top3_percent {one_decimal(top_sum, merged)}")
    print(f"outside_named_ten {remainder}")


if __name__ == "__main__":
    main()
