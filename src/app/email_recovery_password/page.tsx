"use client"

import { useRouter } from 'next/navigation'
import logoImg from '../../assets/LogoBuilderWhite.webp'
import { Container } from '../components/container'
import { Input } from '../components/input'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthContext } from '../../contexts/AuthContext'
import { useContext, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LoadingRequest } from '../components/loadingRequest'
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from 'react-toastify'
import { setupAPIClient } from '@/services/api'

const schema = z.object({
    email: z.string().email("Insira um email válido").nonempty("O campo email é obrigatório"),
})

type FormData = z.infer<typeof schema>

export default function EmailRecoveryPassword() {

    const router = useRouter()

    const [loading, setLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const captchaRef = useRef<ReCAPTCHA | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange"
    });

    const onChangeCaptcha = (token: string | null) => {
        setCaptchaToken(token);
    };

    async function onSubmit(data: FormData) {

        if (!captchaToken) {
            toast.error("Por favor, verifique o reCAPTCHA.");
            return;
        }

        setLoading(true);

        const email = data?.email;

        try {
            const apiClient = setupAPIClient();
            await apiClient.post(`/user/email_recovery_password`, { email: email });

            toast.success(`Email enviado para o endereço "${email}`);

            setLoading(false);

            router.push('/login');

        } catch (error) {
            if (error instanceof Error && 'response' in error && error.response) {
                console.log((error as any).response.data);
                toast.error('Ops erro ao enviar email ao usuario.');
            } else {
                console.error(error);
                toast.error('Erro desconhecido.');
            }
        } finally {
            setLoading(false);
        }
    }


    return (
        <>
            {loading ?
                <LoadingRequest />
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
                                    type="email"
                                    placeholder="Digite seu email..."
                                    name="email"
                                    error={errors.email?.message}
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
                                Acessar
                            </button>
                        </form>

                        <Link href="/register">
                            Ainda não possui uma conta? Cadastre-se
                        </Link>

                        <Link href="/login">
                            Já possui uma conta? Faça o login!
                        </Link>

                    </div>
                </Container>
            }
        </>
    )
}