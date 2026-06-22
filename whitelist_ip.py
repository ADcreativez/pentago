#!/usr/bin/env python3
"""
Pentago IP Whitelist/Unblock Utility
Usage:
    python3 whitelist_ip.py <IP_ADDRESS>
    python3 whitelist_ip.py 192.168.1.1
"""

import sys
import os
import sqlite3

# Resolve database path relative to this script
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pentago.db')

def unblock_ip(ip_address):
    if not os.path.exists(DB_PATH):
        print(f"[!] Database not found: {DB_PATH}")
        sys.exit(1)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Check if IP exists in BlockedIP table
    cursor.execute("SELECT id, ip_address, reason, blocked_at FROM blocked_ip WHERE ip_address = ?", (ip_address,))
    row = cursor.fetchone()

    if row:
        print(f"[*] Found blocked entry:")
        print(f"    ID: {row[0]}")
        print(f"    IP: {row[1]}")
        print(f"    Reason: {row[2]}")
        print(f"    Blocked At: {row[3]}")
        cursor.execute("DELETE FROM blocked_ip WHERE ip_address = ?", (ip_address,))
        conn.commit()
        print(f"[+] Successfully removed {ip_address} from BlockedIP table.")
    else:
        print(f"[*] IP {ip_address} is not in the BlockedIP table.")

    # 2. Show all remaining blocked IPs
    cursor.execute("SELECT ip_address, reason FROM blocked_ip")
    remaining = cursor.fetchall()
    if remaining:
        print(f"\n[*] Remaining blocked IPs ({len(remaining)}):")
        for r in remaining:
            print(f"    - {r[0]} ({r[1]})")
    else:
        print("\n[*] No blocked IPs remaining.")

    conn.close()

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 whitelist_ip.py <IP_ADDRESS>")
        print("Example: python3 whitelist_ip.py 192.168.1.1")
        sys.exit(1)

    target_ip = sys.argv[1]
    print(f"[*] Unblocking IP: {target_ip}")
    print(f"[*] Database: {DB_PATH}")
    unblock_ip(target_ip)
