import React from 'react';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';
import DashboardActivity from './DashboardActivity';

interface DashboardProps {
  activeRoute?: string;
  stats?: {
    users: number;
    products: number;
    revenue: number;
  };
}

export default function Dashboard({ activeRoute = '/dashboard', stats }: DashboardProps) {
  return (
    <DashboardLayout activeRoute={activeRoute}>
      <PageHeader
        title="Tableau de bord"
        description="Bienvenue sur votre espace d'administration"
        actions={
          <Button>
            Nouvelle action
          </Button>
        }
      />
      
      {/* Contenu du dashboard */}
      <div className="">
        {/* Cartes de statistiques */}
        <DashboardActivity/>
      </div>
    </DashboardLayout>
  );
}