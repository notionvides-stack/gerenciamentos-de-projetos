import { createFileRoute } from "@tanstack/react-router";
import { CollectionScreen } from '@/components/collection-screen';
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: 'Acompanhamento de coleção | Gerenciador de Projeto' },
    { name: 'description', content: 'Acompanhamento de produtos, envios, pilotos e prazos da coleção.' },
    { property: 'og:title', content: 'Acompanhamento de coleção | Gerenciador de Projeto' },
    { property: 'og:description', content: 'Acompanhamento de produtos, envios, pilotos e prazos da coleção.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: CollectionScreen,
});
