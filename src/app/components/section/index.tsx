import { ReactNode } from "react"

export function Section({children}: { children: ReactNode }) {
    return (
        <section className="p-4 md:p-10 w-full max-w-full max-h-full">
            {children}
        </section>
    )
}