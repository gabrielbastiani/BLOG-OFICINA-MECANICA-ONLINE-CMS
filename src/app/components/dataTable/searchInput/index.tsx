import React from 'react';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    onReset: () => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, onReset }) => (
    <div className="flex items-center">
        <input
            type="text"
            placeholder="Buscar"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="border p-2 rounded w-96 text-black"
        />
        <button onClick={onReset} className="ml-2 p-2 bg-red-500 text-white rounded">
            Resetar
        </button>
    </div>
);

export default SearchInput;