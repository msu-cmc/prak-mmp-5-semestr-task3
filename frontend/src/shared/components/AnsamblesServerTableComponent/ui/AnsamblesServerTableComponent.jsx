import "./AnsamblesServerTableComponent.css";

const AnsamblesServerTableComponent = ({ columns = [], data = [] }) => {
        return (
            <table className="akramfit-table">
                <thead className="akramfit-table__head">
                    <tr className="akramfit-table__row akramfit-table__row--head">
                        {columns.map((col, index) => (
                            <th key={index} className={`akramfit-table__cell akramfit-table__cell--head ${col?.className || ""}`}>{col.header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="akramfit-table__body">
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="akramfit-table__row">
                            {columns.map((col, colIndex) => (
                                <td key={colIndex} className="akramfit-table__cell">
                                    {col.render ? col.render(row) : row[col.accessor]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };
    

export default AnsamblesServerTableComponent;
