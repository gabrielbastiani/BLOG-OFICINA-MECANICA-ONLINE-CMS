import React from 'react';

interface OrderSelectProps {
    orderBy: string;
    orderDirection: string;
    columns: { key: any; label: string; }[];
    onOrderByChange: (value: string) => void;
    onOrderDirectionChange: (value: string) => void;
    availableColumns?: string[];
    customNames?: { [key: string]: string };
}

const OrderSelect: React.FC<OrderSelectProps> = ({
    orderBy,
    orderDirection,
    columns,
    onOrderByChange,
    onOrderDirectionChange,
    availableColumns,
    customNames
}) => {
    const filteredColumns = columns.filter((column) =>
        availableColumns ? availableColumns.includes(column.key) : true
    );

    return (
        <div className="flex items-center">
            <select
                value={orderBy}
                onChange={(e) => onOrderByChange(e.target.value)}
                className="border p-2 rounded mr-2 text-black"
            >
                {filteredColumns.map((column) => (
                    <option className='text-black' key={column.key} value={column.key}>
                        Ordenar por {customNames?.[column.key] || column.label}
                    </option>
                ))}
            </select>
            <select
                value={orderDirection}
                onChange={(e) => onOrderDirectionChange(e.target.value)}
                className="border p-2 rounded text-black"
            >
                <option className='text-black' value="asc">Ascendente</option>
                <option className='text-black' value="desc">Descendente</option>
            </select>
        </div>
    );
};

export default OrderSelect;