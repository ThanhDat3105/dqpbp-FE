import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

// Key cố định thay vì index — danh sách placeholder không bao giờ sắp xếp lại
const ROW_KEYS = ["r1", "r2", "r3", "r4", "r5", "r6"];
const CELL_KEYS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"];

interface TableSkeletonRowsProps {
  rows?: number;
  columns: number;
}

export function TableSkeletonRows({
  rows = 5,
  columns,
}: TableSkeletonRowsProps) {
  return (
    <>
      {ROW_KEYS.slice(0, rows).map((rowKey) => (
        <TableRow key={rowKey} className="hover:bg-transparent">
          {CELL_KEYS.slice(0, columns).map((cellKey) => (
            <TableCell key={`${rowKey}-${cellKey}`}>
              <Skeleton className="h-5 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
