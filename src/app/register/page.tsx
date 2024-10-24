"use client"

import { useRouter } from 'next/navigation'
import logoImg from '../../assets/LogoBuilderWhite.webp'
import { Container } from '../components/container'
import { Input } from '../components/input'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { setupAPIClient } from '../../services/api'
import { toast } from 'react-toastify'
import Link from 'next/link'
import Image from 'next/image'
import ReCAPTCHA from "react-google-recaptcha";
import { useEffect, useRef, useState } from 'react'
import { LoadingRequest } from '../components/loadingRequest'
import Login from '../login/page'

const schema = z.object({
    name: z.string().nonempty("O campo nome é obrigatório"),
    email: z.string().email("Insira um email válido").nonempty("O campo email é obrigatório"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").nonempty("O campo senha é obrigatório")
});

type FormData = z.infer<typeof schema>

export default function Register() {

    const router = useRouter();

    const [superAdmin, setSuperAdmin] = useState([]);
    const [loading, setLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const captchaRef = useRef<ReCAPTCHA | null>(null);

    useEffect(() => {
        const apiClient = setupAPIClient();

        async function fetch_super_user() {
            try {
                setLoading(true);

                const response = await apiClient.get(`/user/all_users`);

                setSuperAdmin(response.data.super);

            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
        fetch_super_user();
    }, []);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange"
    });

    const onChangeCaptcha = (token: string | null) => {
        setCaptchaToken(token);
    };

    async function onSubmit(data: FormData) {

        setLoading(true);

        if (!captchaToken) {
            toast.error("Por favor, verifique o reCAPTCHA.");
            return;
        }

        try {
            const apiClient = setupAPIClient();
            await apiClient.post('/user/create', { name: data?.name, email: data?.email, password: data?.password });

            toast.success('Cadastro feito com sucesso!');

            setLoading(false);

            router.push('/login');

        } catch (error) {
            if (error instanceof Error && 'response' in error && error.response) {
                console.log((error as any).response.data);
                toast.error('Ops erro ao deletar o usuario.');
            } else {
                console.error(error);
                toast.error('Erro desconhecido.');
            }
        }
    }

    return (
        <>
            {loading ?
                <LoadingRequest />
                :
                <>
                    {superAdmin.length >= 1 ?
                        <Login />
                        :
                        <Container>
                            <div className='w-full min-h-screen flex justify-center items-center flex-col gap-4'>
                                <div className='mb-6 max-w-sm w-full'>
                                    <Image
                                        src={logoImg}
                                        alt='logo-do-site'
                                        width={500}
                                        height={500}
                                    />
                                </div>

                                <form
                                    className='bg-white max-w-xl w-full rounded-lg p-4'
                                    onSubmit={handleSubmit(onSubmit)}
                                >
                                    <div className='mb-3'>
                                        <Input
                                            styles='w-full border-2 rounded-md h-11 px-2'
                                            type="text"
                                            placeholder="Digite seu nome completo..."
                                            name="name"
                                            error={errors.name?.message}
                                            register={register}
                                        />
                                    </div>

                                    <div className='mb-3'>
                                        <Input
                                            styles='w-full border-2 rounded-md h-11 px-2'
                                            type="email"
                                            placeholder="Digite seu email..."
                                            name="email"
                                            error={errors.email?.message}
                                            register={register}
                                        />
                                    </div>

                                    <div className='mb-3'>
                                        <Input
                                            styles='w-full border-2 rounded-md h-11 px-2'
                                            type="password"
                                            placeholder="Digite sua senha..."
                                            name="password"
                                            error={errors.password?.message}
                                            register={register}
                                        />
                                    </div>

                                    <div className='mb-3'>
                                        <ReCAPTCHA
                                            ref={captchaRef}
                                            sitekey="6LfEo7wiAAAAALlmW4jdxPw4HQ-UH5NNCDatw8ug"
                                            onChange={onChangeCaptcha}
                                        />
                                    </div>

                                    <button
                                        type='submit'
                                        className='bg-red-600 w-full rounded-md text-white h-10 font-medium'
                                    >
                                        Cadastrar
                                    </button>
                                </form>

                                <Link href="/login">
                                    Já possui uma conta? Faça o login!
                                </Link>

                            </div>
                        </Container>
                    }
                </>
            }
        </>
    )
}