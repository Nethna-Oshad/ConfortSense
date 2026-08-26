export function statusColor(status: "optimal" | "warning" | "critical") {
  switch (status) {
    case "optimal":
      return "text-[#3DDC84]";
    case "warning":
      return "text-[#F5A623]";
    case "critical":
      return "text-[#F2545B]";
  }
}

export function statusBg(status: "optimal" | "warning" | "critical") {
  switch (status) {
    case "optimal":
      return "bg-[#3DDC84]/10 border-[#3DDC84]/20";
    case "warning":
      return "bg-[#F5A623]/10 border-[#F5A623]/20";
    case "critical":
      return "bg-[#F2545B]/10 border-[#F2545B]/20";
  }
}

export function statusDot(status: "optimal" | "warning" | "critical") {
  switch (status) {
    case "optimal":
      return "bg-[#3DDC84]";
    case "warning":
      return "bg-[#F5A623]";
    case "critical":
      return "bg-[#F2545B]";
  }
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
