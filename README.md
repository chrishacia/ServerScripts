
# Server Metrics CLI Tools

This repository contains a collection of useful CLI-based scripts for monitoring live metrics and data on a server. These scripts provide real-time information on disk usage, memory usage, active Node.js processes, and network traffic. Each script is designed to be run either once or in a live mode for continuous monitoring.

## Table of Contents
1. [disk_usage.js](#disk_usagejs)
2. [memory_usage.js](#memory_usagejs)
3. [node_port_check.js](#node_port_checkjs)
4. [traffic_monitor.js](#traffic_monitorjs)

---

## 1. disk_usage.js

### Description:
This script fetches and displays disk usage statistics, showing details such as size, used space, and available space for mounted file systems. It supports a `--live` option for continuous monitoring.

### Dependencies:
- `child_process` (Node.js built-in)
- `cli-table` (`npm install cli-table`)

### Example usage:
- To run the script once:
  ```bash
  node disk_usage.js
  ```
- To run the script in live mode:
  ```bash
  node disk_usage.js --live
  ```

### Ubuntu Dependencies:
- None (Uses `df` command available by default)

---

## 2. memory_usage.js

### Description:
This script displays the system's memory usage, including total memory, used memory, free memory, and more. The output is presented in a table format for better readability. Like `disk_usage.js`, it supports a `--live` option.

### Dependencies:
- `child_process` (Node.js built-in)
- `cli-table` (`npm install cli-table`)

### Example usage:
- To run the script once:
  ```bash
  node memory_usage.js
  ```
- To run the script in live mode:
  ```bash
  node memory_usage.js --live
  ```

### Ubuntu Dependencies:
- None (Uses `free` command available by default)

---

## 3. node_port_check.js

### Description:
This script checks for active Node.js processes and lists their PID, user, port, command, directory, and memory usage. It is useful for monitoring which Node.js applications are running and the resources they consume.

### Dependencies:
- `child_process` (Node.js built-in)
- `cli-table` (`npm install cli-table`)
- `clear` (`npm install clear`)

### Example usage:
- To run the script once:
  ```bash
  node node_port_check.js
  ```
- To run the script in live mode:
  ```bash
  node node_port_check.js --live
  ```

### Ubuntu Dependencies:
- Install `lsof` and `pwdx` if not available:
  ```bash
  sudo apt install lsof procps
  ```

---

## 4. traffic_monitor.js

### Description:
This script provides real-time monitoring of network traffic for various services (HTTP, HTTPS, MySQL, FTP) and displays a visual chart using the `blessed` and `blessed-contrib` libraries. It also tracks total active connections and presents the data in a terminal-based UI.

### Dependencies:
- `child_process` (Node.js built-in)
- `blessed` (`npm install blessed`)
- `blessed-contrib` (`npm install blessed-contrib`)

### Example usage:
- To run the script:
  ```bash
  node traffic_monitor.js
  ```

### Ubuntu Dependencies:
- Install `ss` (netstat replacement) and `nload` for bandwidth monitoring:
  ```bash
  sudo apt install iproute2 nload
  ```

---

## License
MIT License
