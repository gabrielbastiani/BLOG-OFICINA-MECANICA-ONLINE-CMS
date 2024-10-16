import { RegisterOptions, UseFormRegister } from 'react-hook-form'

interface InputProps {
    type: string;
    placeholder: string;
    name: string;
    register: UseFormRegister<any>;
    error?: string;
    rules?: RegisterOptions;
    styles?: string;
    value?: string;
}

export function Input({ name, placeholder, type, register, rules, error, styles, value }: InputProps) {
    return (
        <div>
            <input
                className={styles}
                defaultValue={value}
                placeholder={placeholder}
                type={type}
                {...register(name, rules)}
                id={name}
                style={{ color: 'black' }}
            />
            {error && <p className='my-1 text-red-500'>{error}</p>}
        </div>
    )
}