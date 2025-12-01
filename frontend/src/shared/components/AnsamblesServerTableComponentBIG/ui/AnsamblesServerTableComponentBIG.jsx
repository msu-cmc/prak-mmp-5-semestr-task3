import "./AnsamblesServerTableComponentBIG.css";

function getMaxDepth(columns) {
    return Math.max(...columns.map(col => (col.columns ? 1 + getMaxDepth(col.columns) : 1)));
}

// Построение строк заголовков таблицы (support multi-row header)
function buildHeaderRows(columns, depth = 0, rows = [], totalDepth = getMaxDepth(columns)) {
    rows[depth] = rows[depth] || [];
    for (const col of columns) {
        const hasChildren = Array.isArray(col.columns) && col.columns.length > 0;
        rows[depth].push({
            label: col.header,
            colSpan: hasChildren ? col.columns.length : 1,
            rowSpan: hasChildren ? 1 : totalDepth - depth,
            width: col.width,
        });
        if (hasChildren) {
            buildHeaderRows(col.columns, depth + 1, rows, totalDepth);
        }
    }
    return rows;
}

// Получение всех листовых (фактических) колонок для данных
function getLeafColumns(columns, leaves = []) {
    for (const col of columns) {
        if (col.columns) getLeafColumns(col.columns, leaves);
        else leaves.push(col);
    }
    return leaves;
}

// Получение значения ячейки
function getCellValue(row, col, idx) {
    if (col.render) return col.render(row, idx);
    if (col.accessor)
        return col.accessor.split(".").reduce((o, k) => (o ? o[k] : undefined), row);
    return null;
}

const AnsamblesServerTableComponentBIG = ({ columns = [], data = [] }) => {
    const headerRows = buildHeaderRows(columns);
    const leafColumns = getLeafColumns(columns);

    return (
        <table className="akramfit-table-big">
            <thead className="akramfit-table-big__head">
                {headerRows.map((rowCells, rowIdx) => (
                    <tr key={rowIdx} className="akramfit-table-big__row akramfit-table-big__row--head">
                        {rowCells.map((cell, cellIdx) => (
                            <th
                                key={cellIdx}
                                className="akramfit-table-big__cell akramfit-table-big__cell--head"
                                colSpan={cell.colSpan}
                                rowSpan={cell.rowSpan}
                                style={cell.width ? { width: cell.width } : undefined}
                            >
                                {cell.label}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody className="akramfit-table-big__body">
                {data.map((row, rowIdx) => (
                    <tr key={rowIdx} className="akramfit-table-big__row">
                        {leafColumns.map((col, colIdx) => (
                            <td key={colIdx} className="akramfit-table-big__cell">
                                {getCellValue(row, col, rowIdx)}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export { AnsamblesServerTableComponentBIG };
export default AnsamblesServerTableComponentBIG;
