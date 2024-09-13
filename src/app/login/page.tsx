"use client"

import { useRouter } from 'next/navigation'
import logoImg from '../../assets/LogoBuilderWhite.webp'
import { Container } from '../components/container' 
import { Input } from '../components/input'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthContext } from '../../contexts/AuthContext'
import { useContext } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const schema = z.object({
    email: z.string().email("Insira um email válido").nonempty("O campo email é obrigatório"),
    password: z.string().nonempty("O campo senha é obrigatório")
})

type FormData = z.infer<typeof schema>

export default function Login() {

    const router = useRouter()
    const { signIn } = useContext(AuthContext);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange"
    });

    async function onSubmit(data: FormData) {
        const email = data?.email;
        const password = data?.password;
        try {
            let dataUser = {
                email,
                password
            };

            const success = await signIn(dataUser);
            
            if (success) {
                router.push('/');
            }

        } catch (error) {
            console.error(error);
        }
    }

    return (
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
                        <Input
                            type="password"
                            placeholder="Digite sua senha..."
                            name="password"
                            error={errors.password?.message}
                            register={register}
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

            </div>
        </Container>
    )
}