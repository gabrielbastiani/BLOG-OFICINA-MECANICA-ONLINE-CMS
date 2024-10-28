import * as Collapsible from "@radix-ui/react-collapsible";
import { ReactNode, useContext, useEffect, useState } from "react";
import clsx from "clsx";
import { ArrowBendDoubleUpLeft, CaretRight } from "phosphor-react";
import Image from "next/image";
import logo from '../../../assets/LogoBuilderWhite.webp';
import { AuthContext } from "@/contexts/AuthContext";
import Link from "next/link";
import { FiLogIn, FiUser } from "react-icons/fi";

interface Content {
    children: ReactNode;
}

export function SidebarAndHeader({ children }: Content) {
    const { isAuthenticated, loadingAuth, user } = useContext(AuthContext);
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
            className="h-screen w-screen bg-gray-950 text-slate-100 flex overflow-hidden"
            onOpenChange={setIsSideBarOpen}
        >
            <Collapsible.Content className="bg-gray-950 flex-shrink-0 border-r border-slate-600 h-full relative group overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-200">
                <Collapsible.Trigger className='absolute h-7 right-4 z-[99] text-white hover:scale-105 duration-200 inline-flex items-center justify-center'>
                    <ArrowBendDoubleUpLeft className="h-7 w-7 mt-8" />
                </Collapsible.Trigger>

                <div className='flex-1 flex flex-col h-full gap-8 w-[220px]'>
                    <nav className="flex mx-2 flex-col gap-8 text-slate-100">
                        <div className="flex flex-col gap-2 ml-2">
                            <div className="text-white font-semibold uppercase mb-2 ml-2 mt-3">
                                <Link href="/">
                                    <Image src={logo} width={120} alt="logo" />
                                </Link>
                            </div>
                        </div>
                        <section className="flex flex-col gap-px">
                            <Link href="/" className={clsx({
                                'bg-activeLink rounded p-2 mb-2': currentRoute === "/",
                                'text-white p-2 mb-2': currentRoute !== "/"
                            })}>
                                Dashboard
                            </Link>

                            {user?.role === 'SUPER_ADMIN' ? (
                                <>
                                    <Collapsible.Root className="flex flex-col" defaultOpen>
                                        <Collapsible.Trigger asChild>
                                            <button
                                                className={clsx('p-2 text-left mb-2 flex justify-between items-center', {
                                                    'bg-activeLink rounded': currentRoute?.includes("/user"),
                                                    'text-white': !currentRoute?.includes("/user")
                                                })}
                                            >
                                                Usuários
                                                <CaretRight className={clsx('transition-transform duration-200', {
                                                    'rotate-90': currentRoute?.includes("/user"),
                                                    'rotate-0': !currentRoute?.includes("/user")
                                                })} />
                                            </button>
                                        </Collapsible.Trigger>

                                        <Collapsible.Content
                                            className="ml-4 overflow-hidden transition-all duration-300 ease-in-out flex flex-col"
                                        >
                                            <Link href="/user/all_users" className={clsx({
                                                'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/user/all_users",
                                                'text-white p-2 mb-2 text-sm': currentRoute !== "/user/all_users"
                                            })}>
                                                Todos os Usuários
                                            </Link>

                                            <Link href="/user/add_user" className={clsx({
                                                'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/user/add_user",
                                                'text-white p-2 mb-2 text-sm': currentRoute !== "/user/add_user"
                                            })}>
                                                Adicionar Novo Usuário
                                            </Link>

                                            <Link href="/user/profile" className={clsx({
                                                'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/user/profile",
                                                'text-white p-2 mb-2 text-sm': currentRoute !== "/user/profile"
                                            })}>
                                                Editar perfil
                                            </Link>
                                        </Collapsible.Content>
                                    </Collapsible.Root>

                                    <Collapsible.Root className="flex flex-col" defaultOpen>
                                        <Collapsible.Trigger asChild>
                                            <button
                                                className={clsx('p-2 text-left mb-2 flex justify-between items-center', {
                                                    'bg-activeLink rounded': currentRoute?.includes("/contacts_form"),
                                                    'text-white': !currentRoute?.includes("/contacts_form")
                                                })}
                                            >
                                                Contatos
                                                <CaretRight className={clsx('transition-transform duration-200', {
                                                    'rotate-90': currentRoute?.includes("/contacts_form"),
                                                    'rotate-0': !currentRoute?.includes("/contacts_form")
                                                })} />
                                            </button>
                                        </Collapsible.Trigger>

                                        <Collapsible.Content
                                            className="ml-4 overflow-hidden transition-all duration-300 ease-in-out flex flex-col"
                                        >
                                            <Link href="/contacts_form/all_contacts" className={clsx({
                                                'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/contacts_form/all_contacts",
                                                'text-white p-2 mb-2 text-sm': currentRoute !== "/contacts_form/all_contacts"
                                            })}>
                                                Todos os Contatos
                                            </Link>

                                        </Collapsible.Content>
                                    </Collapsible.Root>
                                </>
                            ) :
                                <Collapsible.Root className="flex flex-col" defaultOpen>
                                    <Collapsible.Trigger asChild>
                                        <button
                                            className={clsx('p-2 text-left mb-2 flex justify-between items-center', {
                                                'bg-activeLink rounded': currentRoute?.includes("/user"),
                                                'text-white': !currentRoute?.includes("/user")
                                            })}
                                        >
                                            Usuários
                                            <CaretRight className={clsx('transition-transform duration-200', {
                                                'rotate-90': currentRoute?.includes("/user"),
                                                'rotate-0': !currentRoute?.includes("/user")
                                            })} />
                                        </button>
                                    </Collapsible.Trigger>

                                    <Collapsible.Content
                                        className="ml-4 overflow-hidden transition-all duration-300 ease-in-out flex flex-col"
                                    >
                                        <Link href="/user/profile" className={clsx({
                                            'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/user/profile",
                                            'text-white p-2 mb-2 text-sm': currentRoute !== "/user/profile"
                                        })}>
                                            Editar perfil
                                        </Link>
                                    </Collapsible.Content>

                                </Collapsible.Root>
                            }
                        </section>
                    </nav>
                </div>
            </Collapsible.Content>

            <div className="flex-1 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-200">
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

                    <h1 className='text-white font-bold'>CMS Blog - Builder Seu Negócio Online</h1>

                    {!loadingAuth && isAuthenticated ? (
                        <Link href="/user/profile">
                            <div className='border-2 rounded-full p-1 border-var(--foreground) overflow-hidden w-[50px] h-[50px] flex items-center justify-center'>
                                {user?.image_user ? (
                                    <Image
                                        src={`http://localhost:3333/files/${user.image_user}`}
                                        alt="user"
                                        width={50}
                                        height={50}
                                        className="object-cover w-full h-full rounded-full"
                                    />
                                ) : (
                                    <FiUser cursor="pointer" size={24} color="var(--foreground)" />
                                )}
                            </div>
                        </Link>
                    ) : (
                        <Link href="/login">
                            <div className="border-2 rounded-full p-1 border-var(--foreground)">
                                <FiLogIn size={22} color="var(--foreground)" />
                            </div>
                        </Link>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto scrollbar">
                    {children}
                </div>
            </div>
        </Collapsible.Root>
    );
}