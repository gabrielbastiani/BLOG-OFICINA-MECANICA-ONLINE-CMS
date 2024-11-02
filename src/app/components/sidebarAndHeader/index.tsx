import * as Collapsible from "@radix-ui/react-collapsible";
import { ReactNode, useContext, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ArrowBendDoubleUpLeft, CaretRight } from "phosphor-react";
import Image from "next/image";
import logo from '../../../assets/LogoBuilderWhite.webp';
import { AuthContext } from "@/contexts/AuthContext";
import Link from "next/link";
import { FiLogIn, FiUser, FiBell } from "react-icons/fi";
import { setupAPIClient } from "@/services/api";
import { MdCategory, MdConnectWithoutContact, MdNotifications, MdPostAdd } from "react-icons/md";
import { FaFileExport, FaRegCommentDots, FaRegNewspaper, FaUser } from "react-icons/fa";
import moment from 'moment';

interface Content {
    children: ReactNode;
}

interface Notification {
    id: string;
    message: string;
    created_at: string;
    href?: string;
    read: boolean;
    type: string;
}

export function SidebarAndHeader({ children }: Content) {

    const { isAuthenticated, loadingAuth, user } = useContext(AuthContext);

    const [isSideBarOpen, setIsSideBarOpen] = useState(true);
    const [currentRoute, setCurrentRoute] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);

    const notificationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            // Verifique se o clique foi fora do popup e feche-o se necessário
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        }

        // Adicione o evento de clique ao documento
        document.addEventListener("mousedown", handleClickOutside);

        // Limpe o evento quando o componente for desmontado
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const apiClient = setupAPIClient();
    const idUser = user?.id;

    useEffect(() => {
        fetchNotifications(setNotifications);
    }, [idUser]);

    const fetchNotifications = async (setNotifications: (arg0: any) => void) => {
        try {
            const response = await apiClient.get(`/user/notifications?user_id=${idUser}`);
            setNotifications(response.data.slice(0, 20));
        } catch (error) {
            console.error("Erro ao buscar notificações:", error);
        }
    };

    const NotificationIcon = ({ type }: any) => {
        switch (type) {
            case "contact_form":
                return <MdConnectWithoutContact size={30} color="white" />;
            case "user":
                return <FaUser size={30} color="white" />;
            case "post":
                return <MdPostAdd size={30} color="white" />;
            case "newsletter":
                return <FaRegNewspaper size={30} color="white" />;
            case "export_data":
                return <FaFileExport size={30} color="white" />;
            case "comment":
                return <FaRegCommentDots size={30} color="white" />;
            case "category":
                return <MdCategory size={30} color="white" />;
            default:
                return <MdNotifications size={30} color="white" />;
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await apiClient.put(`/notifications/mark-read?notificationUser_id=${id}`);
            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === id ? { ...notification, read: true } : notification
                )
            );
        } catch (error) {
            console.error("Erro ao marcar notificação como lida:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await apiClient.put(`/notifications/mark-all-read?user_id=${idUser}`);
            setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
        } catch (error) {
            console.error("Erro ao marcar todas as notificações como lidas:", error);
        }
    };

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
                    id="header"
                    className="flex items-center gap-4 leading-tight relative border-b border-slate-600 transition-all duration-200 py-[1.125rem] px-6 justify-between"
                >
                    <Collapsible.Trigger
                        className={clsx('h-7 w-7 text-gray-800 bg-gray-100 p-1 rounded-full relative z-[99] top-9 left-0', {
                            hidden: isSideBarOpen,
                            block: !isSideBarOpen
                        })}
                    >
                        <CaretRight className="w-5 h-5" />
                    </Collapsible.Trigger>

                    <h1 className="text-white font-bold">CMS Blog - Builder Seu Negócio Online</h1>

                    {/* Novo container para o sino e o avatar */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <FiBell
                                size={24}
                                className="text-white cursor-pointer"
                                onClick={() => setShowNotifications(!showNotifications)}
                            />
                            {notifications.some((n) => !n.read) && (
                                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
                            )}
                        </div>
                        {showNotifications && (
                            <div
                                ref={notificationRef}
                                className="absolute top-14 right-6 bg-gray-800 text-white rounded-md w-80 shadow-lg p-4 z-10"
                            >
                                <div className="flex justify-between mb-2">
                                    <h2 className="font-semibold">Notificações</h2>
                                    <button
                                        className="text-sm text-red-600 hover:underline"
                                        onClick={markAllAsRead}
                                    >
                                        Marcar todas como lidas
                                    </button>
                                </div>
                                <ul className="max-h-64 overflow-y-auto">
                                    {notifications.map((notification, index) => (
                                        <li
                                            key={notification.id}
                                            className={`p-3 flex items-center justify-between rounded ${notification.read ? "text-gray-500" : "text-white"}
                            ${index !== notifications.length - 1 ? "border-b border-gray-700" : ""} 
                            hover:bg-gray-700`}
                                        >
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                className="w-full flex justify-between items-center"
                                            >
                                                <span className="flex items-center space-x-2">
                                                    <NotificationIcon type={notification.type} />
                                                    <span>{notification.message}</span>
                                                </span>
                                                <span className="text-xs text-gray-400">{moment(notification.created_at).format('DD/MM/YYYY HH:mm')}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-4 text-center">
                                    <Link href="/central_notifications" passHref>
                                        <button className="bg-backgroundButton text-white hover:underline text-sm p-3 rounded">
                                            Ver todas as notificações
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        )}
                        {/* Avatar do usuário */}
                        {!loadingAuth && isAuthenticated ? (
                            <Link href="/user/profile">
                                <div className="border-2 rounded-full p-1 border-var(--foreground) overflow-hidden w-[50px] h-[50px] flex items-center justify-center">
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
                </div>
                <div className="flex-1 overflow-y-auto scrollbar">
                    {children}
                </div>
            </div>
        </Collapsible.Root>
    );
}