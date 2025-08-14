import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getRouteTitle, getRouteDescription } from '../config/routes'

/**
 * Hook para gerenciar automaticamente o título e meta tags da página
 * baseado na rota atual
 */
export const usePageTitle = () => {
  const location = useLocation()

  useEffect(() => {
    const title = getRouteTitle(location.pathname)
    const description = getRouteDescription(location.pathname)

    // Atualizar título da página
    document.title = title

    // Atualizar meta description
    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      document.head.appendChild(metaDescription)
    }
    metaDescription.setAttribute('content', description)

    // Atualizar meta og:title
    let ogTitle = document.querySelector('meta[property="og:title"]')
    if (!ogTitle) {
      ogTitle = document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      document.head.appendChild(ogTitle)
    }
    ogTitle.setAttribute('content', title)

    // Atualizar meta og:description
    let ogDescription = document.querySelector('meta[property="og:description"]')
    if (!ogDescription) {
      ogDescription = document.createElement('meta')
      ogDescription.setAttribute('property', 'og:description')
      document.head.appendChild(ogDescription)
    }
    ogDescription.setAttribute('content', description)

    // Atualizar meta og:url
    let ogUrl = document.querySelector('meta[property="og:url"]')
    if (!ogUrl) {
      ogUrl = document.createElement('meta')
      ogUrl.setAttribute('property', 'og:url')
      document.head.appendChild(ogUrl)
    }
    ogUrl.setAttribute('content', window.location.href)

    // Atualizar canonical URL
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', window.location.href)

    // Log para debug
    console.log(`📄 Página atualizada: ${title}`)
    console.log(`📝 Descrição: ${description}`)
    console.log(`🔗 URL: ${window.location.href}`)

  }, [location.pathname])

  return {
    title: getRouteTitle(location.pathname),
    description: getRouteDescription(location.pathname),
    path: location.pathname
  }
}

export default usePageTitle

