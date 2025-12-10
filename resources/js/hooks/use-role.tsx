import { SharedData } from "@/types";
import { usePage } from "@inertiajs/react";

export function useRole(){
    const { auth } = usePage<SharedData>().props;
    return auth?.user?.role;
}
export function useIsAdmin(){
    const { auth } = usePage<SharedData>().props;
    return auth?.user?.role === 'admin';
}
export function useIsSuperAdmin(){
    const { auth } = usePage<SharedData>().props;
    return auth?.user?.role === 'super_admin';
}
export function useIsDirecteur(){
    const { auth } = usePage<SharedData>().props;
    return auth?.user?.role === 'directeur';
}
export function useIsEmploye(){
    const { auth } = usePage<SharedData>().props;
    return auth?.user?.role === 'employe';
}
export function usePeutModifier(){
    const { auth } = usePage<SharedData>().props;
    return auth?.user?.role === 'admin' || auth?.user?.role === 'super_admin' ;
}
    