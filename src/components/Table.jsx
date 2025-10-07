import React from "react";
import { Button, Card, Badge } from "./ui.jsx";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";

export default function Table({ columns, data, page, pageSize, onPageChange}) {
  const startIndex = page * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = data.slice(startIndex, endIndex);
  const totalPages = Math.ceil(data.length / pageSize);

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-750">
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className="px-6 py-4 text-left text-sm font-semibold text-gray-300 border-b border-gray-700">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, i) => (
                <tr key={i} className="hover:bg-gray-750/50 transition-colors border-b border-gray-700/50 last:border-b-0">
                  {columns.map((col, j) => (
                    <td key={j} className="px-6 py-4 text-sm text-gray-200">
                      {col.cell ? col.cell(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            แสดง {startIndex + 1}-{Math.min(endIndex, data.length)} จาก {data.length} รายการ
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="text-sm text-gray-400">
              หน้า {page + 1} จาก {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages - 1}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
