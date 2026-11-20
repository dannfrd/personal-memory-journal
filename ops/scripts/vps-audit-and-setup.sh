#!/usr/bin/env bash
# ==============================================================================
# VPS Resource Audit, Swap Setup & Monitoring Script for lovelog.my.id
# Target VPS: 2 vCPU, 4 GB RAM, 33 GB Storage
# Specs Covered: VPS-01, VPS-02, VPS-06, VPS-07, VPS-08, TEST-05, IMG-05
# ==============================================================================
set -euo pipefail

ACTION="${1:-audit}"

print_header() {
  echo "=================================================================="
  echo "  $1"
  echo "=================================================================="
}

run_audit() {
  print_header "1. SYSTEM UPTIME & CPU LOAD (VPS-02)"
  uptime
  lscpu | grep -E "Model name|CPU\(s\):" || true

  print_header "2. RAM & SWAP USAGE (VPS-01, VPS-06)"
  free -h
  swapon --show || true
  echo "vm.swappiness = $(cat /proc/sys/vm/swappiness)"

  print_header "3. DISK & INODE USAGE (33 GB VPS BUDGET)"
  df -h /
  if [ -d "public/uploads" ]; then
    echo "Uploads folder size: $(du -sh public/uploads | cut -f1)"
  fi
  if [ -d "public/audio" ]; then
    echo "Audio folder size:   $(du -sh public/audio | cut -f1)"
  fi

  print_header "4. TOP 15 PROCESSES BY MEMORY (VPS-01, VPS-07)"
  ps aux --sort=-%mem | head -n 16

  print_header "5. TOP 10 PROCESSES BY CPU (VPS-02)"
  ps aux --sort=-%cpu | head -n 11

  print_header "6. ACTIVE SYSTEMD SERVICES (VPS-07)"
  systemctl list-units --type=service --state=running --no-pager || true

  print_header "7. LOCAL API HEALTH CHECK (TEST-03)"
  curl -s -w "\nHTTP Status: %{http_code} | Time Total: %{time_total}s\n" http://127.0.0.1:3001/health || echo "VPS API not reachable on 127.0.0.1:3001"
}

setup_swap() {
  print_header "CONFIGURING 2 GB SWAP FILE & SWAPPINESS=10 (VPS-06)"
  if swapon --show | grep -q '/swapfile'; then
    echo "Swapfile /swapfile is already active."
  else
    sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    if ! grep -q '/swapfile' /etc/fstab; then
      echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    fi
    echo "2 GB Swap created and enabled."
  fi

  sudo sysctl vm.swappiness=10
  sudo sysctl vm.vfs_cache_pressure=50
  if ! grep -q 'vm.swappiness' /etc/sysctl.conf; then
    echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
    echo 'vm.vfs_cache_pressure=50' | sudo tee -a /etc/sysctl.conf
  fi
  free -h
}

compress_audio() {
  print_header "COMPRESSING AUDIO FILES TO 128kbps AAC/MP3 (IMG-05)"
  if ! command -v ffmpeg >/dev/null 2>&1; then
    echo "ffmpeg is not installed. Install with: sudo apt-get install -y ffmpeg"
    exit 1
  fi
  for file in public/audio/*.mp3; do
    [ -e "$file" ] || continue
    tmp_file="${file%.mp3}_opt.mp3"
    echo "Optimizing: $file"
    ffmpeg -y -i "$file" -map 0:a:0 -b:a 128k -ac 2 -ar 44100 "$tmp_file"
    mv "$tmp_file" "$file"
  done
  ls -lh public/audio/
}

case "$ACTION" in
  audit)
    run_audit
    ;;
  swap)
    setup_swap
    ;;
  audio)
    compress_audio
    ;;
  *)
    echo "Usage: $0 {audit|swap|audio}"
    exit 1
    ;;
esac
