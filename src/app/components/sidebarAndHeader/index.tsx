import * as Collapsible from "@radix-ui/react-collapsible";
import { useState } from "react";
import clsx from "clsx";
import { ArrowBendDoubleUpLeft, CaretRight } from "phosphor-react";

export function SidebarAndHeader() {

    const [isSideBarOpen, setIsSideBarOpen] = useState(true);

    return (
        <Collapsible.Root
            defaultOpen
            className="h-screen w-screen bg-gray-950 text-slate-100 flex"
            onOpenChange={setIsSideBarOpen}
        >
            <Collapsible.Content
                className="bg-gray-950 flex-shrink-0 border-r border-slate-600 h-screen relative group overflow-hidden data-[state=open]:animate-slideIn data-[state=closed]:animate-slideOut"
            >
                <Collapsible.Trigger
                    className={
                        clsx(
                            'absolute h-7 right-4 z-[99] text-white hover:scale-105 duration-200 inline-flex items-center justify-center'
                        )
                    }
                >
                    <ArrowBendDoubleUpLeft className="h-7 w-7" />
                </Collapsible.Trigger>

                <div
                    className={clsx(
                        'flex-1 flex flex-col h-full gap-8 w-[220px] transition-opacity group-data-[state=open]:opacity-100 group-data-[state=closed]:opacity-0 duration-200'
                    )}
                >
                    <nav className="flex mx-2 flex-col gap-8 text-slate-100">
                        <div className="flex flex-col gap-2">
                            <div className="text-white font-semibold uppercase mb-2 ml-2">
                                MENU
                            </div>
                        </div>
                        <section className="flex flex-col gap-px">
                            {/* <LinkContent to="/">Clientes</LinkContent>
                        <LinkContent to="/create">Cadastrar clientes</LinkContent>
                        <LinkContent to="/about">Sobre</LinkContent> */}
                        </section>
                    </nav>
                </div>
            </Collapsible.Content>
            <div className="flex-1 flex flex-col max-h-screen">
                <div
                    id='header'
                    className={clsx(
                        'flex items-center gap-4 leading-tight relative border-b border-slate-600 transition-all duration-200 py-[1.125rem] px-6 region-drag'
                    )}
                >
                    <Collapsible.Trigger
                        className={clsx('h-7 w-7 text-gray-800 bg-gray-100 p-1 rounded-full relative z-[99] top-9 left-0', {
                            hidden: isSideBarOpen,
                            block: !isSideBarOpen
                        })}
                    >
                        <CaretRight className='w-5 h-5' />
                    </Collapsible.Trigger>

                    <>
                        <h1 className='text-white font-bold'>Dev Clientes</h1>
                    </>
                </div>
            </div>
        </Collapsible.Root>
    )
}