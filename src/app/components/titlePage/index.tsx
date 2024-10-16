interface TitleProps {
    title: string;
}

export function TitlePage({ title }: TitleProps) {
    return (
        <h1 className="font-bold text-2xl md:text-4xl mb-8 md:mb-16 text-left">
            {title}
        </h1>
    )
}