import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Edit,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';

interface UserShowProps {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
    updated_at: string;
    email_verified_at: string | null;
  };
}

export default function UserShow({ user }: UserShowProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      admin: 'Administrateur',
      moderator: 'Modérateur',
      user: 'Utilisateur',
    };
    return roles[role] || role;
  };

  return (
    <>
      <Head title={`${user.name} - Détails`} />
      
      <DashboardLayout activeRoute="/admin/users">
        <PageHeader
          title={user.name}
          description="Détails de l'utilisateur"
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Utilisateurs', href: '/admin/users' },
            { label: user.name, href: `/admin/users/${user.id}` },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Link href="/admin/users">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <Link href={`/admin/users/${user.id}/edit`}>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </Link>
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations principales */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{user.name}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {getRoleLabel(user.role)}
                      </Badge>
                      <Badge variant={
                        user.status === 'active' ? 'success' :
                        user.status === 'inactive' ? 'destructive' : 'secondary'
                      } className="gap-1">
                        {getStatusIcon(user.status)}
                        {user.status === 'active' ? 'Actif' : 
                         user.status === 'inactive' ? 'Inactif' : 'En attente'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                    <p className="font-medium">{user.email}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      Rôle
                    </div>
                    <p className="font-medium">{getRoleLabel(user.role)}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Date d'inscription
                    </div>
                    <p className="font-medium">
                      {new Date(user.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Dernière mise à jour
                    </div>
                    <p className="font-medium">
                      {new Date(user.updated_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {user.email_verified_at && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Email vérifié</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Le {new Date(user.email_verified_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions et statistiques */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Link href={`/admin/users/${user.id}/edit`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier l'utilisateur
                  </Button>
                </Link>

                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Envoyer un email
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Réinitialiser le mot de passe
                </Button>

                {user.status === 'active' ? (
                  <Button variant="outline" className="w-full justify-start text-amber-600">
                    <XCircle className="h-4 w-4 mr-2" />
                    Désactiver
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full justify-start text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Activer
                  </Button>
                )}

                <div className="pt-4 border-t">
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => {
                      if (confirm(`Êtes-vous sûr de vouloir supprimer ${user.name} ?`)) {
                        // router.delete(`/admin/users/${user.id}`)
                      }
                    }}
                  >
                    Supprimer l'utilisateur
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
}