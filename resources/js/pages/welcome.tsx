import { Button } from '@/components/ui/button';
import { MainLayout } from '@/layout/MainLayout';
import { dashboard, login } from '@/routes';
import { Auth } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Eye } from 'lucide-react';

export default function Welcome() {
    const auth : Auth = usePage().props.auth ;
    return (
        <MainLayout showHeader={true} showFooter={true}>
            <Head title="Accueil">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex min-h-screen flex-col items-center  p-6  lg:justify-center lg:p-8 bg-background">
                <div className="flex w-full items-center justify-center  transition-opacity duration-750 lg:grow starting:opacity-0">

                    <div className="grid">
                        <p className='text-5xl font-bold  '>Gestion des frais scolaires</p>
                        {auth.user ? (
                            <div className="mt-6 flex justify-center gap-4">
                            <Link href={dashboard().url}>
                            <Button><Eye />Tableau de Bord</Button>
                        </Link>
                        </div>
                        ):(
                            <div className="mt-6 flex justify-center gap-4">
                            <Link href={login().url}>
                            <Button><Eye />Se connecter</Button>
                        </Link>
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
