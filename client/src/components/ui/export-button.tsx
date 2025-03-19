
import React from "react";
import { Button } from "@/components/ui/button";
import { exportToExcel, exportToPDF } from "@/lib/export";
import { Download } from "lucide-react";

interface ExportButtonProps {
  data: any[];
  columns: string[];
  filename: string;
}

export function ExportButton({ data, columns, filename }: ExportButtonProps) {
  return (
    <div className="flex gap-2">
      <Button onClick={() => exportToExcel(data, filename)}>
        <Download className="mr-2 h-4 w-4" />
        Export Excel
      </Button>
      <Button onClick={() => exportToPDF(data, columns, filename)}>
        <Download className="mr-2 h-4 w-4" />
        Export PDF
      </Button>
    </div>
  );
}
