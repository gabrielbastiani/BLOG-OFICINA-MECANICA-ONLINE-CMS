"use client"

import { createContext, ReactNode, useState, useEffect } from 'react';
import { api } from '../services/apiClient';
import { toast } from 'react-toastify';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/navigation';

type AuthContextData = {
    user?: UserProps;
    isAuthenticated: boolean;
    loadingAuth?: boolean;
    signIn: (credentials: SignInProps) => Promise<boolean>;
    signOut: () => void;
    updateUser: (newUserData: Partial<UserProps>) => void;
}

type UserProps = {
    id: string;
    name: string;
    email: string;
    image_user?: string;
    role?: string;
}

type SignInProps = {
    email: string;
    password: string;
}

type AuthProviderProps = {
    children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {

    const router = useRouter();

    const [cookies, setCookie, removeCookie] = useCookies(['@cmsblog.token']);
    const [cookiesId, setCookieId, removeCookieId] = useCookies(['@idUser']);
    const [user, setUser] = useState<UserProps>();
    const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
    const isAuthenticated = !!user;

    async function signIn({ email, password }: SignInProps): Promise<boolean> {
        setLoadingAuth(true);
        try {
            const response = await api.post('/user/session', {
                email,
                password
            });

            const { id, token } = response.data;

            setCookie('@cmsblog.token', token, {
                maxAge: 60 * 60 * 24 * 30,
                path: "/"
            });

            setCookieId('@idUser', id, {
                maxAge: 60 * 60 * 24 * 30,
                path: "/"
            });

            api.defaults.headers['Authorization'] = `Bearer ${token}`;

            toast.success('Logado com sucesso!');

            setUser({ id, name: response.data.name, email });

            return true;

        } catch (err) {
            toast.error("Erro ao acessar");
            /* @ts-ignore */
            toast.error(`${err.response.data.error}`);
            console.log("Erro ao acessar", err);
            return false;
        } finally {
            setLoadingAuth(false);
        }
    }

    const updateUser = (newUserData: Partial<UserProps>) => {
        if (user) {
            setUser({
                ...user,
                ...newUserData,
            });
        }
    };

    useEffect(() => {
        let token = cookies['@cmsblog.token'];
        let userid = cookiesId['@idUser'];

        async function loadUserData() {
            if (token) {
                try {
                    const response = await api.get(`/user/me?user_id=${userid}`);

                    const { id, name, email, image_user, role } = response.data;

                    setUser({
                        id,
                        name,
                        email,
                        image_user,
                        role
                    });

                } catch (error) {
                    console.error("Erro ao carregar dados do usuário: ", error);
                }
            }

            setLoadingAuth(false);
        }

        loadUserData();
    }, [cookies, cookiesId]);

    function signOut() {
        try {
            removeCookie('@cmsblog.token', { path: '/' });
            removeCookieId('@idUser', { path: '/' });
            setUser(undefined);
            toast.success('Usuário deslogado com sucesso!');
            router.push("/login");
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            toast.error("OPS... Erro ao deslogar");
        }
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loadingAuth, signIn, signOut, updateUser }}>
            {children}
        </AuthContext.Provider>
    )
}