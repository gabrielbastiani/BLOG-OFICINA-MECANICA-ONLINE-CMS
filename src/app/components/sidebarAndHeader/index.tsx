import * as Collapsible from "@radix-ui/react-collapsible";
import { ReactNode, useContext, useEffect, useState } from "react";
import clsx from "clsx";
import { ArrowBendDoubleUpLeft, CaretRight } from "phosphor-react";
import Image from "next/image";
import logo from '../../../assets/LogoBuilderWhite.webp';
import { AuthContext } from "@/contexts/AuthContext";
import Link from "next/link";
import { FiLogIn, FiUser } from "react-icons/fi";
import { useRouter } from "next/router";


interface Content {
    children: ReactNode;
}

export function SidebarAndHeader({ children }: Content) {
    const { isAuthenticated, loadingAuth } = useContext(AuthContext);
    const [isSideBarOpen, setIsSideBarOpen] = useState(true);

    const [currentRoute, setCurrentRoute] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const { pathname } = window.location;
            setCurrentRoute(pathname);
        }
    }, []);

    return (
        <Collapsible.Root
            defaultOpen
            className="h-screen w-screen bg-gray-950 text-slate-100 flex"
            onOpenChange={setIsSideBarOpen}
        >
            <Collapsible.Content
                className="bg-gray-950 flex-shrink-0 border-r border-slate-600 h-screen relative group overflow-hidden data-[state=open]:animate-slideIn data-[state=closed]:animate-slideOut"
            >
                <Collapsible.Trigger className='absolute h-7 right-4 z-[99] text-white hover:scale-105 duration-200 inline-flex items-center justify-center'>
                    <ArrowBendDoubleUpLeft className="h-7 w-7 mt-8" />
                </Collapsible.Trigger>

                <div className='flex-1 flex flex-col h-full gap-8 w-[220px] transition-opacity group-data-[state=open]:opacity-100 group-data-[state=closed]:opacity-0 duration-200'>
                    <nav className="flex mx-2 flex-col gap-8 text-slate-100">
                        <div className="flex flex-col gap-2 ml-2">
                            <div className="text-white font-semibold uppercase mb-2 ml-2 mt-3">
                                <Link href="/">
                                    <Image src={logo} width={120} alt="logo" />
                                </Link>
                            </div>
                        </div>
                        <section className="flex flex-col gap-px">
                            <Link href="/perfil" className={clsx({
                                'bg-activeLink': currentRoute === "/perfil", // Verifica se a rota atual é "/"
                                'text-white': currentRoute !== "/perfil"
                            })}>
                                Perfil
                            </Link>
                            <Link href="/" className={clsx({
                                'bg-activeLink': currentRoute === "/", // Verifica se a rota atual é "/"
                                'text-white': currentRoute !== "/"
                            })}>
                                Dashboard
                            </Link>
                        </section>
                    </nav>
                </div>
            </Collapsible.Content>
            <div className="flex-1 flex flex-col max-h-screen">
                <div
                    id='header'
                    className='flex items-center gap-4 leading-tight relative border-b border-slate-600 transition-all duration-200 py-[1.125rem] px-6 justify-between'
                >
                    <Collapsible.Trigger
                        className={clsx('h-7 w-7 text-gray-800 bg-gray-100 p-1 rounded-full relative z-[99] top-9 left-0', {
                            hidden: isSideBarOpen,
                            block: !isSideBarOpen
                        })}
                    >
                        <CaretRight className='w-5 h-5' />
                    </Collapsible.Trigger>

                    <h1 className='text-white font-bold'>CMS Blog Builder seu negócio online</h1>

                    {!loadingAuth && isAuthenticated && (
                        <Link href="/perfil">
                            <div className='border-2 rounded-full p-1 border-var(--foreground)'>
                                <FiUser cursor="pointer" size={24} color="var(--foreground)" />
                            </div>
                        </Link>
                    )}

                    {!loadingAuth && !isAuthenticated && (
                        <Link href="/login">
                            <div className="border-2 rounded-full p-1 border-var(--foreground)">
                                <FiLogIn size={22} color="var(--foreground)" />
                            </div>
                        </Link>
                    )}

                </div>

                {children}

            </div>
        </Collapsible.Root>
    )
}