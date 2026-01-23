// app/manifest.ts
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'personal-dashboard',
        short_name: 'PersonDash', // El nombre que se ve debajo del icono en el celular
        description: 'Personal Dashboard',
        start_url: '/',
        display: 'standalone', // Esto elimina la barra de URL del navegador (sensación de app nativa)
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/favicon.ico',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/favicon.ico',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}