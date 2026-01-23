import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Personal Dashboard',
        short_name: 'Dashboard',
        description: 'Dashboard personal con tareas, notas y gastos rápidos',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/favicon.ico',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/favicon.ico',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
        ],
    }
}