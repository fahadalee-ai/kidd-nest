export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadText(filename: string, content: string, type = "text/plain") {
  downloadBlob(filename, new Blob([content], { type }));
}

export function downloadIcs(opts: {
  title: string;
  date: string;
  start: string;
  end: string;
  location: string;
}) {
  const day = opts.date.replace(/-/g, "");
  const start = opts.start.replace(":", "") + "00";
  const end = opts.end.replace(":", "") + "00";
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//KiddoNest//Parent//EN",
    "BEGIN:VEVENT",
    `DTSTART:${day}T${start}`,
    `DTEND:${day}T${end}`,
    `SUMMARY:${opts.title}`,
    `LOCATION:${opts.location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  downloadText("kiddonest-booking.ics", ics, "text/calendar");
}

export function downloadPdf(filename: string, lines: string[]) {
  const commands = lines
    .slice(0, 36)
    .map((line, index) => {
      const safe = line.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
      return `BT /F1 12 Tf 48 ${740 - index * 18} Td (${safe}) Tj ET`;
    })
    .join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Count 1 /Kids [3 0 R] >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${commands.length} >>\nstream\n${commands}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let body = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((obj, index) => {
    offsets.push(body.length);
    body += `${index + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n`;
  body += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    body += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  body += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  downloadBlob(filename, new Blob([body], { type: "application/pdf" }));
}

export async function shareText(title: string, text: string) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text });
      return;
    } catch {
      /* user cancelled or share failed */
    }
  }
  await navigator.clipboard.writeText(text);
}
